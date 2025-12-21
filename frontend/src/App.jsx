import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from "./components/Navbar"; 
import MainCategoriesMenu from "./components/MainCategoriesMenu";
import MainPageGallery from "./components/MainPageGallery";
import ProductList from "./components/ProductList";
import LoginForm from './components/LoginForm';
import Cart from './components/Cart';
import ProfilePopup from './components/ProfilePopup';
import ProtectedRoute from './components/ProtectedRoute';
import AdminPage from './components/AdminPage';
import Checkout from './components/Checkout';
import {slides} from "./data/MainPageGalleryData.json";
import "./main.css";

export default function App() { 
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const openProfile = () => {
    setIsLoginOpen(false);
    setIsProfileOpen(true);
  }

  const handleSearch = (text) => {
    navigate(`/search?q=${text}`);
  }

  const handleCategorySelect = (id) => {
    if(id){
      navigate(`/category/${id}`);
    }
    else{
      navigate('/');
    }
  }

  return ( 
    <> 
      <Navbar 
        onLoginClick={() => setIsLoginOpen(true)}
        onCartClick={() => setIsCartOpen(true)}
        onProfileClick={openProfile}
        onSearch={handleSearch}
      /> 

      {location.pathname === "/" && (
        <MainPageGallery data={slides} />
      )}

      {!location.pathname.startsWith('/admin') && (
        <MainCategoriesMenu onCategorySelect={handleCategorySelect}/>
      )}

      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/category/:categoryId" element={<ProductList />} />
        <Route path="/search" element={<ProductList />} />
        <Route path = "/checkout" element = {<Checkout />}></Route>

        <Route path = "/admin" element = {
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        }></Route>

      </Routes>

      {isLoginOpen && <LoginForm onClose={() => setIsLoginOpen(false)} />}
      {isCartOpen && <Cart onClose={() => setIsCartOpen(false)} />}
      {isProfileOpen && <ProfilePopup onClose={() => setIsProfileOpen(false)} />}
    </> 
  ) 
}