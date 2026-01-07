import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import './ProductList.css';

function ProductCard({ product }) {
    const [loginMessage, setLoginMessage] = useState("");

    const sendCartRequest = (requestUrl, userToken) => {
        return fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userToken}`
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
        const userToken = localStorage.getItem('token');

        if(!userToken){
            setLoginMessage("Jelentkezzen be!");

            setTimeout(() => {
                setLoginMessage("");
            }, 3000);

            return;
        }

        const requestUrl = `/cart/add/${product.prodId}/1`;

        try{
            await sendCartRequest(requestUrl, userToken);
        } catch(error){
            console.error("Hiba: ", error);
            setLoginMessage("A kosár használatához jelentkezzen be!");
            setTimeout(() => setLoginMessage(""), 3000);
        }
    };

    return (
        <div className="productCard">
            <img src={product.productImg} alt={product.productName} />
            <h3>{product.productName}</h3>
            <p>{product.productDescription}</p>
            <span className="productPrice">{product.productPrice} Ft</span>
            <input type="button" value="Kosárba" id="intoCartButton" onClick={addToCart}></input>
            {loginMessage && (
                <p className="loginErrorMessage">
                    {loginMessage}
                </p>
            )}
        </div>
    );
}

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [currentCategoryName, setCurrentCategoryName] = useState("");
    const navigate = useNavigate();

    const { categoryId } = useParams();
    
    const [queryParams] = useSearchParams();
    const searchText = queryParams.get('q');

    useEffect(() => {
        const getRequest = (fetchUrl) => {
            return fetch(fetchUrl)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`GET hiba: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .catch((error) => {
                    throw new Error(`Hiba történt: ${error.message}`);
                });
        }

        const fetchProductsAndCategories = async () => {
            try{
                let fetchUrl = '/products';

                if(searchText){
                    fetchUrl = `/products/search/${searchText}`;
                }

                const productsResult = await getRequest(fetchUrl);
                const categoriesResult = await getRequest('/category');

                let allProducts = productsResult.data || [];
                let allCategories = categoriesResult.data || [];

                if(searchText){
                    setProducts(allProducts);
                    setCurrentCategoryName(`Keresés: "${searchText}"`);
                }
                else if(categoryId){
                    const currentId = parseInt(categoryId);
                    const selectedCategoryIds = [currentId];

                    const currentCategory = allCategories.find(category => category.categoryId === currentId);
                    if (currentCategory) {
                        setCurrentCategoryName(currentCategory.categoryName);
                    } else {
                        setCurrentCategoryName("Kategória");
                    }

                    allCategories.forEach(category => {
                        if(category.parentId === currentId) {
                            selectedCategoryIds.push(category.categoryId);
                        }
                    });

                    const filteredProducts = allProducts.filter(product => selectedCategoryIds.includes(product.categoryId));
                    setProducts(filteredProducts);
                }
                else{
                    setProducts(allProducts);
                    setCurrentCategoryName("");
                }
            }
            catch(error) 
            {
                console.error("Hiba: ", error);
                setProducts([]);
            }

        }

        fetchProductsAndCategories();
    }, [categoryId, searchText]);

    const clearFilter = () => {
        navigate('/');
    }

    return (
        <div id="productListContainer">
            {(categoryId || searchText) && (
                <div id="activeFilterContainer">
                    <span id="activeFilterName">{currentCategoryName}</span>
                    <button id="clearFilterButton" onClick={clearFilter} title="Szűrés törlése">
                        &times;
                    </button>
                </div>
            )}
            
            {products.length === 0 ? (
                <p>Nincs találat ebben a kategóriában.</p>
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