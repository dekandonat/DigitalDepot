import React, { useState, useEffect } from 'react';
import './AdminUsedProducts.css';

export default function AdminUsedProducts() {
    const [submissions, setSubmissions] = useState([]);
    const [offerInputs, setOfferInputs] = useState({});
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetch('http://localhost:3000/used-products/admin/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if(data.result === 'success') setSubmissions(data.data);
        });
    }, [token]);

    const handleAction = async (id, status, email) => {
        const price = offerInputs[id];

        if (status === 'accepted') {
            if (!price || price <= 0) {
                alert("Kérlek adj meg egy érvényes ajánlati árat!");
                return;
            }
        }

        try {
            const res = await fetch('http://localhost:3000/used-products/admin/status', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    submissionId: id,
                    status: status,
                    offerPrice: price,
                    userEmail: email
                })
            });
            const data = await res.json();
            if (data.result === 'success') {
                alert('Státusz frissítve!');
                
                const updatedList = [];
                for (let i = 0; i < submissions.length; i++) {
                    if (submissions[i].submissionId === id) {
                        const updatedItem = {
                            ...submissions[i],
                            status: status,
                            adminOfferPrice: price
                        };
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
                        <p className="subDesc">{sub.productDescription}</p>
                        <p className="subStatus">Státusz: {sub.status}</p>
                        {sub.productImage && (
                            <img src={`http://localhost:3000/${sub.productImage}`} alt="Termék" className="subImg" />
                        )}
                        
                        <div className="subActions">
                            {sub.status === 'pending' ? (
                                <>
                                    <div className="offerInput">
                                        <input 
                                            type="number" 
                                            placeholder="Ajánlott ár (Ft)"
                                            onChange={(e) => setOfferInputs({...offerInputs, [sub.submissionId]: e.target.value})}
                                        />
                                    </div>
                                    <div className="btnGroup">
                                        <button 
                                            className="acceptBtn"
                                            onClick={() => handleAction(sub.submissionId, 'accepted', sub.email)}
                                        >
                                            Elfogadás
                                        </button>
                                        <button 
                                            className="rejectBtn"
                                            onClick={() => handleAction(sub.submissionId, 'rejected', sub.email)}
                                        >
                                            Elutasítás
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <p className={`statusLabel ${sub.status}`}>
                                    {sub.status === 'accepted' ? `Elfogadva (${sub.adminOfferPrice} Ft)` : 'Elutasítva'}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}