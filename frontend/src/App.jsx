import { useState } from 'react';
import Navbar from "./components/Navbar"; 
import MainCategoriesMenu from "./components/MainCategoriesMenu";
import MainPageGallery from "./components/MainPageGallery";
import ProductList from "./components/ProductList";
import LoginForm from './components/LoginForm';
import Cart from './components/Cart';
import {slides} from "./data/MainPageGalleryData.json";
import "./main.css";

export default function App() { 
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [selectedCategoryId, setSelectedCategoryId] = useState(false);
  return ( 
    <> 
      <Navbar 
        onLoginClick = {() => setIsLoginOpen(true)}
        onCartClick = {() => setIsCartOpen(true)}
      /> 
      <MainPageGallery data = {slides}/>
      <MainCategoriesMenu onCategorySelect={setSelectedCategoryId}/>
      <ProductList selectedCategoryId={selectedCategoryId}/>

      {isLoginOpen && 
        <LoginForm onClose = {() => setIsLoginOpen(false)} />
      }

      {isCartOpen && 
        <Cart onClose = {() => setIsCartOpen(false)} />
      }
    </> 
  ) 
}