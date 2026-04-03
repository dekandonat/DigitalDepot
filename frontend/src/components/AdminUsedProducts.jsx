import React, { useState, useEffect } from 'react';
import { apiFetch } from '../assets/util/fetch';
import CustomModal from './CustomModal';
import './AdminUsedProducts.css';

const formatPrice = (price) => {
    return parseInt(price).toLocaleString('hu-HU').replaceAll(',', ' ');
};

export default function AdminUsedProducts() {
    const [submissions, setSubmissions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [offerPrice, setOfferPrice] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showListingPanel, setShowListingPanel] = useState(false);
    const [publishedProduct, setPublishedProduct] = useState({ productName: '', productDescription: '', productPrice: '', categoryId: '' });
    const [categories, setCategories] = useState([]);
    const [newImageFile, setNewImageFile] = useState(null);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
    
    useEffect(() => {
        fetchSubmissions();
        fetchCategories();
    }, []);

    const fetchSubmissions = async () => {
        setIsLoading(true);
        try {
            const data = await apiFetch('/used-products/admin/all');
            if (data.result === 'success') {
                setSubmissions(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const data = await apiFetch('/category');
            if (data.result === 'success') {
                setCategories(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleOfferSubmit = async (submissionId) => {
        if (!offerPrice) return;
        try {
            const result = await apiFetch('/used-products/admin/status', {
                method: 'PATCH',
                body: { submissionId, status: 'accepted', offerPrice: offerPrice }
            });
            if (result.result === 'success') {
                setSelectedSubmission(null);
                setOfferPrice('');
                fetchSubmissions();
            } else {
                setErrorMessage(result.message || 'Hiba történt.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReject = async (submissionId) => {
        if (!window.confirm("Biztosan elutasítod ezt a beküldést?")) return;
        try {
            const result = await apiFetch('/used-products/admin/status', {
                method: 'PATCH',
                body: { submissionId, status: 'rejected' }
            });
            if (result.result === 'success') {
                fetchSubmissions();
            } else {
                setErrorMessage(result.message || 'Hiba történt.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handlePublishProduct = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        
        const formData = new FormData();
        formData.append('submissionId', selectedSubmission.submissionId);
        formData.append('productName', publishedProduct.productName);
        formData.append('productDescription', publishedProduct.productDescription);
        formData.append('productPrice', publishedProduct.productPrice);
        formData.append('conditionState', selectedSubmission.conditionState);
        
        const existingImgPath = `${selectedSubmission.productImage}`;
        formData.append('existingImage', existingImgPath);
        
        if (newImageFile) {
            formData.append('file', newImageFile);
        }

        const categorySelect = document.getElementById('publishedProductCategory');
        const selectedCategoryId = categorySelect.value;
        const mainCatInput = publishedProduct.newMainCategory;
        const subCatInput = publishedProduct.newSubCategory;

        if (mainCatInput) {
            formData.append('newMainCategory', mainCatInput);
            if (subCatInput) {
                formData.append('newSubCategory', subCatInput);
            }
        } else if (subCatInput && selectedCategoryId) {
            formData.append('newSubCategory', subCatInput);
            formData.append('selectedMainCat', selectedCategoryId);
        } else if (selectedCategoryId) {
            formData.append('categoryId', selectedCategoryId);
        } else {
            setModal({ isOpen: true, title: 'Kategória hiba', message: 'Kérlek válassz vagy hozz létre egy kategóriát!' });
            return;
        }

        try {
            const result = await apiFetch(`/used-products/admin/list-product`, {
                method: 'POST',
                body: formData,
                isFormData: true
            });

            if (result.result === 'success') {
                setModal({ isOpen: true, title: 'Siker', message: 'Termék sikeresen piacra dobva!' });
                setShowListingPanel(false);
                setSelectedSubmission(null);
                fetchSubmissions();
            } else {
                setModal({ isOpen: true, title: 'Hiba', message: result.message || 'Hiba történt a publikálás során.' });
            }
        } catch (error) {
            console.error(error);
            setModal({ isOpen: true, title: 'Hiba', message: 'Hálózati hiba történt.' });
        }
    };

    const handleNewImageChange = (event) => {
        setNewImageFile(event.target.files[0]);
    };

    const startListing = (submission) => {
        setSelectedSubmission(submission);
        setPublishedProduct({ productName: submission.productName, productDescription: submission.productDescription, productPrice: '', categoryId: '' });
        setShowListingPanel(true);
    };

    return (
        <div className="adminUsedProductsWrapper">
            <CustomModal
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                onConfirm={() => setModal({ ...modal, isOpen: false })}
            />
            <h2>Használt Termék Beküldések</h2>
            
            {isLoading ? <p>Töltés...</p> : (
                <div className="submissionGrid">
                    {submissions.length === 0 ? <p>Nincsenek beküldések.</p> : submissions.map(sub => (
                        <div key={sub.submissionId} className="submissionCard">
                            <img src={`/${sub.productImage}`} alt={sub.productName} className="submissionCardImg" />
                            <div className="submissionCardContent">
                                <h3>{sub.productName}</h3>
                                <p className="submissionCardDesc">{sub.productDescription}</p>
                                <p>Állapot: <strong>{sub.conditionState}</strong></p>
                                <p>Beküldő ID: {sub.userId}</p>
                                <p>Dátum: {new Date(sub.submissionDate).toLocaleDateString()}</p>
                                
                                {sub.status === 'pending' && (
                                    <div className="submissionActionArea">
                                        <input type="number" placeholder="Ajánlati ár (Ft)" value={offerPrice} onChange={e => setOfferPrice(e.target.value)} />
                                        <div className="decisionButtonRow">
                                            <button onClick={() => handleOfferSubmit(sub.submissionId)} className="acceptOfferBtn">Ajánlat küldése</button>
                                            <button onClick={() => handleReject(sub.submissionId)} className="rejectOfferBtn">Elutasítás</button>
                                        </div>
                                    </div>
                                )}
                                
                                {sub.status === 'offer_accepted' && (
                                    <button onClick={() => startListing(sub)} className="listProductBtn">Piacra dobás</button>
                                )}
                                
                                <span className={`statusLabel ${sub.status}`}>
                                    {sub.status === 'pending' ? 'Értékelés alatt' : sub.status === 'accepted' ? 'Ajánlat kiküldve' : sub.status === 'offer_accepted' ? 'Felhasználó elfogadta' : sub.status === 'rejected' ? 'Elutasítva' : 'Publikálva'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showListingPanel && selectedSubmission && (
                <div className="listingPanelOverlay">
                    <div className="listingPanel">
                        <h3>Termék Publikálása a Shopba</h3>
                        <form onSubmit={handlePublishProduct}>
                            <input type="text" value={publishedProduct.productName} onChange={e => setPublishedProduct({...publishedProduct, productName: e.target.value})} placeholder="Termék neve" required />
                            <textarea value={publishedProduct.productDescription} onChange={e => setPublishedProduct({...publishedProduct, productDescription: e.target.value})} placeholder="Leírás" rows="4" required></textarea>
                            <input type="number" value={publishedProduct.productPrice} onChange={e => setPublishedProduct({...publishedProduct, productPrice: e.target.value})} placeholder="Eladási ár" required />
                            
                            <select id="publishedProductCategory">
                                <option value="">Válassz főkategóriát (vagy hozz létre)</option>
                                {categories.filter(c => c.parentId === null).map(cat => (
                                    <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
                                ))}
                            </select>
                            
                            <div className="newCategoryRow">
                                <input type="text" placeholder="Új főkategória neve (opcionális)" value={publishedProduct.newMainCategory} onChange={e => setPublishedProduct({...publishedProduct, newMainCategory: e.target.value})} />
                                <input type="text" placeholder="Új alkategória neve (opcionális)" value={publishedProduct.newSubCategory} onChange={e => setPublishedProduct({...publishedProduct, newSubCategory: e.target.value})} />
                            </div>

                            <div className="imageListingRow">
                                <img src={`/${selectedSubmission.productImage}`} alt="Eredeti kép" className="listingImagePreview" />
                                <input type="file" accept="image/*" onChange={handleNewImageChange} />
                                <label>(Opcionális új kép feltöltése)</label>
                            </div>
                            
                            <div className="listingActionButtons">
                                <button type="submit" className="saveListingBtn">Termék Publikálása</button>
                                <button type="button" onClick={() => setShowListingPanel(false)} className="cancelListingBtn">Mégse</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}