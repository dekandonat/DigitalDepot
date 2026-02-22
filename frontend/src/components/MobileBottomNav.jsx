import React from 'react';
import './MobileBottomNav.css';
import CartIcon from '../assets/NavImages/shopping-cart-icon.png';

export default function MobileBottomNav({ onOpenCategories, onOpenCart }) {
  return (
    <div id="mobileBottomNav">
        <button className="mobileNavBtn" onClick={onOpenCategories}>
            <span className="mobileNavIconText">☰</span>
            <span>Kategóriák</span>
        </button>
        
        <button className="mobileNavBtn" onClick={onOpenCart}>
            <img src={CartIcon} alt="Kosár" className="mobileNavIconImg" />
            <span>Kosár</span>
        </button>
    </div>
  );
}