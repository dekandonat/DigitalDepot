import React from 'react';
import { useState, useEffect } from 'react';
import AdminAddProduct from './AdminAddProduct';

export default function AdminPage() {
  const [ProductList, setProductList] = useState([]);

  useEffect(() => {
    const url = '/products';

    const getMethodFetch = (url) => {
      return fetch(url)
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

    getMethodFetch(url)
      .then((data) => {
        setProductList(data.data);
      })
      .catch((err) => {
        console.error(err.message);
      });
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Adminisztrátor felület</h1>
      <AdminAddProduct />
    </div>
  );
}
