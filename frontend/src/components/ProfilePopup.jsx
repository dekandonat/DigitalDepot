import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginForm.css';
import profileIcon from '../assets/NavImages/profile-pic.png';
import { jwtDecode } from 'jwt-decode';

export default function ProfilePopup({ onClose, onProfileUpdate }) {
  const [userData, setUserData] = useState({ name: '', email: '', bankAccountNumber: '' });
  const [bankAccountInput, setBankAccountInput] = useState('');
  const [isEditingBank, setIsEditingBank] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  let role;
  try {
    role = jwtDecode(token);
    role = role.role;
  } catch (err) {
    console.log('Hiba: ' + err.message);
  }

  useEffect(() => {
    fetch('http://localhost:3000/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
        if(data.result === 'success'){
            setUserData(data.data);
            setBankAccountInput(data.data.bankAccountNumber || '');
        }
    });
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('email');
    role = null;
    onClose();
    window.location.reload();
  };

  const saveBankAccount = async () => {
      await fetch('http://localhost:3000/user/bank-account', {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ bankAccountNumber: bankAccountInput })
      });
      setUserData({...userData, bankAccountNumber: bankAccountInput});
      setIsEditingBank(false);
      if (onProfileUpdate) onProfileUpdate();
  }

  return (
    <div className="formBackground" onMouseDown={onClose}>
      <div className="formContent" onMouseDown={(e) => e.stopPropagation()}>
        <button className="formCloseBtn" onClick={onClose}>
          &times;
        </button>
        <h2>Profilom</h2>
        <div className="profilePicContainer">
          <img src={profileIcon} alt="Profilkép" id="profileImg"></img>
        </div>
        <div className="profileDataSection">
          <div className="profileDataRow">
            <span className="profileLabel">Felhasználónév:</span>
            <span className="profileData">{userData.name}</span>
          </div>

          <div className="profileDataRow">
            <span className="profileLabel">E-mail:</span>
            <span className="profileData">{userData.email}</span>
          </div>

          <div className="profileDataRow">
            <span className="profileLabel">Számlaszám:</span>
            {isEditingBank ? (
                <div className="bankEditContainer">
                    <input 
                        value={bankAccountInput} 
                        onChange={(e) => setBankAccountInput(e.target.value)}
                        placeholder="Pl. 117733..."
                        className="bankInput"
                    />
                    <button onClick={saveBankAccount} className="saveBankBtn">Mentés</button>
                </div>
            ) : (
                <div className="bankDisplayContainer">
                    <span className="profileData">{userData.bankAccountNumber || 'Nincs megadva'}</span>
                    <button onClick={() => setIsEditingBank(true)} className="editBankBtn">✏️</button>
                </div>
            )}
          </div>
        </div>

        {role === 'admin' ? (
          <button
            onClick={() => {
              onClose();
              navigate('/admin');
            }}
            className="adminPageBtn"
          >
            Adminisztrátor
          </button>
        ) : null}

        <button
          onClick={() => {
            onClose();
            navigate('/used-products');
          }}
          className="usedProductBtn"
        >
          Használt termék leadása
        </button>

        <button
          onClick={() => {
            onClose();
            navigate('/my-orders');
          }}
          className="myOrdersBtn"
        >
          Rendeléseim
        </button>
        <button onClick={handleLogout} className="submitBtn" id="logoutBtn">
          Kijelentkezés
        </button>
      </div>
    </div>
  );
}