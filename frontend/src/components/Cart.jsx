import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../assets/util/fetch';
import './Cart.css';

export default function Cart({ onClose, isClosing }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);

  const navigate = useNavigate();

  const fetchCartData = async () => {
    try {
      const response = await apiFetch('/cart');

      if (response.result === 'success') {
        setCartItems(response.data.items);
        if (response.data.total && response.data.total.length > 0) {
          setCartTotal(response.data.total[0].total || 0);
        } else {
          setCartTotal(0);
        }
      }
    } catch (error) {
      console.error('Hiba: ', error.message);
    }
  };

  const handleQuantityChange = async (productId, amount) => {
    try {
      const url = `/cart/${productId}`;
      await apiFetch(url, {
        method: 'PATCH',
        body: { amount: amount },
      });
      fetchCartData();
    } catch (error) {
      console.error('Hiba: ', error);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  return (
    <div
      id="cartBackground"
      className={isClosing ? 'closing' : ''}
      onClick={onClose}
    >
      <div id="cartContent" onClick={(e) => e.stopPropagation()}>
        <div id="cartHeader">
          <h2>Kosár</h2>
          <button id="cartCloseBtn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div id="cartItemsList">
          {cartItems.length === 0 ? (
            <p>Üres a kosár</p>
          ) : (
            cartItems.map((item) => (
              <div key={item.prodId} className="cartItem">
                <div className="cartItemInfo">
                  <h4>{item.productName}</h4>
                  <p>{item.productPrice} Ft</p>
                </div>
                <div className="cartControls">
                  <button
                    className="quantityBtn"
                    onClick={() => handleQuantityChange(item.prodId, -1)}
                  >
                    -
                  </button>
                  <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                  <button
                    className="quantityBtn"
                    onClick={() => handleQuantityChange(item.prodId, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div id="cartFooter">
          <div id="totalRow">
            <span>Végösszeg: </span>
            <span>{cartTotal.toLocaleString('hu-HU')} Ft</span>
          </div>
          <button
            id="checkoutBtn"
            onClick={() => {
              onClose();
              navigate('/checkout');
            }}
            disabled={cartItems.length == 0}
          >
            Tovább a fizetéshez
          </button>
        </div>
      </div>
    </div>
  );
}
