import logo from '../assets/logo.png'; 
import NavSearchBar from './NavSearchBar';

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

            <input
            type = "button"
            value = "CartPlaceholder"
            id = "navbarCartBtn"
            ></input>

            <input 
            type = "button" 
            value  ="Bejelentkezés" 
            id = "navbarLoginBtn"
            ></input> 
        </div>
    </nav> ); 
}