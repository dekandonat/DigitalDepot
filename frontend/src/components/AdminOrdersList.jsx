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
            </div>
          );
        })}
      </div>
    </div>
  );
}
