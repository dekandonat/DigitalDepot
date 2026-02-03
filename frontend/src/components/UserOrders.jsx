import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../assets/util/fetch';
import './UserOrders.css';

export default function UserOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrderId, setExpandedOrderId] = useState(null);
    const [orderDetails, setOrderDetails] = useState({}); 

    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const token = localStorage.getItem('token');
            if(!token) {
                navigate('/');
                return;
            }

            try {
                const data = await apiFetch('/order/my-orders', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                setOrders(data.data || []); 
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [navigate]);

    const viewOrderDetails = async (orderId) => {
        if (expandedOrderId === orderId) {
            setExpandedOrderId(null);
            return;
        }

        setExpandedOrderId(orderId);

        if (!orderDetails[orderId]) {
            try {
                const result = await apiFetch(`/order/items/${orderId}`);
                
                const details = { ...orderDetails };
                details[orderId] = result.data;
                setOrderDetails(details);
            } catch (error) {
                console.error(error);
            }
        }
    };

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
                                <div className="headerLeft">
                                    <span className="orderId">Rendelés #{order.orderId}</span>
                                    <span className="orderDate">
                                        {order.orderDate ? new Date(order.orderDate).toLocaleString('hu-HU') : 'Dátum nem elérhető'}
                                    </span>
                                </div>
                                <div className="headerRight">
                                    <span className="orderTotalAmount">
                                        {order.totalAmount ? order.totalAmount.toLocaleString() : 0} Ft
                                    </span>
                                    <button 
                                        className="expandButton"
                                        onClick={() => viewOrderDetails(order.orderId)}
                                    >
                                        {expandedOrderId === order.orderId ? 'Bezárás' : 'Részletek'}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="orderCardBody">
                                <p className="orderDetailRow">
                                    <strong>Szállítási cím: </strong> {order.shippingAddress}
                                </p>
                            </div>

                            {expandedOrderId === order.orderId && (
                                <div className="orderItemsContainer">
                                    <h3>Megrendelt termékek:</h3>
                                    {orderDetails[order.orderId] ? (
                                        <div className="itemsList">
                                            {orderDetails[order.orderId].map((item, index) => (
                                                <div key={index} className="orderItemRow">
                                                    <img src={item.productImg} alt={item.productName} className="itemThumb"/>
                                                    <div className="itemInfo">
                                                        <span className="itemName">{item.productName}</span>
                                                        <span className="itemQty">{item.quantity} db</span>
                                                    </div>
                                                    <span className="itemPrice">
                                                        {(item.price * item.quantity).toLocaleString()} Ft
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>Részletek betöltése...</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}