import React from 'react';
import { useState } from 'react';
import './LoginForm.css';

export default function LoginForm({ onClose }){
    const [isLogin, setIsLogin] = useState(true);

    const stopFormClosing = (e) => {
        e.stopPropagation();
    }

    return (
        <div className='formBackground' onClick={onClose}>
            <div className='formContent' onClick={stopFormClosing}>
                <button className='formCloseBtn' onClick={onClose}>&times;</button>
                <h2>{isLogin ? 'Bejelentkezés' : 'Regisztráció'}</h2>

                <form>
                    {!isLogin && (
                        <div className='formItems'>
                            <label for='userNameInput'>Felhasználónév</label>
                            <input type='text' id='userNameInput' />
                        </div>
                    )}
                    <div className='formItems'>
                        <label for='userEmailInput'>E-mail cím</label>
                        <input type='email' id='userEmailInput' placeholder='pelad@gmail.com'/>
                    </div>
                    <div className='formItems'>
                        <label for='userPassword'>Jelszó</label>
                        <input type='password' id='userPassword' />
                    </div>
                    {!isLogin && (
                        <div className='formItems'>
                        <label for='userPassword2'>Jelszó megerősítése</label>
                        <input type='password' id='userPassword2' />
                    </div>
                    )}

                    <button type="submit" className='submitBtn'>
                        {isLogin ? 'Bejelentkezés' : 'Regisztráció'}
                    </button>
                </form>

                <p className="switchModeText" onClick={() => setIsLogin(!isLogin)}>
                    {isLogin ? 'Regisztráció' : 'Bejelentkezés'}
                </p>
            </div>
        </div>
    );
}