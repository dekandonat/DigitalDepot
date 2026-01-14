import { useState, useEffect } from 'react';

export default function AdminOrdersList() {
  const [orders, setOrders] = useState([]);
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
  }, []);

  const handleDelete = async (orderId) => {
    if (!window.confirm("Biztosan törölni szeretnéd ezt a rendelést?")) {
        return;
    }

    try {
        const response = await fetch(`/adminRoute/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.ok) {
            setOrders(orders.filter(order => order.orderId !== orderId));
        } else {
            alert("Hiba történt a törlés során.");
        }
    } catch (error) {
        console.error(error);
        alert("Szerver hiba történt.");
    }
  };

  return (
    <div>
      <h1>Rendelések</h1>
      <div>
        {orders.map((order) => {
          return (
            <div key={order.orderId}>
              <h1>{order.totalAmount}</h1>
              <p>{order.shippingAddress}</p>
              <p>{new Date(order.orderDate).toLocaleDateString()}</p>
              <button onClick={() => handleDelete(order.orderId)}>Törlés</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}