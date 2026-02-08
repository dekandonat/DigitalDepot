import './AdminCreateAccount.css';
import { useState, useEffect } from 'react';
import { apiFetch } from '../assets/util/fetch';

export default function AdminCreateAccount() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const token = localStorage.getItem('token');

  function handleNameChange(event) {
    setName(event.target.value);
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  return (
    <div className="adminCreationDiv">
      <h1>Admin fiók létrehozása</h1>
      <form className="adminCreation">
        <label htmlFor="nameId">Felhasználónév</label>
        <input
          type="text"
          id="nameId"
          value={name}
          onChange={handleNameChange}
        ></input>
        <label htmlFor="emailId">Email</label>
        <input
          type="email"
          id="emailId"
          value={email}
          onChange={handleEmailChange}
        ></input>
        <label htmlFor="passwordId">Jelszó</label>
        <input
          type="password"
          id="passwordId"
          value={password}
          onChange={handlePasswordChange}
        ></input>
        <button
          type="button"
          onClick={() => {
            apiFetch('adminRoute/register', {
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
                  alert('Fiók sikeresen létrehozva!');
                } else {
                  alert('Sikertelen fiók létrehozás!');
                }
              })
              .catch((err) => {
                console.error(err);
              });
          }}
        >
          Létrehozás
        </button>
      </form>
    </div>
  );
}
