import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsedProductPage.css';

const getMethodFetch = async (url, token) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error(response);
        return await response.json();
    } catch (err) {
        throw new Error(err);
    }
};

const patchMethodFetch = async (url, body, token) => {
    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });
        if (!response.ok) throw new Error(response);
        return await response.json();
    } catch (err) {
        throw new Error(err);
    }
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

    async function checkUserProfile() {
        try {
            const data = await getMethodFetch('http://localhost:3000/user/profile', token);
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
            const data = await getMethodFetch('http://localhost:3000/used-products/my-submissions', token);
            if(data.result == 'success'){
                setMySubmissions(data.data);
            }
        } catch (err) {
            console.log(err.message);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('productDescription', productDescription);
        formData.append('conditionState', conditionState);
        formData.append('email', email);
        if (image) formData.append('file', image);

        try {
            const response = await fetch('http://localhost:3000/used-products/submit', {
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
                setTimeout(() => setActiveTab('list'), 2000); 
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
            alert('A pénz fogadásához kérlek állítsd be a bankszámlaszámodat a profilban!');
            props.openProfile();
            return;
        }

        try {
            const data = await patchMethodFetch('http://localhost:3000/used-products/user-response', { 
                submissionId: id, 
                decision: decision 
            }, token);

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
                        <p>A leadáshoz add meg a bankszámlaszámod a profilban.</p>
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

    return (
        <div className="pageWrapper">
            <div className="tabHeader">
                <button 
                    className={`tabButton ${activeTab == 'form' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('form')}
                >
                    Új termék leadása
                </button>
                <button 
                    className={`tabButton ${activeTab == 'list' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('list')}
                >
                    Korábbi leadások / Ajánlatok
                </button>
            </div>

            <div className="usedProductContainer">
                {activeTab == 'form' ? (
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
                                <label>Kép:</label>
                                <input type="file" onChange={handleImageChange} accept="image/*" />
                                <small className="fileHelperText">Tölts fel egy jól látható képet!</small>
                            </div>
                            <div className="formGroup">
                                <label>E-mail cím értesítéshez:</label>
                                <input type="email" value={email} onChange={handleEmailChange} required />
                            </div>
                            <button type="submit" className="submitBtn">Beküldés</button>
                        </form>
                        {message && <p className="statusMessage">{message}</p>}
                    </div>
                ) : (
                    <div className="mySubmissionsList">
                        <h2>Leadott termékeim</h2>
                        {mySubmissions.length == 0 ? <p>Még nincs leadott terméked.</p> : (
                            <div className="cardsGrid">
                                {mySubmissions.map(sub => (
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

                                        {sub.adminOfferPrice && (
                                            <div className="offerBox">
                                                <span>Kapott ajánlat:</span>
                                                <span className="offerPrice">{sub.adminOfferPrice} Ft</span>
                                                
                                                {sub.status == 'accepted' && (
                                                    <div className="userDecisionButtons">
                                                        <button className="userAcceptBtn" onClick={() => handleUserDecision(sub.submissionId, 'accept')}>Elfogadás</button>
                                                        <button className="userRejectBtn" onClick={() => handleUserDecision(sub.submissionId, 'reject')}>Elutasítás</button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}