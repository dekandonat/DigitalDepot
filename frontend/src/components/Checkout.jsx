import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';

export default function Checkout() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        zip: '',
        city: '',
        address: '',
        cardNumber: '',
        expiry: '',
        cvc: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('token');
        if(!token) {
            alert("Jelentkezz be a vásárláshoz!");
            navigate('/');
            return;
        }

        const shippingAddress = `${formData.zip} ${formData.city}, ${formData.address} (${formData.name})`;

        try {
            const response = await fetch('http://localhost:3000/order/place-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ shippingAddress: shippingAddress })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Sikeres rendelés! Köszönjük a vásárlást.");
                navigate('/');
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert("Hálózati hiba történt!");
        }
    };

    return (
        <div className="checkoutContainer">
            <h2>Véglegesítés és Fizetés</h2>
            <form onSubmit={handleSubmit} className="checkoutForm">
                
                <h3>Szállítási adatok</h3>
                <input 
                    type="text" name="name" placeholder="Teljes név" required 
                    value={formData.name} onChange={handleChange} 
                />
                <div className="inputRow">
                    <input 
                        type="text" name="zip" placeholder="Irányítószám" required 
                        value={formData.zip} onChange={handleChange} 
                    />
                    <input 
                        type="text" name="city" placeholder="Város" required 
                        value={formData.city} onChange={handleChange} 
                    />
                </div>
                <input 
                    type="text" name="address" placeholder="Utca, házszám" required 
                    value={formData.address} onChange={handleChange} 
                />

                <button type="submit" className="payButton">Rendelés leadása</button>
            </form>
        </div>
    );
}