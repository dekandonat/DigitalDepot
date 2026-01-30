import React, { useState, useEffect } from 'react';
import './AdminUsedProducts.css';

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

export default function AdminUsedProducts() {
    const [submissions, setSubmissions] = useState([]);
    const [offerInputs, setOfferInputs] = useState({});
    const token = localStorage.getItem('token');

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getMethodFetch('http://localhost:3000/used-products/admin/all', token);
                if(data.result == 'success') setSubmissions(data.data);
            } catch (err) {
                console.log(err.message);
            }
        }
        fetchData();
    }, [token]);

    function handleOfferChange(id, value) {
        const newOffers = Object.assign({}, offerInputs);
        newOffers[id] = value;
        setOfferInputs(newOffers);
    }

    async function handleAction(id, status) {
        const price = offerInputs[id];

        if (status == 'accepted') {
            if (!price || price <= 0) {
                alert("Kérlek adj meg egy érvényes ajánlati árat!");
                return;
            }
        }

        try {
            const data = await patchMethodFetch('http://localhost:3000/used-products/admin/status', {
                submissionId: id,
                status: status,
                offerPrice: price
            }, token);

            if (data.result == 'success') {
                const updatedList = [];
                for (let i = 0; i < submissions.length; i++) {
                    if (submissions[i].submissionId == id) {
                        const updatedItem = Object.assign({}, submissions[i]);
                        updatedItem.status = status;
                        updatedItem.adminOfferPrice = price;
                        updatedList.push(updatedItem);
                    } else {
                        updatedList.push(submissions[i]);
                    }
                }
                setSubmissions(updatedList);
            }
        } catch (err) {
            console.error(err);
            alert('Hiba történt.');
        }
    }

    const getStatusLabel = (status, price) => {
        switch(status) {
            case 'pending': return 'Feldolgozás alatt';
            case 'accepted': return `Ajánlat elküldve (${price} Ft)`;
            case 'rejected': return 'Elutasítva';
            case 'offer_accepted': return `Felhasználó elfogadta (${price} Ft)`;
            case 'offer_rejected': return 'Felhasználó elutasította';
            default: return status;
        }
    };

    return (
        <div className="adminUsedContainer">
            <h2>Beérkezett használt termékek</h2>
            <div className="adminSubGrid">
                {submissions.map(sub => (
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
                            <img src={`http://localhost:3000/${sub.productImage}`} alt="Termék" className="subImg" />
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
            </div>
        </div>
    );
}