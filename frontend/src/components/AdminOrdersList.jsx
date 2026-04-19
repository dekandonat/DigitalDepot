import { useState, useEffect } from 'react';
import './AdminOrdersList.css';
import CustomModal from './CustomModal';
import { apiFetch } from '../assets/util/fetch';

export default function AdminOrdersList() {
  const [orders, setOrders] = useState([]);
  const [modal, setModal] = useState({
    isOpen: false,
    orderId: null,
    type: 'confirm',
    title: '',
    message: '',
  });
  const [details, setDetails] = useState({
    data: null,
    isOpen: false,
    orderId: null,
  });

  const fetchOrders = async () => {
    try {
      const data = await apiFetch('/adminRoute/orders');
      if (data.result === 'success') {
        setOrders(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const confirmDelete = (id) => {
    setModal({
      isOpen: true,
      orderId: id,
      type: 'confirm',
      title: 'Törlés',
      message: 'Biztosan törölni szeretnéd ezt a rendelést?',
    });
  };

  const handleOrderDelete = async () => {
    try {
      const data = await apiFetch(`/adminRoute/orders/${modal.orderId}`, {
        method: 'DELETE',
      });
      if (data.result === 'success') {
        setModal({ ...modal, isOpen: false });
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrderDetails = async (id) => {
    if (details.isOpen && details.orderId === id) {
      setDetails({ data: null, isOpen: false, orderId: null });
      return;
    }
    try {
      const data = await apiFetch(`/order/items/${id}`);
      if (data.result === 'success') {
        setDetails({
          data: {
            products: data.data.products,
            discount: data.data.discount.value,
          },
          isOpen: true,
          orderId: id,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const data = await apiFetch(`/adminRoute/orders/${orderId}/status`, {
        method: 'PATCH',
        body: { status: newStatus },
      });
      if (data.result === 'success') {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="adminOrdersWrapper">
      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={handleOrderDelete}
        onCancel={() => setModal({ ...modal, isOpen: false })}
      />
      <div className="adminOrdersHeader">
        <h2>Rendelések kezelése</h2>
      </div>
      <div className="ordersGrid">
        {orders.length === 0 ? (
          <p className="noOrdersText">Nincsenek rendelések.</p>
        ) : (
          orders.map((order) => (
            <div key={order.orderId} className="adminOrderCard">
              <div className="orderCardHeader">
                <span className="orderId">#{order.orderId}</span>
                <span className="orderDate">
                  {new Date(order.orderDate).toLocaleDateString()}
                </span>
              </div>
              <div className="orderCardBody">
                <div className="orderDataRow">
                  <span className="orderLabel">Státusz:</span>
                  <select
                    className="statusSelect"
                    value={order.status || 'Függőben'}
                    onChange={(e) =>
                      handleStatusChange(order.orderId, e.target.value)
                    }
                  >
                    <option value="Függőben">Függőben</option>
                    <option value="Csomagolás alatt">Csomagolás alatt</option>
                    <option value="Kiszállítás alatt">Kiszállítás alatt</option>
                    <option value="Teljesítve">Teljesítve</option>
                    <option value="Törölve">Törölve</option>
                  </select>
                </div>
                <div className="orderDataRow">
                  <span className="orderLabel">Vásárló ID:</span>
                  <span className="orderValue">{order.userId}</span>
                </div>
                <div className="orderDataRow">
                  <span className="orderLabel">Fizetési mód:</span>
                  <span className="orderValue">{order.paymentMethod}</span>
                </div>
                <div className="orderDataRow">
                  <span className="orderLabel">Összesen:</span>
                  <span className="orderValue price">
                    {parseInt(order.totalAmount).toLocaleString('hu-HU')} Ft
                  </span>
                </div>
                <div className="orderDataRow">
                  <span className="orderLabel">Szállítási cím:</span>
                  <span className="orderValue">{order.shippingAddress}</span>
                </div>
              </div>
              {details.isOpen && details.orderId === order.orderId && (
                <div className="adminOrderDetails">
                  {details.data ? (
                    <>
                      {details.data.products.map((item, idx) => (
                        <div key={idx} className="adminOrderDetailsList">
                          <h3>{item.productName}</h3>
                          <h3>{item.quantity} db</h3>
                        </div>
                      ))}
                      {details.data.discount > 0 ? (
                        <h3>Kedvezmény: {details.data.discount} Ft</h3>
                      ) : null}
                    </>
                  ) : (
                    <p>Betöltés...</p>
                  )}
                </div>
              )}
              <div className="orderCardActions">
                <button
                  className="orderDetailBtn"
                  onClick={() => handleOrderDetails(order.orderId)}
                >
                  Részletek
                </button>
                <button
                  className="deleteOrderBtn"
                  onClick={() => confirmDelete(order.orderId)}
                >
                  Törlés
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
