import logo from '../assets/NavImages/logo.png'; 
import SearchIcon from "../assets/NavImages/search-icon.png";
import { useState } from "react";
import "./Navbar.css";

export default function Navbar({ onLoginClick }){ 
    return ( 
    <nav id="navbar"> 
        <img 
            src = {logo} 
            alt = "Digital Depot logo" 
            id = "navbarLogo"
        ></img> 
    
        <div id="navbarActions">
            <NavSearchBar />

            <button 
                id = "navbarCartBtn"
            ></button>

            <button
                id = "navbarLoginBtn"
                onClick={onLoginClick}
            ></button>
        </div>
    </nav> ); 
}

function NavSearchBar({onSearch}) {
    const [searched, setSearched] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(searched);
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
            <button
            id="navSearchButton"
            ><img src={SearchIcon} alt="Search Icon" id="searchIconId"></img></button>
        </form>
    );
}