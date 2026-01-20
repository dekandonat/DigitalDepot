import { useState } from 'react';
import './passwordReset.css';

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
      throw new Error(err.message);
    });
};

export default function PasswordReset(props) {
  const [isCode, setIsCode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [code, setCode] = useState('');

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
            alert('Hiba történt! Ellenőrizze a megadott email címet');
          }
        })
        .catch((err) => {
          console.log(err.message);
        });
    } else {
      alert('Adja meg email címét!');
    }
  }

  function changePassword() {
    if (password == '' || code == '') {
      alert('Minden mezőt ki kell tölteni');
      return;
    }

    if (password !== password2) {
      alert('A jelszavak nem egyeznek');
    } else {
      postMethodFetch('/user/reset-password', {
        email: email,
        code: code,
        password: password.trim(),
      })
        .then((data) => {
          console.log(data);
          if (data.result == 'success') {
            alert('Sikeres jelszó visszaállítás!');
            props.resetState(false);
          } else {
            alert(data.message);
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  return (
    <>
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
