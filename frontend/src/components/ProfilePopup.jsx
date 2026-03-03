import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../assets/util/fetch';
import './LoginForm.css';
import profileIcon from '../assets/NavImages/profile-pic.png';
import { jwtDecode } from 'jwt-decode';

export default function ProfilePopup({
  onClose,
  onProfileUpdate,
  setIsLoggedIn,
}) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    bankAccountNumber: '',
  });
  const [bankAccountInput, setBankAccountInput] = useState('');
  const [isEditingBank, setIsEditingBank] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  let role;

  try {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      role = decoded.role;
    }
  } catch (err) {
    console.log(err.message);
  }

  const isAdminPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiFetch('/user/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (data.result === 'success') {
          setIsLoggedIn(true);
          setUserData(data.data);
          setBankAccountInput(data.data.bankAccountNumber || '');
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('email');
    role = null;
    onClose();
    window.location.href = '/';
  };

  const saveBankAccount = async () => {
    try {
      await apiFetch('/user/bank-account', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: { bankAccountNumber: bankAccountInput },
      });
      setUserData({ ...userData, bankAccountNumber: bankAccountInput });
      setIsEditingBank(false);
      if (onProfileUpdate) onProfileUpdate();
    } catch (err) {
      console.error(err);
    }
  };

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
            <span className="profileData">{userData.userName}</span>
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
                <button onClick={saveBankAccount} className="saveBankBtn">
                  Mentés
                </button>
              </div>
            ) : (
              <div className="bankDisplayContainer">
                <span className="profileData">
                  {userData.bankAccountNumber || 'Nincs megadva'}
                </span>
                <button
                  onClick={() => setIsEditingBank(true)}
                  className="editBankBtn"
                >
                  ✏️
                </button>
              </div>
            )}
          </div>
        </div>

        {role === 'admin' || role === 'owner' ? (
          <>
            <button
              onClick={() => {
                onClose();
                navigate(isAdminPage ? '/' : '/admin');
              }}
              className="adminPageBtn"
            >
              {isAdminPage ? 'Főoldal' : 'Adminisztrátor'}
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/adminChat');
              }}
              className="adminChatBtn"
            >
              Chatpanel
            </button>
          </>
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