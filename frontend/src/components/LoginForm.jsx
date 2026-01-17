import React from 'react';
import { useState } from 'react';
import './LoginForm.css';
import PasswordReset from './passwordReset';

const postMethodFetch = async (url, data) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`POST hiba: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Hiba történt: ${error.message}`);
  }
};

export default function LoginForm({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const stopFormClosing = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    let form = e.target;
    let email = form.email.value.trim();
    let password = form.password.value.trim();
    let userName = form.userName?.value.trim();
    let password2 = form.password2?.value.trim();

    if (!isLogin && password !== password2) {
      setErrorMsg('A két jelzsó nem egyezik!');
      return;
    }

    let url;
    if (isLogin === true) {
      url = 'http://localhost:3000/user/login';
    } else {
      url = 'http://localhost:3000/user/register';
    }

    let dataValues = {
      email: email,
      password: password,
      userName: userName,
    };

    try {
      const response = await postMethodFetch(url, dataValues);

      if (isLogin) {
        localStorage.setItem('token', response.message.token);
        localStorage.setItem('user', response.message.userName);
        localStorage.setItem('email', response.message.email);
        onClose();
        window.location.reload();
      } else {
        setSuccessMsg('Sikeres regisztrácó!');
        setIsLogin(true);
        form.reset();
      }
    } catch (error) {
      console.error('Hiba történt: ', error);
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="formBackground" onMouseDown={onClose}>
      <div className="formContent" onMouseDown={(e) => e.stopPropagation()}>
        <button className="formCloseBtn" onClick={onClose}>
          &times;
        </button>

        {!isReset ? (
          <>
            <h2>{isLogin ? 'Bejelentkezés' : 'Regisztráció'}</h2>

            {errorMsg && (
              <p className="message" id="error">
                {errorMsg}
              </p>
            )}
            {successMsg && (
              <p className="message" id="success">
                {successMsg}
              </p>
            )}
            <form onSubmit={submit}>
              {!isLogin && (
                <div className="formItems">
                  <label for="userNameInput">Felhasználónév</label>
                  <input
                    type="text"
                    name="userName"
                    id="userNameInput"
                    required
                  />
                </div>
              )}
              <div className="formItems">
                <label for="userEmailInput">E-mail cím</label>
                <input
                  type="email"
                  name="email"
                  id="userEmailInput"
                  placeholder="pelad@gmail.com"
                  required
                />
              </div>
              <div className="formItems">
                <label for="userPassword">Jelszó</label>
                <input
                  type="password"
                  name="password"
                  id="userPassword"
                  required
                />
              </div>
              {!isLogin && (
                <div className="formItems">
                  <label for="userPassword2">Jelszó megerősítése</label>
                  <input
                    type="password"
                    name="password2"
                    id="userPassword2"
                    required
                  />
                </div>
              )}

              <button type="submit" className="submitBtn">
                {isLogin ? 'Bejelentkezés' : 'Regisztráció'}
              </button>
            </form>

            <p className="switchModeText" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Regisztráció' : 'Bejelentkezés'}
            </p>

            {isLogin ? (
              <p
                className="forgotPassword"
                onClick={() => {
                  setIsReset(true);
                }}
              >
                Elfelejtett jelszó
              </p>
            ) : null}
          </>
        ) : (
          <PasswordReset resetState={setIsReset} />
        )}
      </div>
    </div>
  );
}
