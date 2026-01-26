import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UsedProductPage.css';

export default function UsedProductPage({ openProfile, refreshTrigger }) {
    const [activeTab, setActiveTab] = useState('form');
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [conditionState, setConditionState] = useState('használt');
    const [image, setImage] = useState(null);
    const [email, setEmail] = useState(''); 
    const [message, setMessage] = useState('');
    const [hasBankAccount, setHasBankAccount] = useState(null);
    const [mySubmissions, setMySubmissions] = useState([]);

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('email');

    useEffect(() => {
        if(userEmail) setEmail(userEmail);
        checkUserProfile();
        fetchMySubmissions();
    }, [refreshTrigger]);

    const checkUserProfile = async () => {
        try {
            const res = await fetch('http://localhost:3000/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.result === 'success') {
                if (data.data.bankAccountNumber && data.data.bankAccountNumber.trim() !== '') {
                    setHasBankAccount(true);
                } else {
                    setHasBankAccount(false);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMySubmissions = async () => {
        try {
            const res = await fetch('http://localhost:3000/used-products/my-submissions', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if(data.result === 'success'){
                setMySubmissions(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('productDescription', productDescription);
        formData.append('conditionState', conditionState);
        formData.append('email', email);
        if (image) formData.append('file', image);

        try {
            const res = await fetch('http://localhost:3000/used-products/submit', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (data.result === 'success') {
                setMessage('Sikeres beküldés!');
                setProductName('');
                setProductDescription('');
                setImage(null);
                fetchMySubmissions();
                setTimeout(() => setActiveTab('list'), 1500); 
            } else {
                setMessage(data.message || 'Hiba történt a beküldéskor.');
            }
        } catch (err) {
            console.error(err);
            setMessage('Szerver hiba.');
        }
    };

    if (hasBankAccount === false) {
        return (
            <div className="pageWrapper">
                <div className="usedProductContainer">
                    <h1>Használt termék leadása</h1>
                    <div className="warningBox">
                        <h3>Hiányzó adatok!</h3>
                        <p>A termék leadásához szükség van a bankszámlaszámodra, hogy kifizethessünk, ha elfogadjuk a terméket.</p>
                        <button className="goToProfileBtn" onClick={openProfile}>
                            Profil megnyitása
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (hasBankAccount === null) {
        return <div className="pageWrapper"><p style={{textAlign:'center', marginTop:'50px'}}>Betöltés...</p></div>;
    }

    return (
        <div className="pageWrapper">
            <div className="tabHeader">
                <button 
                    className={`tabButton ${activeTab === 'form' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('form')}
                >
                    Új termék leadása
                </button>
                <button 
                    className={`tabButton ${activeTab === 'list' ? 'active' : ''}`} 
                    onClick={() => setActiveTab('list')}
                >
                    Korábbi leadások / Ajánlatok
                </button>
            </div>

            <div className="usedProductContainer">
                {activeTab === 'form' && (
                    <div className="submissionForm">
                        <h2>Adatok megadása</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="formGroup">
                                <label>Termék neve:</label>
                                <input type="text" value={productName} onChange={e => setProductName(e.target.value)} required />
                            </div>
                            <div className="formGroup">
                                <label>Leírás:</label>
                                <textarea value={productDescription} onChange={e => setProductDescription(e.target.value)} required />
                            </div>
                            <div className="formGroup">
                                <label>Állapot:</label>
                                <select value={conditionState} onChange={e => setConditionState(e.target.value)}>
                                    <option value="bontatlan">Bontatlan</option>
                                    <option value="felbontott">Felbontott</option>
                                    <option value="használt">Használt</option>
                                </select>
                            </div>
                            <div className="formGroup">
                                <label>Kép (Jól látható legyen!):</label>
                                <input type="file" onChange={e => setImage(e.target.files[0])} accept="image/*" />
                            </div>
                            <div className="formGroup">
                                <label>E-mail cím értesítéshez:</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <button type="submit" className="submitBtn">Beküldés</button>
                        </form>
                        {message && <p className="statusMessage">{message}</p>}
                    </div>
                )}

                {activeTab === 'list' && (
                    <div className="mySubmissionsList">
                        <h2>Leadott termékeim</h2>
                        {mySubmissions.length === 0 ? <p>Még nincs leadott terméked.</p> : (
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
                                                {sub.status === 'pending' ? 'Feldolgozás alatt' : 
                                                 sub.status === 'accepted' ? 'Elfogadva' : 'Elutasítva'}
                                            </span>
                                        </div>

                                        {sub.adminOfferPrice && (
                                            <div className="offerBox">
                                                <span>Kapott ajánlat:</span>
                                                <span className="offerPrice">{sub.adminOfferPrice} Ft</span>
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