import React, { useState, useEffect } from 'react';
import { apiFetch } from '../assets/util/fetch';
import CustomModal from './CustomModal';
import './UsedProductPage.css';

const formatPrice = (price) => {
    return parseInt(price).toLocaleString('hu-HU').replaceAll(',', ' ');
};

export default function UsedProductPage(props) {
    const [activeTab, setActiveTab] = useState('form');
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [conditionState, setConditionState] = useState('használt');
    const [image, setImage] = useState(null);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [hasBankAccount, setHasBankAccount] = useState(null);
    const [mySubmissions, setMySubmissions] = useState([]);
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', action: null });

    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('email');

    useEffect(() => {
        if(userEmail) setEmail(userEmail);
        checkUserProfile();
        fetchMySubmissions();
    }, [props.refreshTrigger]);

    function handleProductNameChange(event) {
        setProductName(event.target.value);
    }

    function handleProductDescriptionChange(event) {
        setProductDescription(event.target.value);
    }

    function handleConditionChange(event) {
        setConditionState(event.target.value);
    }

    function handleEmailChange(event) {
        setEmail(event.target.value);
    }

    function handleImageChange(event) {
        setImage(event.target.files[0]);
    }

    const closeModal = () => {
        const pendingAction = modal.action;
        setModal({ isOpen: false, title: '', message: '', action: null });
        if (pendingAction) {
            pendingAction();
        }
    };

    async function checkUserProfile() {
        try {
            const data = await apiFetch('/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (data.result == 'success') {
                if (data.data.bankAccountNumber && data.data.bankAccountNumber.trim() != '') {
                    setHasBankAccount(true);
                } else {
                    setHasBankAccount(false);
                }
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    async function fetchMySubmissions() {
        try {
            const data = await apiFetch('/used-products/my-submissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if(data.result == 'success'){
                setMySubmissions(data.data);
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        
        if (!image) {
            setMessage('Kép feltöltése kötelező!');
            return;
        }

        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('productDescription', productDescription);
        formData.append('conditionState', conditionState);
        formData.append('email', email);
        formData.append('file', image);

        try {
            const response = await fetch('/used-products/submit', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await response.json();
            if (data.result == 'success') {
                setMessage('Sikeres beküldés!');
                setProductName('');
                setProductDescription('');
                setImage(null);
                fetchMySubmissions();
                setTimeout(() => setActiveTab('offers'), 2000); 
            } else {
                setMessage(data.message || 'Hiba történt a beküldéskor.');
            }
        } catch (err) {
            console.log(err);
            setMessage('Szerver hiba.');
        }
    }

    async function handleUserDecision(id, decision) {
        if(!hasBankAccount && decision == 'accept') {
            setModal({
                isOpen: true,
                title: 'Figyelem',
                message: 'A pénz fogadásához kérlek állítsd be a bankszámlaszámodat a profilban!',
                action: () => props.openProfile()
            });
            return;
        }

        try {
            const data = await apiFetch('/used-products/user-response', {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: { 
                    submissionId: id, 
                    decision: decision 
                }
            });

            if(data.result == 'success') {
                fetchMySubmissions();
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    if (hasBankAccount === false) {
        return (
            <div className="pageWrapper">
                <div className="usedProductContainer">
                    <h1>Használt termék leadása</h1>
                    <div className="warningBox">
                        <h3>Hiányzó adatok!</h3>
                        <p>A leadáshoz bankszámlaszám szükséges.</p>
                        <button className="goToProfileBtn" onClick={props.openProfile}>
                            Profil megnyitása
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (hasBankAccount === null) {
        return <div className="pageWrapper"><p className="loadingText">Betöltés...</p></div>;
    }

    const activeOffers = mySubmissions.filter(sub => ['pending', 'accepted'].includes(sub.status));
    const pastOffers = mySubmissions.filter(sub => ['rejected', 'offer_accepted', 'offer_rejected'].includes(sub.status));

    const renderCard = (sub) => (
        <div key={sub.submissionId} className="mySubmissionCard">
            <div className="cardHeader">
                <h4>{sub.productName}</h4>
                <span className="cardDate">{new Date(sub.submissionDate).toLocaleDateString()}</span>
            </div>
            
            <div className="cardStatusRow">
                <span>Állapot:</span>
                <span className={`statusLabel ${sub.status}`}>
                    {sub.status == 'pending' ? 'Feldolgozás alatt' : 
                     sub.status == 'accepted' ? 'Ajánlat érkezett' : 
                     sub.status == 'rejected' ? 'Elutasítva' :
                     sub.status == 'offer_accepted' ? 'Általad elfogadva' :
                     'Általad elutasítva'}
                </span>
            </div>

            {sub.adminOfferPrice > 0 && sub.status !== 'rejected' && (
                <div className="offerBox">
                    <span>Kapott ajánlat:</span>
                    <span className="offerPrice">{formatPrice(sub.adminOfferPrice)} Ft</span>
                    
                    {sub.status == 'accepted' && (
                        <div className="userDecisionButtons">
                            <button className="userAcceptBtn" onClick={() => handleUserDecision(sub.submissionId, 'accept')}>Elfogadás</button>
                            <button className="userRejectBtn" onClick={() => handleUserDecision(sub.submissionId, 'reject')}>Elutasítás</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="pageWrapper">
            <CustomModal 
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                onConfirm={closeModal}
                type="alert"
            />
            
            <div className="tabHeader">
                <button 
                    className={`tabButton ${activeTab == 'form' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('form')}
                >
                    Új termék leadása
                </button>
                <button 
                    className={`tabButton ${activeTab == 'offers' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('offers')}
                >
                    Ajánlatok
                </button>
                <button 
                    className={`tabButton ${activeTab == 'history' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('history')}
                >
                    Korábbi leadások
                </button>
            </div>

            <div className="usedProductContainer">
                {activeTab == 'form' && (
                    <div className="submissionForm">
                        <h2>Adatok megadása</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="formGroup">
                                <label>Termék neve:</label>
                                <input type="text" value={productName} onChange={handleProductNameChange} required />
                            </div>
                            <div className="formGroup">
                                <label>Leírás:</label>
                                <textarea value={productDescription} onChange={handleProductDescriptionChange} required />
                            </div>
                            <div className="formGroup">
                                <label>Állapot:</label>
                                <select value={conditionState} onChange={handleConditionChange}>
                                    <option value="bontatlan">Bontatlan</option>
                                    <option value="felbontott">Felbontott</option>
                                    <option value="használt">Használt</option>
                                </select>
                            </div>
                            <div className="formGroup">
                                <label>Kép (Kötelező):</label>
                                <input type="file" onChange={handleImageChange} accept="image/*" required />
                                <small className="fileHelperText">Jól látható képet töltsön fel!</small>
                            </div>
                            <div className="formGroup">
                                <label>E-mail cím értesítéshez:</label>
                                <input type="email" value={email} onChange={handleEmailChange} required />
                            </div>
                            <button type="submit" className="submitBtn">Beküldés</button>
                        </form>
                        {message && <p className="statusMessage">{message}</p>}
                    </div>
                )}

                {activeTab == 'offers' && (
                    <div className="mySubmissionsList">
                        <h2>Aktív ajánlatok</h2>
                        {activeOffers.length == 0 ? <p>Jelenleg nincsenek folyamatban lévő ajánlataid.</p> : (
                            <div className="cardsGrid">
                                {activeOffers.map(renderCard)}
                            </div>
                        )}
                    </div>
                )}

                {activeTab == 'history' && (
                    <div className="mySubmissionsList">
                        <h2>Korábbi leadások</h2>
                        {pastOffers.length == 0 ? <p>Még nincsenek lezárt leadásaid.</p> : (
                            <div className="cardsGrid">
                                {pastOffers.map(renderCard)}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}