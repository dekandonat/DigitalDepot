import { useState } from 'react';
import './passwordReset.css';
import CustomModal from './CustomModal';

const postMethodFetch = (url, body) => {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response);
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((err) => {
      throw new Error(err);
    });
};

export default function PasswordReset(props) {
  const [isCode, setIsCode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [code, setCode] = useState('');
  const [modal, setModal] = useState({ isOpen: false, title: '', message: '' });
  const [toast, setToast] = useState('');

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast('');
    }, 3000);
  };

  function handleEmailChange(event) {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
  }

  function handlePassword2Change(event) {
    setPassword2(event.target.value);
  }

  function handleCodeChange(event) {
    setCode(event.target.value);
  }

  function getCode() {
    if (email != '') {
      postMethodFetch('/user/reset-code', { email: email })
        .then((data) => {
          if (data.result == 'success') {
            setIsCode(false);
          } else {
            setModal({ isOpen: true, title: 'Hiba', message: 'Hiba történt! Ellenőrizze a megadott email címet' });
          }
        })
        .catch((err) => {
          console.log(err.message);
        });
    } else {
      setModal({ isOpen: true, title: 'Figyelem', message: 'Adja meg email címét!' });
    }
  }

  function changePassword() {
    if (password == '' || code == '') {
      setModal({ isOpen: true, title: 'Figyelem', message: 'Minden mezőt ki kell tölteni' });
      return;
    }

    if (password !== password2) {
      setModal({ isOpen: true, title: 'Figyelem', message: 'A jelszavak nem egyeznek' });
    } else {
      postMethodFetch('/user/reset-password', {
        email: email,
        code: code,
        password: password.trim(),
      })
        .then((data) => {
          console.log(data);
          if (data.result == 'success') {
            showToast('Sikeres jelszó visszaállítás!');
            props.resetState(false);
          } else {
            setModal({ isOpen: true, title: 'Hiba', message: data.message });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  return (
    <>
      <CustomModal 
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onConfirm={closeModal}
        type="alert"
      />
      {toast && <div className="toastMessage">{toast}</div>}

      {isCode ? (
        <form className="passwordResetForm">
          <h1>Helyreállító kód kérése</h1>
          <label htmlFor="emailResetInput">E-mail cím</label>
          <input
            type="email"
            value={email}
            onChange={handleEmailChange}
            id="emailResetInput"
          ></input>

          <button type="button" onClick={getCode}>
            Kód kérése
          </button>
        </form>
      ) : (
        <form className="passwordResetForm">
          <h1>Jelszó helyreállítása</h1>
          <label>Kód</label>
          <input type="text" value={code} onChange={handleCodeChange}></input>
          <label>Új jelszó</label>
          <input
            type="password"
            value={password}
            onChange={handlePasswordChange}
          ></input>
          <label>Jelszó újra</label>
          <input
            type="password"
            value={password2}
            onChange={handlePassword2Change}
          ></input>

          <button type="button" onClick={changePassword}>
            Jelszó helyreállítása
          </button>
        </form>
      )}
    </>
  );
}