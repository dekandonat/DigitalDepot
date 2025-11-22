import { useState } from 'react';
import Navbar from "./components/Navbar"; 
import MainCategoriesMenu from "./components/MainCategoriesMenu";
import MainPageGallery from "./components/MainPageGallery";
import ProductList from "./components/ProductList";
import LoginForm from './components/LoginForm';
import {slides} from "./data/MainPageGalleryData.json";
import "./main.css";

export default function App() { 
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  return ( 
    <> 
      <Navbar onLoginClick = {() => setIsLoginOpen(true)}/> 
      <MainPageGallery data = {slides}/>
      <MainCategoriesMenu />
      <ProductList />

      {isLoginOpen && 
      <LoginForm onClose = {() => setIsLoginOpen(false)} />
      }
    </> 
  ) 
}