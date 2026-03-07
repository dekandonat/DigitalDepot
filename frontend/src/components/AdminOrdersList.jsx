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
  const [toast, setToast] = useState('');
  const [details, setDetails] = useState({
    data: null,
    isOpen: false,
    orderId: null,
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    const getMethodFetch = (url) => {
      return fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.status);
          }
          return response.json();
        })
        .then((data) => {
          return data;
        })
        .catch((err) => {
          throw new Error(err.message);
        });
    };

    getMethodFetch('/adminRoute/orders')
      .then((data) => {
        setOrders(data.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [token]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  const confirmDelete = (orderId) => {
    setModal({
      isOpen: true,
      orderId,
      type: 'confirm',
      title: 'Rendelés törlése',
      message:
        'Biztosan törölni szeretnéd ezt a rendelést? Ez a művelet nem vonható vissza.',
    });
  };

  const closeModal = () => {
    setModal({
      isOpen: false,
      orderId: null,
      type: 'confirm',
      title: '',
      message: '',
    });
  };

  const handleDelete = async () => {
    const orderId = modal.orderId;
    closeModal();

    try {
      const response = await fetch(`/adminRoute/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setOrders(orders.filter((order) => order.orderId !== orderId));
        showToast('Rendelés sikeresen törölve!');
      } else {
        setModal({
          isOpen: true,
          type: 'alert',
          title: 'Hiba történt',
          message: 'Hiba történt a törlés során.',
        });
      }
    } catch (error) {
      setModal({
        isOpen: true,
        type: 'alert',
        title: 'Szerver hiba',
        message: 'Nem sikerült csatlakozni a szerverhez.',
      });
    }
  };

  const handleOrderDetails = (id) => {
    if (details.isOpen && details.orderId == id) {
      setDetails({ data: null, isOpen: false, orderId: null });
    } else {
      apiFetch(`/adminRoute/orders/${id}`, {
        method: 'GET',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      })
        .then((data) => {
          setDetails({ data: data.data, isOpen: true, orderId: id });
        })
        .catch((err) => {
          console.error(err.message);
        });
    }
  };

  return (
    <div className="adminOrdersWrapper">
      <CustomModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={modal.type === 'confirm' ? handleDelete : closeModal}
        onCancel={closeModal}
        type={modal.type}
      />

      {toast && <div className="toastMessage">{toast}</div>}

      <div className="adminOrdersHeader">
        <h2>Rendelések</h2>
      </div>
      <div className="ordersGrid">
        {orders.length === 0 ? (
          <p className="noOrdersText">Nincsenek rendelések.</p>
        ) : (
          orders.map((order) => (
            <div key={order.orderId} className="adminOrderCard">
              <div className="orderCardTop">
                <h3>Rendelés #{order.orderId}</h3>
                <span className="orderDate">
                  {new Date(order.orderDate).toLocaleDateString('hu-HU')}
                </span>
              </div>
              <div className="orderCardBody">
                <div className="orderDataRow">
                  <span className="orderLabel">Összeg:</span>
                  <span className="orderValue priceValue">
                    {order.totalAmount} Ft
                  </span>
                </div>
                <div className="orderDataRow">
                  <span className="orderLabel">Szállítási cím:</span>
                  <span className="orderValue">{order.shippingAddress}</span>
                </div>
              </div>
              {details.isOpen && details.orderId == order.orderId ? (
                <div className="adminOrderDetails">
                  {details.data ? (
                    details.data.map((item) => (
                      <div className="adminOrderDetailsList">
                        <h3>{item.productName}</h3>
                        <h3>{item.quantity}</h3>
                      </div>
                    ))
                  ) : (
                    <h1>Betöltés...</h1>
                  )}
                </div>
              ) : null}
              <div className="orderCardActions">
                <button
                  className="orderDetailBtn"
                  onClick={() => {
                    handleOrderDetails(order.orderId);
                  }}
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
