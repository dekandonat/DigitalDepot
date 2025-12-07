import React, { useEffect, useState } from "react";
import './Cart.css';

export default function Cart({ onClose }){
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);

    const getCartFetch = (url, token) => {
        return fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then((response) => {
            if(!response.ok) {
                throw new Error(`GET hiba: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .catch((error) => {
            throw new Error(`Hiba történ: ${error.message}`);
        });
    };

    const patchCartFetch = (url, token, amount) => {
        return fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ amount: amount})
        })
        .then((response) => {
            if(!response.ok) {
                throw new Error(`PATCH hiba: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .catch((error) => {
            throw new Error(`Hiba történ: ${error.message}`);
        });
    };

    const fetchCartData = async () => {
        const token = localStorage.getItem('token');

        if(!token){
            return;
        }

        try{
            const response = await getCartFetch('http://localhost:3000/cart', token);

            if(response.result === 'success'){
                setCartItems(response.data.items);

                if(response.data.total && response.data.total.length > 0){
                    setCartTotal(response.data.total[0].total || 0);
                }
                else{
                    setCartTotal(0);
                }
            }
        } catch (error) {
            console.error("Hiba: ", error);
        }
    };

    const handleQuantityChange = async (productId, amount) => {
        const token = localStorage.getItem('token');

        if(!token){
            return;
        }

        try{
            const url = `/cart/${productId}`;
            await patchCartFetch(url, token, amount);
            fetchCartData();
        } catch (error){
            console.error("Hiba: ", error)
        }
    };

    useEffect(() => {
        fetchCartData();
    }, []);

    return (
        <div id="cartBackground" onClick={onClose}>
            <div id="cartContent" onClick={(e) => e.stopPropagation()}>
                <div id="cartHeader">
                    <h2>Kosár</h2>
                    <button id="cartCloseBtn" onClick={onCLose}>&times;</button>
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
                                    <button className="quantityBtn" onClick={() => handleQuantityChange(item.prodId, -1)}>-</button>
                                    <span style={{margin: '0 10px'}}>{item.quantity}</span>
                                    <button className="quantityBtn" onClick={() => handleQuantityChange(item.prodId, 1)}>+</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div id="cartFooter">
                    <div id="totalRow">
                        <span>Végösszeg: </span>
                        <span>{cartTotal ? cartTotal.toLocaleString() : 0} Ft</span>
                    </div>
                    <button id="checkoutBtn">Tovább a fizetéshez</button>
                </div>
            </div>
        </div>
    );
}