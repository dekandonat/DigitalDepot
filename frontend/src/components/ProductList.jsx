import React from 'react';
import { useState, useEffect } from 'react';
import './ProductList.css';

function ProductCard({ product }) {
    return (
        <div className = "productCard">
            <img src={product.productImg} alt={product.productName} />
            <h3>{product.productName}</h3>
            <p>{product.productDescription}</p>
            <span className="productPrice">{product.productPrice} Ft</span>
            <input type="button" value="Kosárba" id="intoCartButton"></input>
        </div>
    );
}

export default function ProductList() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const getMethodFetch = (url) => {
            return fetch(url)
            .then((response) => {
                if(!response.ok)
                {
                    throw new Error(`$GET hiba: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .catch((error) => {
                throw new Error(`Hiba történt: ${error.message}`);
            });
        }

        const fecthProducts = async () => {
            const url = '/products';
            
            try{
                const result = await getMethodFetch(url);
                if (result.data){
                    setProducts(result.data);
                }
            } catch (error)
            {
                console.error("Hiba történt: ", error)
            }
        }

        fecthProducts();
    }, []);

    return (
        <div className="productListContainer">
            <h2 id="productGridTitle">Kiemelt termékeink</h2>
            <div className="productGrid">
                {products.map(product => (
                    <ProductCard key={product.prodId} product={product} />
                ))}
            </div>
        </div>
    );
}