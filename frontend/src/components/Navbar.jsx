import logo from '../assets/NavImages/logo.png'; 
import SearchIcon from "../assets/NavImages/search-icon.png";
import { useEffect, useState } from "react";
import "./Navbar.css";
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onLoginClick, onProfileClick, onCartClick, onSearch }){ 
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('userName');
        if(storedUser){
            setUser(storedUser);
        }
    }, []);

    return ( 
    <nav id="navbar"> 
        <img 
            src = {logo} 
            alt = "Digital Depot logo" 
            id = "navbarLogo"
            onClick={() => navigate('/')}
        ></img> 
    
        <div id="navbarActions">
            <NavSearchBar onSearch={onSearch} />

            <button 
                id = "navbarCartBtn"
                onClick={onCartClick}
            ></button>

            {user ? (
                <button
                id = "navbarProfileBtn"
                onClick={onProfileClick}
                ></button>
            ) : (
                <button
                id = "navbarLoginBtn"
                onClick={onLoginClick}
                ></button>
            )}
        </div>
    </nav> ); 
}

function NavSearchBar({onSearch}) {
    const [searched, setSearched] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch){
            onSearch(searched);
        }
    };

    return (
        <form className="searchBar" onSubmit={handleSearch}>
            <input
                type="text"
                value={searched}
                onChange={(e) => setSearched(e.target.value)}
                placeholder="Keressen rá valamire"
                id="navSearchText"
            ></input>
            <button id="navSearchButton" type="submit">
                <img src={SearchIcon} alt="Search Icon" id="searchIconId"></img>
            </button>
        </form>
    );
}