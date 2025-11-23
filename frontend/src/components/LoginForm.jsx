import React from 'react';
import { useState } from 'react';
import './LoginForm.css';

const postMethodFetch = async(url, data) => {
    try{
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if(!response.ok){
            throw new Error(`POST hiba: ${response.status} ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {

        throw new Error(`Hiba történt: ${error.message}`);
    }
}

export default function LoginForm({ onClose }){
    const [isLogin, setIsLogin] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const stopFormClosing = (e) => {
        e.stopPropagation();
    }

    const submit = async(e) => {
        let form = e.target;
        let email = form.email.value;
        let password = form.password.value;
        let userName = form.userName.value;
        let password2 = form.password2.value;
        console.log(email, password, userName, password2);
    }

    if(!isLogin && password !== password2){ű
        setErrorMsg('A két jelzsó nem egyezik!');
        form.reset();
        return;
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
                            <input type='text' name='userName' id='userNameInput' required/>
                        </div>
                    )}
                    <div className='formItems'>
                        <label for='userEmailInput'>E-mail cím</label>
                        <input type='email' name='email' id='userEmailInput' placeholder='pelad@gmail.com' required/>
                    </div>
                    <div className='formItems'>
                        <label for='userPassword'>Jelszó</label>
                        <input type='password' name='password' id='userPassword' required/>
                    </div>
                    {!isLogin && (
                        <div className='formItems'>
                        <label for='userPassword2'>Jelszó megerősítése</label>
                        <input type='password' name='password2' id='userPassword2' required/>
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