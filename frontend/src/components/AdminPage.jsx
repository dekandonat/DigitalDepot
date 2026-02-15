import React from 'react';
import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import AdminAddProduct from './AdminAddProduct';
import AdminProductList from './AdminProductList';
import AdminCreateAccount from './AdminCreateAccount';
import AdminOrdersList from './AdminOrdersList';
import AdminInventory from './AdminInventory';
import AdminUsedProducts from './AdminUsedProducts';
import AdminUsersList from './AdminUsersList';
import './AdminPage.css';

export default function AdminPage() {
  const [currentPage, setCurrentPage] = useState('list');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  return (
    <div className="adminPageContainer">
      <h1>Adminisztrátor felület</h1>
      <div className="selectDiv">
        <button
          onClick={() => setCurrentPage('list')}
          className={currentPage == 'list' ? 'activeBtn' : 'selectBtn'}
        >
          Termékek
        </button>
        <button
          onClick={() => setCurrentPage('add')}
          className={currentPage == 'add' ? 'activeBtn' : 'selectBtn'}
        >
          Termék hozzáadása
        </button>
        <button
          onClick={() => setCurrentPage('inventory')}
          className={currentPage == 'inventory' ? 'activeBtn' : 'selectBtn'}
        >
          Leltár
        </button>
        <button
          onClick={() => setCurrentPage('ordersList')}
          className={currentPage == 'ordersList' ? 'activeBtn' : 'selectBtn'}
        >
          Rendelések
        </button>
        <button
          onClick={() => setCurrentPage('usedProducts')}
          className={currentPage == 'usedProducts' ? 'activeBtn' : 'selectBtn'}
        >
          Használt termékek
        </button>
        
        {userRole === 'owner' && (
          <>
            <button
              onClick={() => setCurrentPage('usersList')}
              className={currentPage == 'usersList' ? 'activeBtn' : 'selectBtn'}
            >
              Felhasználók
            </button>
            <button
              onClick={() => setCurrentPage('createAccount')}
              className={currentPage == 'createAccount' ? 'activeBtn' : 'selectBtn'}
            >
              Admin fiók
            </button>
          </>
        )}
      </div>
      
      {currentPage === 'list' && <AdminProductList />}
      {currentPage === 'add' && <AdminAddProduct />}
      {currentPage === 'ordersList' && <AdminOrdersList />}
      {currentPage === 'inventory' && <AdminInventory />}
      {currentPage === 'usedProducts' && <AdminUsedProducts />}
      {currentPage === 'usersList' && userRole === 'owner' && <AdminUsersList />}
      {currentPage === 'createAccount' && userRole === 'owner' && <AdminCreateAccount />}
    </div>
  );
}