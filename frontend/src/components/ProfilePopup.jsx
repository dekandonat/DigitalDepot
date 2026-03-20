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
        const data = await apiFetch('/user/profile');
        if (data.result === 'success') {
          setUserData({
            name: data.data.userName,
            email: data.data.email,
            bankAccountNumber: data.data.bankAccountNumber || '',
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    setIsLoggedIn(false);
    onClose();
    navigate('/');
  };

  return (
    <div className="formBackground" onClick={onClose}>
      <div className="formContent" onClick={(e) => e.stopPropagation()}>
        <button className="formCloseBtn" onClick={onClose}>
          X
        </button>
        <div className="profileHeader">
          <img src={profileIcon} alt="Profile" />
          <div className="profileHeaderText">
            <h2>{userData.name}</h2>
            <p>{userData.email}</p>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            navigate('/profile');
          }}
          className="myOrdersBtn"
        >
          Profil adatok
        </button>

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