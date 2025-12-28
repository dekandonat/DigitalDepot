import React from 'react';
import { useState, useEffect } from 'react';
import AdminAddProduct from './AdminAddProduct';
import AdminProductList from './AdminProductList';
import AdminCreateAccount from './AdminCreateAccount';
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
          className={currentPage == 'list' ? 'activeBtn' : 'selectBtn'}
        >
          Termékek
        </button>
        <button
          onClick={() => {
            setCurrentPage('add');
          }}
          className={currentPage == 'add' ? 'activeBtn' : 'selectBtn'}
        >
          Termék hozzáadása
        </button>
        <button
          onClick={() => {
            setCurrentPage('createAccount');
          }}
          className={currentPage == 'createAccount' ? 'activeBtn' : 'selectBtn'}
        >
          Admin fiók létrehozása
        </button>
      </div>
      {currentPage === 'list' && <AdminProductList />}
      {currentPage === 'add' && <AdminAddProduct />}
      {currentPage === 'createAccount' && <AdminCreateAccount />}
    </div>
  );
}
