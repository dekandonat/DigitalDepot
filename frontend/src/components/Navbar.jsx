import logo from '../assets/logo.png'; 

export default function Navbar(){ 
    return ( 
    <nav id="navbar"> 
        <img 
        src = {logo} 
        alt = "Digital Depot logo" 
        style = {{height: '50px', width: 'auto'}} 
        ></img> 
        
        <input 
        type="button" 
        value="Bejelentkezés" 
        style={{padding: '8px 16px', cursor: 'pointer'}} 
        ></input> 
    </nav> ); 
}