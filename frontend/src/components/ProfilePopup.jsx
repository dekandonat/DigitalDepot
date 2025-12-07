import React from "react";
import { useEffect, useState } from "react";
import './LoginForm.css';
import profileIcon from '../assets/NavImages/profile-pic.png';

export default function ProfilePopup({onClose}){
    const [userData, setUserData] = useState({name: '', email: ''});

    useEffect(() => {
        const name = localStorage.getItem('user');
        const email = localStorage.getItem('email');
        
        setUserData({
            name: name,
            email: email
        })
    }, []);
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('email');
        onClose();
        window.location.reload();
    }

    return(
        <div className='formBackground' onMouseDown={onClose}>
            <div className='formContent' onMouseDown={(e) => e.stopPropagation()}>
                <button className='formCloseBtn' onClick={onClose}>&times;</button>
                <h2>Profilom</h2>

                <div class='profilePicContainer'>
                    <img src={profileIcon} alt='Profilkép' id='profileImg'></img>
                </div>

                <div class='profileDataSection'>
                    <div className='profileDataRow'>
                        <span className='profileLabel'>Felhasználónév:</span>
                        <span className='profileData'>{userData.name}</span>
                    </div>

                    <div className='profileDataRow'>
                        <span className='profileLabel'>E-mail:</span>
                        <span className='profileData'>{userData.email}</span>
                    </div>
                </div>

                <button onClick={handleLogout} className='submitBtn' id='logoutBtn'>Kijelentkezés</button>
            </div>
        </div>
    )
}