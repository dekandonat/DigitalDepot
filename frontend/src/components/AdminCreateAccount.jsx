import './AdminCreateAccount.css';
import { useState } from 'react';
import { apiFetch } from '../assets/util/fetch';
import CustomModal from './CustomModal';

export default function AdminCreateAccount() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const [toast, setToast] = useState('');

  function handleNameChange(event) {
    setName(event.target.value);
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  const handleCreate = () => {
    apiFetch('/adminRoute/register', {
      body: {
        userName: name,
        password: password,
        email: email,
      },
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((data) => {
        if (data.result == 'success') {
          showToast('Fiók sikeresen létrehozva!');
          setName('');
          setEmail('');
          setPassword('');
        } else {
          setModal({ isOpen: true, title: 'Hiba történt', message: 'Sikertelen fiók létrehozás!' });
        }
      })
      .catch((err) => {
        setModal({ isOpen: true, title: 'Szerver hiba', message: 'Nem sikerült csatlakozni a szerverhez.' });
      });
  };

  return (
    <div className="adminFormWrapper">
      <CustomModal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={closeModal}
        type="alert"
      />

      {toast && <div className="toastMessage">{toast}</div>}

      <div className="adminFormHeader">
        <h2>Admin fiók létrehozása</h2>
      </div>
      <div className="adminFormCard">
        <form className="modernAdminForm">
          <div className="formControl">
            <label htmlFor="nameId">Felhasználónév</label>
            <input
              type="text"
              id="nameId"
              value={name}
              onChange={handleNameChange}
            />
          </div>
          <div className="formControl">
            <label htmlFor="emailId">Email cím</label>
            <input
              type="email"
              id="emailId"
              value={email}
              onChange={handleEmailChange}
            />
          </div>
          <div className="formControl">
            <label htmlFor="passwordId">Jelszó</label>
            <input
              type="password"
              id="passwordId"
              value={password}
              onChange={handlePasswordChange}
            />
          </div>
          <button
            type="button"
            className="adminSubmitBtn"
            onClick={handleCreate}
          >
            Létrehozás
          </button>
        </form>
      </div>
    </div>
  );
}