import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserOrders.css';

export default function UserOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            if(!token) {
                navigate('/');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/order/my-orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if(response.ok){
                    const data = await response.json();
                    setOrders(data.data || []); 
                }
            } catch (error) {
                console.error("Hiba a rendelések lekérésekor:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    return (
        <div className="userOrdersContainer">
            <h2 className="userOrdersTitle">Korábbi rendeléseim</h2>
            
            <button 
                onClick={() => navigate('/')} 
                className="backButton"
            >
                &larr; Vissza a boltba
            </button>

            {loading ? (
                <p className="loadingText">Betöltés...</p>
            ) : orders.length === 0 ? (
                <p className="noOrdersText">Még nincsenek leadott rendeléseid.</p>
            ) : (
                <div className="ordersList">
                    {orders.map(order => (
                        <div key={order.orderId} className="orderCard">
                            <div className="orderCardHeader">
                                <span className="orderId">
                                    Rendelés #{order.orderId}
                                </span>
                                <span className="orderDate">
                                    {order.orderDate ? new Date(order.orderDate).toLocaleString('hu-HU') : 'Dátum nem elérhető'}
                                </span>
                            </div>
                            
                            <div className="orderCardBody">
                                <p className="orderDetailRow">
                                    <strong>Végösszeg: </strong> 
                                    <span className="orderTotalAmount">
                                        {order.totalAmount ? order.totalAmount.toLocaleString() : 0} Ft
                                    </span>
                                </p>
                                <p className="orderDetailRow">
                                    <strong>Szállítási cím: </strong> 
                                    {order.shippingAddress}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}