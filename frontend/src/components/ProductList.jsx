import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import './ProductList.css';

function ProductCard({ product }) {

    const postToCartFetch = (url, token) => {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then((response) => {
            if(!response.ok){
                throw new Error(`POST hiba: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .catch((error) => {
            throw new Error(`Hiba történt: ${error.message}`);
        });
    };

    const addToCart = async () => {
        const token = localStorage.getItem('token');

        if(!token){
            alert("Ehez be kell jelentkeznie!");
            return;
        }

        const url = `/cart/add/${product.prodId}/1`;

        try{
            const response = await postToCartFetch(url, token);
        } catch(error){
            console.error("Hiba: ", error);
            alert("Valami hiba van!");
        }
    };

    return (
        <div className="productCard">
            <img src={product.productImg} alt={product.productName} />
            <h3>{product.productName}</h3>
            <p>{product.productDescription}</p>
            <span className="productPrice">{product.productPrice} Ft</span>
            <input type="button" value="Kosárba" id="intoCartButton" onClick={addToCart}></input>
        </div>
    );
}

export default function ProductList() {
    const [products, setProducts] = useState([]);

    const { categoryId } = useParams();
    const [searchParams] = useSearchParams();
    const searchWord = searchParams.get('q');

    useEffect(() => {
        const getMethodFetch = (url) => {
            return fetch(url)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`$GET hiba: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .catch((error) => {
                    throw new Error(`Hiba történt: ${error.message}`);
                });
        }

        const fetchProducts = async () => {
            try{
                let url = '/products';

                if(searchWord){
                    url = `/products?search=${searchWord}`;
                }

                const productsResult = await getMethodFetch(url);
                const categoriesResult = await getMethodFetch('/category');

                let allProducts = productsResult.data || [];
                let allCategories = categoriesResult.data || [];

                if(searchWord){
                    setProducts(allProducts);
                }
                else if(categoryId){
                    const selectedIds = [parseInt(categoryId)];

                    allCategories.forEach(category => {
                        if(category.parentId == categoryId) {
                            selectedIds.push(category.categoryId);
                        }
                    });

                    const filtered = allProducts.filter(p => selectedIds.includes(p.categoryId));
                    setProducts(filtered);
                }
                else{
                    setProducts(allProducts);
                }
            }
            catch(error) 
            {
                console.error("Hiba: ", error);
                setProducts([]);
            }

        }

        fetchProducts();
    }, [categoryId, searchWord]);

    let title = "Kiemelt termékeink";
    if(searchWord){
        title = `Találatok err: ${searchWord}`;
    }

    if(categoryId){
        title = "Kategória termékei";
    }
    return (
        <div id="productListContainer">
            <h2 id="productGridTitle">{title}</h2>
            {products.length === 0 ? (
                <p>Nincs találat</p>
            ) : (
                <div id="productGrid">
                    {products.map(product => (
                        <ProductCard key={product.prodId} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}