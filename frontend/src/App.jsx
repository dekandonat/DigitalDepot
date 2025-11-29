import { use, useState } from 'react';
import Navbar from "./components/Navbar"; 
import MainCategoriesMenu from "./components/MainCategoriesMenu";
import MainPageGallery from "./components/MainPageGallery";
import ProductList from "./components/ProductList";
import LoginForm from './components/LoginForm';
import ProfilePopup from './components/ProfilePopup';
import {slides} from "./data/MainPageGalleryData.json";
import "./main.css";

export default function App() { 
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const openProfile = () => {
    setIsLoginOpen(false);
    setIsProfileOpen(true);
  }

  return ( 
    <> 
      <Navbar 
        onLoginClick = {() => setIsLoginOpen(true)}
        onProfileClick = {openProfile}
      /> 
      <MainPageGallery data = {slides}/>
      <MainCategoriesMenu />
      <ProductList />

      {isLoginOpen && 
        <LoginForm onClose = {() => setIsLoginOpen(false)} />
      }

      {isProfileOpen &&
        <ProfilePopup onClose={() => setIsProfileOpen(false)} />
      }
    </> 
  ) 
}