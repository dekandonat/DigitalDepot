import logo from '../assets/NavImages/logo.png'; 
import NavSearchBar from './NavSearchBar';
import "./Navbar.css";

export default function Navbar(){ 
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
            ></button>
        </div>
    </nav> ); 
}