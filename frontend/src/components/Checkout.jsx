import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../assets/util/fetch';
import CustomModal from './CustomModal';
import './Checkout.css';

export default function Checkout() {
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('utanvet');
    const [modal, setModal] = useState({ isOpen: false, title: '', message: '', redirect: null });

    const closeModal = () => {
        const redirectPath = modal.redirect;
        setModal({ isOpen: false, title: '', message: '', redirect: null });
        if (redirectPath) {
            navigate(redirectPath);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const form = e.target;
        const token = localStorage.getItem('token');
        
        if(!token) {
            setModal({ isOpen: true, title: 'Figyelem', message: 'Jelentkezz be a vásárláshoz!', redirect: '/' });
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

        try {
            await apiFetch('/order/place-order', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: orderInfo
            });

            setModal({ isOpen: true, title: 'Sikeres rendelés!', message: 'Köszönjük a vásárlást.', redirect: '/' });
            
        } catch (error) {
            setModal({ isOpen: true, title: 'Hiba', message: error.message || "Hiba történt a rendeléskor.", redirect: null });
        }
    };

    return (
        <div className="checkoutContainer">
            <CustomModal 
                isOpen={modal.isOpen}
                title={modal.title}
                message={modal.message}
                onConfirm={closeModal}
                type="alert"
            />
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
                <div className="paymentMethodContainer">
                    <select 
                        name="paymentMethod" 
                        className="paymentSelect" 
                        value={paymentMethod} 
                        onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                        <option value="utanvet">Utánvét (Fizetés a futárnál)</option>
                        <option value="card" disabled>Bankkártyás fizetés</option>
                    </select>
                    <p className="unavailableMessage">Sajnáljuk, a bankkártyás fizetés jelenleg nem elérhető.</p>
                </div>

                <button type="submit" className="payButton">
                    Rendelés leadása (Utánvét)
                </button>
            </form>
        </div>
    );
}