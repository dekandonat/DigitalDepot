import React, { useState, useEffect } from 'react';
import { apiFetch } from '../assets/util/fetch';
import CustomModal from './CustomModal';
import './AdminUsedProducts.css';

const formatPrice = (price) => {
    if (price === undefined || price === null || price === '') return '';
    return parseInt(price).toLocaleString('hu-HU').replaceAll(',', ' '); 
};

const parsePrice = (formattedPrice) => {
    if (!formattedPrice) return 0;
    return parseInt(formattedPrice.toString().replace(/[^0-9]/g, '')) || 0;
};

export default function AdminUsedProducts() {
    const [activeTab, setActiveTab] = useState('incoming');
    const [submissions, setSubmissions] = useState([]);
    const [offerInputs, setOfferInputs] = useState({});
    
    const [allCategories, setAllCategories] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    
    const [editingProduct, setEditingProduct] = useState(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editPriceFormatted, setEditPriceFormatted] = useState('');
    const [editCondition, setEditCondition] = useState('');
    const [listingImage, setListingImage] = useState(null);
    
    const [selectedMainCat, setSelectedMainCat] = useState('');
    const [selectedSubCat, setSelectedSubCat] = useState('');

    const [isAddingNewMain, setIsAddingNewMain] = useState(false);
    const [newMainName, setNewMainName] = useState('');
    const [isAddingNewSub, setIsAddingNewSub] = useState(false);
    const [newSubName, setNewSubName] = useState('');

    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
    const [toast, setToast] = useState('');

    const token = localStorage.getItem('token');

    const closeModal = () => {
        setModal({ ...modal, isOpen: false });
    };

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => {
            setToast('');
        }, 3000);
    };

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, [token]);

    useEffect(() => {
        if (selectedMainCat && !isAddingNewMain) {
            const subs = allCategories.filter(c => c.parentId == selectedMainCat);
            setSubCategories(subs);
            setSelectedSubCat('');
        } else {
            setSubCategories([]);
        }
    }, [selectedMainCat, allCategories, isAddingNewMain]);

    async function fetchData() {
        try {
            const data = await apiFetch('/used-products/admin/all', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(data.result == 'success') setSubmissions(data.data);
        } catch (err) {
            console.log(err.message);
        }
    }

    async function fetchCategories() {
        try {
            const data = await apiFetch('/category');
            if(data.data) {
                setAllCategories(data.data);
                setMainCategories(data.data.filter(c => c.parentId === null));
            }
        } catch(err) {
            console.log(err);
        }
    }

    function handleOfferChange(id, value) {
        const newOffers = Object.assign({}, offerInputs);
        newOffers[id] = value;
        setOfferInputs(newOffers);
    }

    async function handleAction(id, status) {
        const price = offerInputs[id] || 0;

        if (status == 'accepted') {
            if (!price || price <= 0) {
                setModal({ isOpen: true, title: 'Figyelem', message: 'Kérlek adj meg egy érvényes ajánlati árat!' });
                return;
            }
        }

        try {
            const data = await apiFetch('/used-products/admin/status', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: {
                    submissionId: id,
                    status: status,
                    offerPrice: price
                }
            });

            if (data.result == 'success') {
                if (status == 'rejected') {
                    showToast('Termék elutasítva!');
                } else {
                    showToast('Ajánlat sikeresen elküldve!');
                }
                fetchData();
            }
        } catch (err) {
            setModal({ isOpen: true, title: 'Hiba', message: 'Hiba történt az állapot frissítésekor.' });
        }
    }

    function startListing(sub) {
        setEditingProduct(sub);
        setEditName(sub.productName);
        setEditDesc(sub.productDescription);
        setEditPriceFormatted(formatPrice(sub.adminOfferPrice));
        setEditCondition(sub.conditionState);
        setListingImage(null); 
        
        setSelectedMainCat('');
        setSelectedSubCat('');
        setIsAddingNewMain(false);
        setIsAddingNewSub(false);
    }

    function cancelListing() {
        setEditingProduct(null);
    }

    async function createCategory(name, parentId) {
        try {
            const result = await apiFetch('/category', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: {
                    categoryName: name,
                    parentId: parentId
                }
            });
            return result.insertId;
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async function submitListing() {
        let finalCategoryId = selectedSubCat;

        if (isAddingNewMain) {
            if (!newMainName.trim()) {
                setModal({ isOpen: true, title: 'Figyelem', message: 'Add meg az új főkategória nevét!' });
                return;
            }
            const newMainId = await createCategory(newMainName, null);
            if (!newMainId) {
                setModal({ isOpen: true, title: 'Hiba', message: 'Hiba a főkategória létrehozásakor.' });
                return;
            }
            
            if (isAddingNewSub) {
                if (!newSubName.trim()) {
                    setModal({ isOpen: true, title: 'Figyelem', message: 'Add meg az új alkategória nevét!' });
                    return;
                }
                const newSubId = await createCategory(newSubName, newMainId);
                if (!newSubId) {
                    setModal({ isOpen: true, title: 'Hiba', message: 'Hiba az alkategória létrehozásakor.' });
                    return;
                }
                finalCategoryId = newSubId;
            } else {
                finalCategoryId = newMainId; 
            }
        } 
        else if (isAddingNewSub) {
            if (!selectedMainCat) {
                setModal({ isOpen: true, title: 'Figyelem', message: 'Válassz főkategóriát!' });
                return;
            }
            if (!newSubName.trim()) {
                setModal({ isOpen: true, title: 'Figyelem', message: 'Add meg az új alkategória nevét!' });
                return;
            }
            const newSubId = await createCategory(newSubName, selectedMainCat);
            if (!newSubId) {
                setModal({ isOpen: true, title: 'Hiba', message: 'Hiba az alkategória létrehozásakor.' });
                return;
            }
            finalCategoryId = newSubId;
        }
        else {
            if (!selectedMainCat) {
                setModal({ isOpen: true, title: 'Figyelem', message: 'Válassz főkategóriát!' });
                return;
            }
            if (subCategories.length > 0 && !selectedSubCat) {
                setModal({ isOpen: true, title: 'Figyelem', message: 'Válassz alkategóriát!' });
                return;
            }
            if (!finalCategoryId) finalCategoryId = selectedMainCat;
        }

        const formData = new FormData();
        formData.append('submissionId', editingProduct.submissionId);
        formData.append('productName', editName);
        formData.append('productDescription', editDesc);
        formData.append('productPrice', parsePrice(editPriceFormatted));
        formData.append('categoryId', finalCategoryId);
        formData.append('conditionState', editCondition);
        
        if (listingImage) {
            formData.append('file', listingImage);
        } else if (editingProduct.productImage) {
            formData.append('existingImage', editingProduct.productImage);
        } else {
            setModal({ isOpen: true, title: 'Figyelem', message: 'Hiba: Nincs termékkép! Kérlek tölts fel egyet.' });
            return;
        }

        try {
            const response = await fetch('/used-products/admin/list-product', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            const result = await response.json();

            if(result.result == 'success') {
                showToast('Termék sikeresen listázva!');
                fetchCategories();
                setEditingProduct(null);
                fetchData();
            } else {
                setModal({ isOpen: true, title: 'Hiba', message: 'Hiba: ' + result.message });
            }
        } catch(err) {
            setModal({ isOpen: true, title: 'Hiba', message: 'Hiba a listázás során.' });
        }
    }

    const handlePriceInputChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, '');
        if (rawValue === '') {
            setEditPriceFormatted('');
        } else {
            setEditPriceFormatted(formatPrice(rawValue));
        }
    };

    const incomingSubmissions = submissions.filter(sub => ['pending', 'accepted'].includes(sub.status));
    const waitingListSubmissions = submissions.filter(sub => sub.status == 'offer_accepted');

    const getStatusLabel = (status, price) => {
        switch(status) {
            case 'pending': return 'Feldolgozás alatt';
            case 'accepted': return `Ajánlat elküldve (${formatPrice(price)} Ft)`;
            case 'offer_accepted': return `Felhasználó elfogadta (${formatPrice(price)} Ft)`;
            default: return status;
        }
    };

    if (editingProduct) {
        return (
            <div className="adminUsedContainer">
                <CustomModal 
                    isOpen={modal.isOpen}
                    title={modal.title}
                    message={modal.message}
                    onConfirm={closeModal}
                    type="alert"
                />
                {toast && <div className="toastMessage">{toast}</div>}

                <h2>Termék listázása</h2>
                <div className="listingForm">
                    <div className="formGroup">
                        <label>Termék neve:</label>
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                    </div>
                    <div className="formGroup">
                        <label>Leírás:</label>
                        <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                    </div>
                    <div className="formGroup">
                        <label>Ár (Ft):</label>
                        <input 
                            type="text" 
                            value={editPriceFormatted} 
                            onChange={handlePriceInputChange} 
                        />
                    </div>
                    <div className="formGroup">
                        <label>Állapot:</label>
                        <select value={editCondition} onChange={e => setEditCondition(e.target.value)}>
                            <option value="bontatlan">Bontatlan</option>
                            <option value="felbontott">Felbontott</option>
                            <option value="használt">Használt</option>
                        </select>
                    </div>
                    <div className="formGroup">
                        <label>Kép módosítása/feltöltése:</label>
                        {editingProduct.productImage && !listingImage && (
                            <div style={{marginBottom: '10px'}}>
                                <small>Jelenlegi kép: </small>
                                <img src={`/${editingProduct.productImage}`} alt="Jelenlegi" style={{height: '50px', verticalAlign: 'middle'}}/>
                            </div>
                        )}
                        <input type="file" onChange={(e) => setListingImage(e.target.files[0])} accept="image/*" />
                    </div>

                    <div className="categorySelection">
                        <h3>Kategória kiválasztása</h3>
                        
                        <div className="formGroup">
                            <label>Főkategória:</label>
                            {!isAddingNewMain ? (
                                <div className="selectWithButton">
                                    <select value={selectedMainCat} onChange={e => setSelectedMainCat(e.target.value)}>
                                        <option value="">Válassz...</option>
                                        {mainCategories.map(cat => (
                                            <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                                        ))}
                                    </select>
                                    <button className="addCatBtn" onClick={() => setIsAddingNewMain(true)}>Új kategória</button>
                                </div>
                            ) : (
                                <div className="inputWithButton">
                                    <input 
                                        type="text" 
                                        placeholder="Új főkategória neve" 
                                        value={newMainName} 
                                        onChange={e => setNewMainName(e.target.value)} 
                                    />
                                    <button className="cancelCatBtn" onClick={() => setIsAddingNewMain(false)}>Mégse</button>
                                </div>
                            )}
                        </div>

                        {(selectedMainCat || isAddingNewMain) && (
                            <div className="formGroup">
                                <label>Alkategória:</label>
                                {!isAddingNewSub ? (
                                    <div className="selectWithButton">
                                        <select value={selectedSubCat} onChange={e => setSelectedSubCat(e.target.value)} disabled={isAddingNewMain}>
                                            <option value="">Válassz...</option>
                                            {subCategories.map(cat => (
                                                <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                                            ))}
                                        </select>
                                        <button className="addCatBtn" onClick={() => setIsAddingNewSub(true)}>Új alkategória</button>
                                    </div>
                                ) : (
                                    <div className="inputWithButton">
                                        <input 
                                            type="text" 
                                            placeholder="Új alkategória neve" 
                                            value={newSubName} 
                                            onChange={e => setNewSubName(e.target.value)} 
                                        />
                                        <button className="cancelCatBtn" onClick={() => setIsAddingNewSub(false)}>Mégse</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="listingButtons">
                        <button className="acceptBtn" onClick={submitListing}>Listázás</button>
                        <button className="rejectBtn" onClick={cancelListing}>Mégse</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="adminUsedContainer">
            <CustomModal 
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                onConfirm={closeModal}
                type="alert"
            />
            {toast && <div className="toastMessage">{toast}</div>}

            <h2>Használt termékek kezelése</h2>
            
            <div className="tabHeader">
                <button 
                    className={`tabButton ${activeTab == 'incoming' ? 'active' : ''}`}
                    onClick={() => setActiveTab('incoming')}
                >
                    Beérkezett
                </button>
                <button 
                    className={`tabButton ${activeTab == 'waiting' ? 'active' : ''}`}
                    onClick={() => setActiveTab('waiting')}
                >
                    Listázásra váró
                </button>
            </div>

            <div className="adminSubGrid">
                {activeTab == 'incoming' && incomingSubmissions.map(sub => (
                    <div key={sub.submissionId} className="adminSubCard">
                        <div className="subHeader">
                            <span>#{sub.submissionId}</span>
                            <span className="subDate">{new Date(sub.submissionDate).toLocaleDateString()}</span>
                        </div>
                        <h4>{sub.productName}</h4>
                        <p className="subUser">Felhasználó: {sub.userName} ({sub.email})</p>
                        <p className="subUser">Bankszámla: <span className="bankProvided">{sub.bankAccountNumber}</span></p>
                        <p className="subCond">Állapot: <strong>{sub.conditionState}</strong></p>
                        <pre className="subDesc">{sub.productDescription}</pre>
                        
                        {sub.productImage && (
                            <img src={`/${sub.productImage}`} alt="Termék" className="subImg" />
                        )}

                        <p className={`subStatus ${sub.status}`}>
                            Státusz: {getStatusLabel(sub.status, sub.adminOfferPrice)}
                        </p>
                        
                        <div className="subActions">
                            {sub.status == 'pending' ? (
                                <>
                                    <div className="offerInput">
                                        <input 
                                            type="number" 
                                            placeholder="Ajánlott ár (Ft)"
                                            onChange={(e) => handleOfferChange(sub.submissionId, e.target.value)}
                                        />
                                    </div>
                                    <div className="btnGroup">
                                        <button 
                                            className="acceptBtn"
                                            onClick={() => handleAction(sub.submissionId, 'accepted')}
                                        >
                                            Ajánlat küldése
                                        </button>
                                        <button 
                                            className="rejectBtn"
                                            onClick={() => handleAction(sub.submissionId, 'rejected')}
                                        >
                                            Elutasítás
                                        </button>
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                ))}

                {activeTab == 'waiting' && waitingListSubmissions.map(sub => (
                    <div key={sub.submissionId} className="adminSubCard">
                        <div className="subHeader">
                            <span>#{sub.submissionId}</span>
                            <span className="subDate">{new Date(sub.submissionDate).toLocaleDateString()}</span>
                        </div>
                        <h4>{sub.productName}</h4>
                        <p className="subUser">Felhasználó: {sub.userName}</p>
                        <p className="subCond">Állapot: <strong>{sub.conditionState}</strong></p>
                        <div className="offerBox">
                            <span>Elfogadott ár:</span>
                            <span className="offerPrice">{formatPrice(sub.adminOfferPrice)} Ft</span>
                        </div>
                        {sub.productImage && (
                            <img src={`/${sub.productImage}`} alt="Termék" className="subImg" />
                        )}
                        <div className="subActions">
                            <button className="acceptBtn" onClick={() => startListing(sub)}>
                                Termék listázása
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}