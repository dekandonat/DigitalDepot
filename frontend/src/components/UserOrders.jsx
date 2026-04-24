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
      if (!token) {
        navigate('/');
      } else {
        try {
          const data = await apiFetch('/order/my-orders');
          setOrders(data.data || []);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [navigate]);

  const viewOrderDetails = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }

    if (!orderDetails[orderId]) {
      try {
        const data = await apiFetch(`/order/items/${orderId}`);
        setOrderDetails((prev) => ({
          ...prev,
          [orderId]: {
            products: data.data.products,
            discount: data.data.discount.value,
          },
        }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getStatusProgress = (status) => {
    switch (status) {
      case 'Függőben':
        return 0;
      case 'Csomagolás alatt':
        return 1;
      case 'Kiszállítás alatt':
        return 2;
      case 'Teljesítve':
        return 3;
      case 'Törölve':
        return 4;
      default:
        return 0;
    }
  };

  return (
    <div className="userOrdersContainer">
      <button className="backButton" onClick={() => navigate('/')}>
        Vissza a főoldalra
      </button>
      <h2 className="userOrdersTitle">Rendeléseim</h2>

      {loading ? (
        <p className="loadingText">Rendelések betöltése...</p>
      ) : orders.length === 0 ? (
        <p className="noOrdersText">Még nem adtál le rendelést.</p>
      ) : (
        <div className="ordersList">
          {orders.map((order) => {
            const progress = getStatusProgress(order.status || 'Függőben');

            return (
              <div key={order.orderId} className="orderCard">
                <div className="orderCardHeader">
                  <div className="headerLeft">
                    <span className="orderId">Rendelés #{order.orderId}</span>
                    <span className="orderDate">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="headerRight">
                    <strong>
                      {parseInt(order.totalAmount).toLocaleString('hu-HU')} Ft
                    </strong>
                    <button
                      className="expandButton"
                      onClick={() => viewOrderDetails(order.orderId)}
                    >
                      {expandedOrderId === order.orderId
                        ? 'Bezárás'
                        : 'Részletek'}
                    </button>
                  </div>
                </div>

                <div className="orderStatusContainer">
                  <div className="statusStepper" data-progress={progress}>
                    {progress === 4 ? (
                      <div className="statusStep cancelled">
                        <div className="stepCircle">✗</div>
                        <span className="stepLabel">Rendelés törölve</span>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`statusStep ${progress >= 0 ? 'completed' : ''}`}
                        >
                          <div className="stepCircle">
                            {progress >= 1 ? '✓' : '1'}
                          </div>
                          <span className="stepLabel">Függőben</span>
                        </div>
                        <div
                          className={`statusStep ${progress >= 1 ? 'completed' : ''}`}
                        >
                          <div className="stepCircle">
                            {progress >= 2 ? '✓' : '2'}
                          </div>
                          <span className="stepLabel">Csomagolás</span>
                        </div>
                        <div
                          className={`statusStep ${progress >= 2 ? 'completed' : ''}`}
                        >
                          <div className="stepCircle">
                            {progress >= 3 ? '✓' : '3'}
                          </div>
                          <span className="stepLabel">Kiszállítás</span>
                        </div>
                        <div
                          className={`statusStep ${progress >= 3 ? 'completed' : ''}`}
                        >
                          <div className="stepCircle">
                            {progress >= 3 ? '✓' : '4'}
                          </div>
                          <span className="stepLabel">Teljesítve</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {expandedOrderId === order.orderId && (
                  <div className="orderItemsContainer">
                    <h3>Rendelt termékek</h3>
                    {orderDetails[order.orderId] ? (
                      <div className="itemsList">
                        {orderDetails[order.orderId].products.map(
                          (item, index) => (
                            <div key={index} className="orderItemRow">
                              <img
                                src={item.productImg}
                                alt={item.productName}
                                className="itemThumb"
                              />
                              <div className="itemInfo">
                                <span className="itemName">
                                  {item.productName}
                                </span>
                                <span className="itemQty">
                                  {item.quantity} db
                                </span>
                              </div>
                              <span className="itemPrice">
                                {(item.price * item.quantity).toLocaleString(
                                  'hu-HU'
                                )}{' '}
                                Ft
                              </span>
                            </div>
                          )
                        )}
                        {orderDetails[order.orderId].discount > 0 ? (
                          <h3>
                            Kedvezmény: {orderDetails[order.orderId].discount}{' '}
                            Ft
                          </h3>
                        ) : null}
                      </div>
                    ) : (
                      <p>Részletek betöltése...</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
