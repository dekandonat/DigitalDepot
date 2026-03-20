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
    const [newMainCatName, setNewMainCatName] = useState('');
    const [newSubCatName, setNewSubCatName] = useState('');
    
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchSubmissions();
        fetchCategories();
    }, []);

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const fetchSubmissions = async () => {
        try {
            const data = await apiFetch('/used-products/admin/all');
            if (data.result === 'success') {
                setSubmissions(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await apiFetch('/category');
            if (data.result === 'success') {
                setAllCategories(data.data);
                const mains = data.data.filter(c => c.parentId === null);
                setMainCategories(mains);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleMainCatChange = (e) => {
        const val = e.target.value;
        setSelectedMainCat(val);
        setSelectedSubCat('');
        setNewMainCatName('');
        setNewSubCatName('');

        if (val && val !== 'new') {
            const subs = allCategories.filter(c => c.parentId === parseInt(val));
            setSubCategories(subs);
        } else {
            setSubCategories([]);
        }
    };

    const handleOfferChange = (id, value) => {
        setOfferInputs(prev => ({ ...prev, [id]: value }));
    };

    const sendOffer = async (id) => {
        const price = offerInputs[id];
        if (!price || price <= 0) {
            setModal({ isOpen: true, title: 'Hiba', message: 'Kérlek adj meg egy érvényes ajánlati árat!' });
            return;
        }

        try {
            const data = await apiFetch('/used-products/admin/status', {
                method: 'PATCH',
                body: { submissionId: id, status: 'accepted', offerPrice: price }
            });
            if (data.result === 'success') {
                showToast('Ajánlat elküldve a felhasználónak!');
                fetchSubmissions();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startListing = (sub) => {
        setEditingProduct(sub);
        setEditName(sub.productName);
        setEditDesc(sub.productDescription);
        setEditPriceFormatted(formatPrice(sub.adminOfferPrice));
        setEditCondition(sub.conditionState);
        setListingImage(null);
        setSelectedMainCat('');
        setSelectedSubCat('');
        setNewMainCatName('');
        setNewSubCatName('');
    };

    const handleListProduct = async () => {
        if (!selectedMainCat) {
            setModal({ isOpen: true, title: 'Hiba', message: 'Kérlek válassz legalább egy fő kategóriát!' });
            return;
        }

        if (selectedMainCat === 'new' && !newMainCatName.trim()) {
            setModal({ isOpen: true, title: 'Hiba', message: 'Kérlek add meg az új fő kategória nevét!' });
            return;
        }

        if (selectedSubCat === 'new' && !newSubCatName.trim()) {
            setModal({ isOpen: true, title: 'Hiba', message: 'Kérlek add meg az új alkategória nevét!' });
            return;
        }

        const formData = new FormData();
        formData.append('submissionId', editingProduct.submissionId);
        formData.append('productName', editName);
        formData.append('productDescription', editDesc);
        formData.append('productPrice', parsePrice(editPriceFormatted));
        formData.append('conditionState', editCondition);
        formData.append('existingImage', editingProduct.productImage);
        
        formData.append('categoryId', selectedSubCat !== 'new' ? selectedSubCat : '');
        formData.append('selectedMainCat', selectedMainCat !== 'new' ? selectedMainCat : '');
        formData.append('newMainCategory', newMainCatName);
        formData.append('newSubCategory', newSubCatName);

        if (listingImage) {
            formData.append('file', listingImage);
        }

        try {
            const response = await fetch('/used-products/admin/list-product', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });
            const data = await response.json();

            if (data.result === 'success') {
                showToast('Termék sikeresen listázva a webshopban!');
                setEditingProduct(null);
                fetchSubmissions();
                fetchCategories();
            } else {
                setModal({ isOpen: true, title: 'Hiba', message: data.message || 'Hiba történt a mentés során.' });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const incomingSubmissions = submissions.filter(s => s.status === 'pending');
    const waitingListSubmissions = submissions.filter(s => s.status === 'offer_accepted');

    return (
        <div className="adminUsedContainer">
            <CustomModal 
                isOpen={modal.isOpen} 
                title={modal.title} 
                message={modal.message} 
                onConfirm={() => setModal({ ...modal, isOpen: false })} 
            />
            {toast && <div className="toastMessage">{toast}</div>}

            <h2>Használt termékek kezelése</h2>

            <div className="tabHeader">
                <button className={activeTab == 'incoming' ? 'tabButton active' : 'tabButton'} onClick={() => setActiveTab('incoming')}>Beérkező leadások</button>
                <button className={activeTab == 'waiting' ? 'tabButton active' : 'tabButton'} onClick={() => setActiveTab('waiting')}>Listázásra váró</button>
            </div>

            <div className="tabContent">
                {editingProduct && (
                    <div className="listingForm">
                        <h3>Termék listázása a shopba</h3>
                        
                        <div className="formGroup">
                            <label>Terméknév:</label>
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        
                        <div className="formGroup">
                            <label>Leírás:</label>
                            <textarea value={editDesc} rows="4" onChange={(e) => setEditDesc(e.target.value)} />
                        </div>
                        
                        <div className="formGroup">
                            <label>Ár (HUF):</label>
                            <input type="text" value={editPriceFormatted} onChange={(e) => setEditPriceFormatted(formatPrice(e.target.value))} />
                        </div>
                        
                        <div className="formGroup">
                            <label>Állapot:</label>
                            <select value={editCondition} onChange={(e) => setEditCondition(e.target.value)}>
                                <option value="használt">Használt</option>
                                <option value="felbontott">Felbontott</option>
                                <option value="bontatlan">Bontatlan</option>
                            </select>
                        </div>

                        <div className="categorySelection">
                            <h4>Kategória besorolás</h4>
                            
                            <div className="catRow">
                                <label>Fő kategória:</label>
                                <select value={selectedMainCat} onChange={handleMainCatChange}>
                                    <option value="">-- Válassz --</option>
                                    {mainCategories.map(c => (
                                        <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                                    ))}
                                    <option value="new">+ Új fő kategória létrehozása...</option>
                                </select>
                                
                                {selectedMainCat === 'new' && (
                                    <input 
                                        type="text" 
                                        placeholder="Új fő kategória neve" 
                                        value={newMainCatName}
                                        onChange={(e) => setNewMainCatName(e.target.value)}
                                    />
                                )}
                            </div>

                            {(selectedMainCat || selectedMainCat === 'new') && (
                                <div className="catRow">
                                    <label>Alkategória:</label>
                                    <select value={selectedSubCat} onChange={(e) => setSelectedSubCat(e.target.value)}>
                                        <option value="">-- Válassz (opcionális) --</option>
                                        {subCategories.map(c => (
                                            <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>
                                        ))}
                                        <option value="new">+ Új alkategória létrehozása...</option>
                                    </select>
                                    
                                    {selectedSubCat === 'new' && (
                                        <input 
                                            type="text" 
                                            placeholder="Új alkategória neve" 
                                            value={newSubCatName}
                                            onChange={(e) => setNewSubCatName(e.target.value)}
                                        />
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="formGroup">
                            <label>Termékkép (elhagyható, ha jó az eredeti):</label>
                            <input type="file" onChange={(e) => setListingImage(e.target.files[0])} />
                        </div>
                        
                        <div className="listingButtons">
                            <button className="acceptBtn" onClick={handleListProduct}>Termék listázása</button>
                            <button className="rejectBtn" onClick={() => setEditingProduct(null)}>Mégse</button>
                        </div>
                    </div>
                )}

                {!editingProduct && (
                    <div className="adminSubGrid">
                        {activeTab == 'incoming' && incomingSubmissions.map(sub => (
                            <div key={sub.submissionId} className="adminSubCard">
                                <div className="subHeader">
                                    <span>#{sub.submissionId}</span>
                                    <span>{new Date(sub.submissionDate).toLocaleDateString()}</span>
                                </div>
                                <h4>{sub.productName}</h4>
                                <p><strong>Felhasználó:</strong> {sub.userName}</p>
                                <p><strong>Állapot:</strong> {sub.conditionState}</p>
                                <p style={{fontSize: '0.9rem', color: '#64748b', margin: '10px 0'}}>{sub.productDescription}</p>
                                {sub.productImage && (
                                    <img src={`/${sub.productImage}`} alt="Termék" className="subImg" />
                                )}
                                <div className="offerInput">
                                    <input 
                                        type="number" 
                                        placeholder="Ár (Ft)" 
                                        value={offerInputs[sub.submissionId] || ''} 
                                        onChange={(e) => handleOfferChange(sub.submissionId, e.target.value)}
                                    />
                                    <button className="acceptBtn" onClick={() => sendOffer(sub.submissionId)}>Küldés</button>
                                </div>
                            </div>
                        ))}

                        {activeTab == 'waiting' && waitingListSubmissions.map(sub => (
                            <div key={sub.submissionId} className="adminSubCard">
                                <div className="subHeader">
                                    <span>#{sub.submissionId}</span>
                                    <span>{new Date(sub.submissionDate).toLocaleDateString()}</span>
                                </div>
                                <h4>{sub.productName}</h4>
                                <p><strong>Felhasználó:</strong> {sub.userName}</p>
                                <div className="offerBox">
                                    <span>Elfogadott ár:</span>
                                    <span className="offerPrice">{formatPrice(sub.adminOfferPrice)} Ft</span>
                                </div>
                                {sub.productImage && (
                                    <img src={`/${sub.productImage}`} alt="Termék" className="subImg" />
                                )}
                                <button className="acceptBtn" style={{marginTop: 'auto'}} onClick={() => startListing(sub)}>
                                    Listázás indítása
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}