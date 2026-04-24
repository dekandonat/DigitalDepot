import React, { useState } from 'react';
import { apiFetch } from '../assets/util/fetch';
import './LoginForm.css';
import PasswordReset from './passwordReset';

export default function LoginForm({ onClose, setIsLoggedIn }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isReset, setIsReset] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [userName, setUsername] = useState('');

  const handleUserNameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handlePassword2Change = (e) => {
    setPassword2(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: '', type: '' });
    }, 3000);
  };

  const stopFormClosing = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (!isLogin && password !== password2) {
        throw new Error('A két jelszó nem egyezik!');
      }

      let url;
      if (isLogin === true) {
        url = '/user/login';
      } else {
        url = '/user/register';
      }

      let dataValues = {
        email: email,
        password: password,
        userName: userName,
      };

      const response = await apiFetch(url, {
        method: 'POST',
        credentials: 'include',
        body: dataValues,
      });
      if (isLogin) {
        localStorage.setItem('token', response.message.token);
        localStorage.setItem('user', response.message.userName);
        localStorage.setItem('email', response.message.email);
        setIsLoggedIn(true);
        onClose();
        window.location.reload();
      } else {
        showToast('Sikeres regisztráció!', 'success');
        setIsLogin(true);
        setUsername('');
        setPassword('');
        setPassword2('');
        setEmail('');
      }
    } catch (error) {
      console.error('Hiba történt: ', error);
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="formBackground" onMouseDown={onClose}>
      {toast.message && (
        <div className={`toastMessage toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
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

            <form onSubmit={submit}>
              {!isLogin && (
                <div className="formItems">
                  <label htmlFor="userNameInput">Felhasználónév</label>
                  <input
                    onChange={handleUserNameChange}
                    type="text"
                    name="userName"
                    id="userNameInput"
                    required
                    value={userName}
                  />
                </div>
              )}
              <div className="formItems">
                <label htmlFor="userEmailInput">E-mail cím</label>
                <input
                  onChange={handleEmailChange}
                  type="email"
                  name="email"
                  id="userEmailInput"
                  placeholder="pelda@gmail.com"
                  required
                  value={email}
                />
              </div>
              <div className="formItems">
                <label htmlFor="userPassword">Jelszó</label>
                <input
                  onChange={handlePasswordChange}
                  type="password"
                  name="password"
                  id="userPassword"
                  required
                  value={password}
                />
              </div>
              {!isLogin && (
                <div className="formItems">
                  <label htmlFor="userPassword2">Jelszó megerősítése</label>
                  <input
                    onChange={handlePassword2Change}
                    type="password"
                    name="password2"
                    id="userPassword2"
                    required
                    value={password2}
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
