import './AdminCreateAccount.css';
import { useState, useEffect } from 'react';

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

  const postMethodFetch = (url, body) => {
    return fetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
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

  return (
    <div className="adminCreationDiv">
      <form className="adminCreation">
        <label htmlFor="nameId">Felhasználónév: </label>
        <input
          type="text"
          id="nameId"
          value={name}
          onChange={handleNameChange}
        ></input>
        <label htmlFor="emailId">Email: </label>
        <input
          type="email"
          id="emailId"
          value={email}
          onChange={handleEmailChange}
        ></input>
        <label htmlFor="passwordId">Jelszó: </label>
        <input
          type="password"
          id="passwordId"
          value={password}
          onChange={handlePasswordChange}
        ></input>
        <button
          type="button"
          onClick={() => {
            postMethodFetch('adminRoute/register', {
              userName: name,
              password: password,
              email: email,
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
