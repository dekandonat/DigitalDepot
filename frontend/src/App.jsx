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
import UserOrders from './components/UserOrders';
import UsedProductPage from './components/UsedProductPage';
import ProductPage from './components/ProductPage';
import { slides } from "./data/MainPageGalleryData.json";
import "./main.css";

export default function App() { 
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const openProfile = () => {
    setIsLoginOpen(false);
    setIsProfileOpen(true);
  }

  const handleSearch = (searchText) => {
    navigate(`/search?q=${searchText}`);
  }

  const handleCategorySelect = (categoryId) => {
    navigate(`/category/${categoryId}`);
  }

  const handleProfileUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  }

  return (
    <div className="appContainer">
      <Navbar 
        onLoginClick={() => setIsLoginOpen(true)} 
        onCartClick={() => setIsCartOpen(true)}
        onProfileClick={openProfile}
        onSearch={handleSearch}
      />

      {location.pathname === "/" && (
        <MainPageGallery data={slides} />
      )}

      {!location.pathname.startsWith('/admin') && 
       location.pathname !== '/checkout' && 
       location.pathname !== '/my-orders' && 
       location.pathname !== '/used-products' &&
       !location.pathname.startsWith('/product/') && (
        <MainCategoriesMenu onCategorySelect={handleCategorySelect}/>
      )}

      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/category/:categoryId" element={<ProductList />} />
        <Route path="/search" element={<ProductList />} />
        
        <Route path="/product/:productId" element={<ProductPage />} />

        <Route path="/checkout" element={<Checkout />} />

        <Route path="/my-orders" element={
            <ProtectedRoute>
                <UserOrders />
            </ProtectedRoute>
        } />

        <Route path="/used-products" element={
            <ProtectedRoute>
                <UsedProductPage openProfile={openProfile} refreshTrigger={refreshTrigger} />
            </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminPage />
          </ProtectedRoute>
        } />

      </Routes>

      {isLoginOpen && <LoginForm onClose={() => setIsLoginOpen(false)} />}
      {isCartOpen && <Cart onClose={() => setIsCartOpen(false)} />}
      {isProfileOpen && <ProfilePopup onClose={() => setIsProfileOpen(false)} onProfileUpdate={handleProfileUpdate} />}
    </div>
  );
}