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
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', type: 'alert', onConfirm: null, onCancel: null });

    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('new');
    const [newAddress, setNewAddress] = useState({ zip: '', city: '', address: '' });
    const [acceptingOfferId, setAcceptingOfferId] = useState(null);

    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('email');

    useEffect(() => {
        if(userEmail) setEmail(userEmail);
        checkUserProfile();
        fetchMySubmissions();
        fetchAddresses();
    }, [props.refreshTrigger]);

    const fetchAddresses = async () => {
        if (token) {
            try {
                const data = await apiFetch('/user/addresses');
                if (data.result === 'success') {
                    setSavedAddresses(data.data);
                    if (data.data.length > 0) {
                        setSelectedAddressId(data.data[0].id.toString());
                    }
                }
            } catch (err) {
                console.error(err);
            }
        }
    };

    const checkUserProfile = async () => {
        if(!token) return;
        try {
            const data = await apiFetch('/user/profile');
            if(data.result === 'success') {
                setHasBankAccount(!!data.data.bankAccountNumber);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchMySubmissions = async () => {
        if(!token) return;
        try {
            const data = await apiFetch('/used-products/my-submissions');
            if(data.result === 'success') {
                setMySubmissions(data.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    function handleProductNameChange(event) {
        setProductName(event.target.value);
    }

    function handleProductDescriptionChange(event) {
        setProductDescription(event.target.value);
    }

    function handleConditionStateChange(event) {
        setConditionState(event.target.value);
    }

    function handleImageChange(event) {
        setImage(event.target.files[0]);
    }

    function handleEmailChange(event) {
        setEmail(event.target.value);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!token) {
            setModal({ isOpen: true, title: 'Hiba', message: 'Kérjük, jelentkezz be a termék leadásához!', type: 'alert', onConfirm: () => setModal({...modal, isOpen: false}) });
            return;
        }

        if (hasBankAccount === false) {
            setModal({ isOpen: true, title: 'Hiányzó adat', message: 'Kérjük, a profilodban add meg a bankszámlaszámodat a leadás előtt (ide utaljuk majd az összeget).', type: 'alert', onConfirm: () => setModal({...modal, isOpen: false}) });
            return;
        }

        if (!image) {
            setModal({ isOpen: true, title: 'Hiba', message: 'Kérlek tölts fel egy képet a termékről!', type: 'alert', onConfirm: () => setModal({...modal, isOpen: false}) });
            return;
        }

        const formData = new FormData();
        formData.append('productName', productName);
        formData.append('productDescription', productDescription);
        formData.append('conditionState', conditionState);
        formData.append('file', image);

        try {
            const data = await apiFetch('/used-products/submit', {
                method: 'POST',
                body: formData
            });

            if (data.result === 'success') {
                setModal({ isOpen: true, title: 'Siker', message: 'Termék sikeresen beküldve! Hamarosan küldjük az ajánlatot.', type: 'alert', onConfirm: () => {
                    setModal({...modal, isOpen: false});
                    setProductName('');
                    setProductDescription('');
                    setImage(null);
                    setActiveTab('offers');
                    fetchMySubmissions();
                }});
            } else {
                setModal({ isOpen: true, title: 'Hiba', message: data.message || 'Hiba történt a feltöltés során.', type: 'alert', onConfirm: () => setModal({...modal, isOpen: false}) });
            }
        } catch (error) {
            setModal({ isOpen: true, title: 'Hiba', message: 'Hálózati hiba történt.', type: 'alert', onConfirm: () => setModal({...modal, isOpen: false}) });
        }
    };

    const confirmDecision = async (submissionId, decision) => {
        try {
            const data = await apiFetch('/used-products/respond', {
                method: 'PATCH',
                body: { submissionId, decision }
            });
            if (data.result === 'success') {
                setModal({ isOpen: true, title: 'Siker', message: decision === 'accept' ? 'Ajánlat sikeresen elfogadva! A futárt hamarosan küldjük.' : 'Ajánlat elutasítva.', type: 'alert', onConfirm: () => {
                    setModal({...modal, isOpen: false});
                    setAcceptingOfferId(null);
                    fetchMySubmissions();
                }});
            } else {
                setModal({ isOpen: true, title: 'Hiba', message: 'Nem sikerült menteni a döntést.', type: 'alert', onConfirm: () => setModal({...modal, isOpen: false}) });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUserDecision = (submissionId, decision) => {
        if (decision === 'accept') {
            setAcceptingOfferId(submissionId);
        } else {
            setModal({
                isOpen: true,
                title: 'Elutasítás megerősítése',
                message: 'Biztosan elutasítod ezt az ajánlatot?',
                type: 'confirm',
                onConfirm: () => confirmDecision(submissionId, 'reject'),
                onCancel: () => setModal({...modal, isOpen: false})
            });
        }
    };

    const submitAcceptanceWithAddress = () => {
        let pickupAddress = '';
        if (selectedAddressId === 'new') {
            if(!newAddress.zip || !newAddress.city || !newAddress.address) {
                setModal({ isOpen: true, title: 'Hiba', message: 'Kérlek tölts ki minden cím mezőt!', type: 'alert', onConfirm: () => setModal({...modal, isOpen: false}) });
                return;
            }
            pickupAddress = `${newAddress.zip} ${newAddress.city}, ${newAddress.address}`;
        } else {
            const selected = savedAddresses.find(a => a.id.toString() === selectedAddressId);
            if (selected) {
                pickupAddress = `${selected.zipCode} ${selected.city}, ${selected.streetAddress}`;
            }
        }
        confirmDecision(acceptingOfferId, 'accept');
    };

    const activeOffers = mySubmissions.filter(sub => sub.status === 'pending' || sub.status === 'accepted');
    const pastOffers = mySubmissions.filter(sub => sub.status !== 'pending' && sub.status !== 'accepted');

    const renderCard = (sub) => (
        <div key={sub.submissionId} className="subCard">
            <div className="subCardHeader">
                <span className="subDate">{new Date(sub.submissionDate).toLocaleDateString()}</span>
                <span className={`subStatus status-${sub.status}`}>
                    {sub.status === 'pending' ? 'Értékelés alatt' : 
                     sub.status === 'accepted' ? 'Ajánlat érkezett' : 
                     sub.status === 'offer_accepted' ? 'Elfogadva' : 
                     sub.status === 'listed' ? 'Piacra dobva' : 'Elutasítva'}
                </span>
            </div>
            <div className="subCardBody">
                {sub.productImage && <img src={`/${sub.productImage}`} alt={sub.productName} />}
                <div className="subCardInfo">
                    <h3>{sub.productName}</h3>
                    <p>{sub.conditionState}</p>
                    {sub.adminOfferPrice && (
                        <div className="offerPriceHighlight">
                            <span>Ajánlatunk:</span>
                            <strong>{formatPrice(sub.adminOfferPrice)} Ft</strong>
                        </div>
                    )}
                    
                    {sub.status === 'accepted' && acceptingOfferId !== sub.submissionId && (
                        <div className="userDecisionButtons">
                            <button className="userAcceptBtn" onClick={() => handleUserDecision(sub.submissionId, 'accept')}>Elfogadom az ajánlatot</button>
                            <button className="userRejectBtn" onClick={() => handleUserDecision(sub.submissionId, 'reject')}>Nem fogadom el</button>
                        </div>
                    )}

                    {acceptingOfferId === sub.submissionId && (
                        <div className="addressPickerContainer">
                            <h4 className="addressPickerTitle">Futár küldése - Cím kiválasztása</h4>
                            {savedAddresses.length > 0 && (
                                <select 
                                    className="addressInput"
                                    style={{ marginBottom: '10px' }}
                                    value={selectedAddressId} 
                                    onChange={(e) => setSelectedAddressId(e.target.value)}
                                >
                                    {savedAddresses.map(addr => (
                                        <option key={addr.id} value={addr.id}>
                                            {addr.zipCode} {addr.city}, {addr.streetAddress}
                                        </option>
                                    ))}
                                    <option value="new">+ Új cím megadása</option>
                                </select>
                            )}

                            {(selectedAddressId === 'new' || savedAddresses.length === 0) && (
                                <div className="addressInputGroup">
                                    <div className="addressInputRow">
                                        <input type="text" placeholder="Irányítószám" className="addressInput addressInputFlex1" value={newAddress.zip} onChange={e => setNewAddress({...newAddress, zip: e.target.value})} />
                                        <input type="text" placeholder="Város" className="addressInput addressInputFlex2" value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} />
                                    </div>
                                    <input type="text" placeholder="Utca, házszám" className="addressInput" value={newAddress.address} onChange={e => setNewAddress({...newAddress, address: e.target.value})} />
                                </div>
                            )}
                            
                            <div className="decisionButtonRow">
                                <button className="userAcceptBtn" onClick={submitAcceptanceWithAddress}>Megerősítés</button>
                                <button className="userRejectBtn cancelBtn" onClick={() => setAcceptingOfferId(null)}>Mégse</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="usedProductPageWrapper">
            <CustomModal 
                isOpen={modal.isOpen} 
                title={modal.title} 
                message={modal.message} 
                type={modal.type}
                onConfirm={modal.onConfirm}
                onCancel={modal.onCancel}
            />

            <div className="tabHeader">
                <button className={`tabButton ${activeTab == 'form' ? 'active' : ''}`} onClick={() => setActiveTab('form')}>
                    Termék leadása
                </button>
                <button className={`tabButton ${activeTab == 'offers' ? 'active' : ''}`} onClick={() => setActiveTab('offers')}>
                    Aktív ajánlatok
                </button>
                <button className={`tabButton ${activeTab == 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                    Korábbi leadások
                </button>
            </div>

            <div className="tabContent">
                {activeTab == 'form' && (
                    <div className="usedProductFormContainer">
                        <h2>Adj el nekünk!</h2>
                        <p>Töltsd ki az alábbi űrlapot a használt terméked adataival, és mi hamarosan küldünk egy árajánlatot.</p>
                        <form className="usedProductForm" onSubmit={handleSubmit}>
                            <div className="formGroup">
                                <label>Termék neve:</label>
                                <input type="text" value={productName} onChange={handleProductNameChange} required />
                            </div>
                            <div className="formGroup">
                                <label>Leírás és hibák (ha vannak):</label>
                                <textarea rows="4" value={productDescription} onChange={handleProductDescriptionChange} required></textarea>
                            </div>
                            <div className="formGroup">
                                <label>Állapot:</label>
                                <select value={conditionState} onChange={handleConditionStateChange}>
                                    <option value="újszerű">Újszerű</option>
                                    <option value="használt">Használt</option>
                                    <option value="hibás">Hibás / Alkatrésznek</option>
                                </select>
                            </div>
                            <div className="formGroup">
                                <label>Kép feltöltése:</label>
                                <input type="file" accept="image/*" onChange={handleImageChange} required />
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