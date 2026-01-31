import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import './ProductList.css';

function ProductCard({ product }) {
    const [loginMessage, setLoginMessage] = useState("");

    const formatPrice = (price) => {
        return parseInt(price).toLocaleString('hu-HU').replaceAll(',', ' ');
    };

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
            setLoginMessage("Hiba történt!");
            setTimeout(() => setLoginMessage(""), 3000);
        }
    };

    return (
        <div className="productCard">
            {product.conditionState && (
                <div className={`conditionBadge ${product.conditionState}`}>
                    {product.conditionState}
                </div>
            )}
            
            <div className="imageContainer">
                <img src={product.productImg} alt={product.productName} loading="lazy" />
            </div>

            <div className="cardContent">
                <h3>{product.productName}</h3>
                <p className="productDescription">{product.productDescription}</p>
                
                <div className="cardFooter">
                    <span className="productPrice">{formatPrice(product.productPrice)} Ft</span>
                    <button id="intoCartButton" onClick={addToCart}>
                        Kosárba
                    </button>
                </div>
            </div>

            {loginMessage && (
                <div className="loginErrorMessage">
                    {loginMessage}
                </div>
            )}
        </div>
    );
}

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [currentCategoryName, setCurrentCategoryName] = useState("");
    const navigate = useNavigate();

    const { categoryId } = useParams();
    
    const [queryParams] = useSearchParams();
    const searchText = queryParams.get('q');

    useEffect(() => {
        fetch('http://localhost:3000/category')
            .then(res => res.json())
            .then(data => {
                if(data.data) setAllCategories(data.data);
            })
            .catch(err => console.error(err));
    }, []);

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

        const fetchProducts = async () => {
            try{
                let fetchUrl = '/products';

                if(searchText){
                    fetchUrl = `/products/search/${searchText}`;
                }

                const productsResult = await getRequest(fetchUrl);
                let allProducts = productsResult.data || [];

                if(searchText){
                    setProducts(allProducts);
                    setCurrentCategoryName(`Keresés: "${searchText}"`);
                }
                else if(categoryId && allCategories.length > 0){
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

        fetchProducts();
    }, [categoryId, searchText, allCategories]);

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