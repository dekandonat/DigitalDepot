import React from 'react';
import { useState, useEffect } from 'react';
import AdminAddProduct from './AdminAddProduct';
import AdminProductList from './AdminProductList';
import './AdminPage.css';

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState('list');

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Adminisztrátor felület</h1>
      <div className="selectDiv">
        <button
          onClick={() => {
            setCurrentPage('list');
          }}
          className="selectBtn"
        >
          Termékek
        </button>
        <button
          onClick={() => {
            setCurrentPage('add');
          }}
          className="selectBtn"
        >
          Termék hozzáadása
        </button>
      </div>
      {currentPage == 'list' ? <AdminProductList /> : <AdminAddProduct />}
    </div>
  );
}
