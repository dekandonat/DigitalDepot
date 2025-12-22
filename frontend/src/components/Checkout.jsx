import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

export default function Checkout() {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('card');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const token = localStorage.getItem('token');
        
        if(!token) {
            alert("Jelentkezz be a vásárláshoz!");
            navigate('/');
            return;
        }

        const name = form.name.value.trim();
        const zip = form.zip.value.trim();
        const city = form.city.value.trim();
        const address = form.address.value.trim();
        const couponCode = form.couponCode?.value.trim() || "";

        const shippingAddress = `${zip} ${city}, ${address} (${name})`;

        let orderInfo = {
            shippingAddress: shippingAddress,
            paymentMethod: paymentMethod,
            couponCode: couponCode
        };

        if (paymentMethod === 'card') {
            orderInfo.cardDetails = {
                number: form.cardNumber.value.trim(),
                expiry: form.expiry.value.trim(),
                cvc: form.cvc.value.trim()
            };
        }

        try {
            const response = await fetch('http://localhost:3000/order/place-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderInfo)
            });

            const data = await response.json();

            if (response.ok) {
                alert("Sikeres rendelés! Köszönjük a vásárlást.");
                navigate('/');
            } else {
                alert(data.message || "Hiba történt a rendeléskor.");
            }
        } catch (error) {
            console.error(error);
            alert("Hálózati hiba történt!");
        }
    };

    return (
        <div className="checkoutContainer">
            <h2>Véglegesítés és Fizetés</h2>
            <form onSubmit={handleSubmit} className="checkoutForm">
                
                <h3>Szállítási adatok</h3>
                <input type="text" name="name" placeholder="Teljes név" required />
                
                <div className="inputRow">
                    <input type="text" name="zip" placeholder="Irányítószám" required />
                    <input type="text" name="city" placeholder="Város" required />
                </div>
                
                <input type="text" name="address" placeholder="Utca, házszám" required />

                <div className="couponSection">
                    <h3 className="couponSectionTitle">Kupon:</h3>
                    <div className="couponInputContainer">
                        <input type="text" name="couponCode" className="couponInput" placeholder="Írd be a kuponkódot" />
                        <button type="button" className="payButton couponButton">
                            Beváltás
                        </button>
                    </div>
                </div>

                <h3>Fizetési mód</h3>
                <div className="paymentMethods">
                    <label className="paymentOptionLabel">
                        <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={(e) => setPaymentMethod(e.target.value)} />
                        <span>Bankkártyás fizetés</span>
                    </label>
                    
                    <label className="paymentOptionLabel">
                        <input type="radio" name="paymentMethod" value="utanvet" checked={paymentMethod === 'utanvet'} onChange={(e) => setPaymentMethod(e.target.value)} />
                        <span>Utánvét (Fizetés a futárnál)</span>
                    </label>
                </div>

                {paymentMethod === 'card' && (
                    <div className="cardDetails">
                        <h4 className="cardDetailsTitle">Bankkártya adatok</h4>
                        <input type="text" name="cardNumber" placeholder="Kártyaszám (XXXX XXXX XXXX XXXX)" required maxLength="19"/>
                        <div className="inputRow cardDetailsInputRow">
                            <input type="text" name="expiry" placeholder="Lejárat (HH/ÉÉ)" required maxLength="5" />
                            <input type="text" name="cvc" placeholder="CVC" required maxLength="3" />
                        </div>
                    </div>
                )}

                <button type="submit" className="payButton">
                    {paymentMethod === 'utanvet' ? 'Rendelés leadása (Utánvét)' : 'Fizetés és Rendelés'}
                </button>
            </form>
        </div>
    );
}