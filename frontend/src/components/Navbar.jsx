import logo from '../assets/logo.png'; 

export default function Navbar(){ 
    return ( 
    <nav id="navbar"> 
        <img 
        src = {logo} 
        alt = "Digital Depot logo" 
        id = "navbarLogo"
        ></img> 
    
        <div id="navbarActions">
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