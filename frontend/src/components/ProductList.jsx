import React from 'react';
import { useState, useEffect } from 'react';
import './ProductList.css';

function ProductCard({ product }) {
    return (
        <div className="productCard">
            <img src={product.productImg} alt={product.productName} />
            <h3>{product.productName}</h3>
            <p>{product.productDescription}</p>
            <span className="productPrice">{product.productPrice} Ft</span>
            <input type="button" value="Kosárba" id="intoCartButton"></input>
        </div>
    );
}

export default function ProductList({ selectedCategoryId }) {
    const [products, setProducts] = useState([]);

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
            try {
                const productsResult = await getMethodFetch('http://localhost:3000/products');
                const categoriesResult = await getMethodFetch('http://localhost:3000/category');

                let allProducts = [];
                if (productsResult.data) {
                    allProducts = productsResult.data;
                }

                let allCategories = [];
                if (categoriesResult.data) {
                    allCategories = categoriesResult.data;
                }

                if (!selectedCategoryId) {
                    setProducts(allProducts);
                } else {
                    const relevantCategoryIds = [];
                    relevantCategoryIds.push(selectedCategoryId);

                    for (let i = 0; i < allCategories.length; i++) {
                        if (allCategories[i].parentId === selectedCategoryId) {
                            relevantCategoryIds.push(allCategories[i].categoryId);
                        }
                    }

                    const filteredProducts = [];
                    for (let i = 0; i < allProducts.length; i++) {
                        let isMatch = false;
                        for (let j = 0; j < relevantCategoryIds.length; j++) {
                            if (allProducts[i].categoryId === relevantCategoryIds[j]) {
                                isMatch = true;
                                break;
                            }
                        }
                        
                        if (isMatch) {
                            filteredProducts.push(allProducts[i]);
                        }
                    }

                    setProducts(filteredProducts);
                }

            } catch (error) {
                console.error("Hiba történt: ", error);
                setProducts([]);
            }
        }

        fetchProducts();
    }, [selectedCategoryId]);

    return (
        <div className="productListContainer">
            <h2 id="productGridTitle">
                {selectedCategoryId ? "Kategória termékei" : "Kiemelt termékeink"}
            </h2>
            {products.length === 0 ? (
                <p>Jelenleg nincsenek termékek ebben a kategóriában.</p>
            ) : (
                <div className="productGrid">
                    {products.map(product => (
                        <ProductCard key={product.prodId} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}