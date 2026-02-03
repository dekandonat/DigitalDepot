import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ReviewModal from './ReviewModal';
import { apiFetch } from '../assets/util/fetch';
import './ProductList.css';

function ProductCard({ product, onOpenReviews }) {
    const [loginMessage, setLoginMessage] = useState("");
    const [avgRating, setAvgRating] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    const formatPrice = (price) => {
        return parseInt(price).toLocaleString('hu-HU').replaceAll(',', ' ');
    };

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await apiFetch(`/reviews/${product.prodId}`);
                if (data.result === 'success' && data.data.length > 0) {
                    const total = data.data.reduce((acc, curr) => acc + curr.rating, 0);
                    setAvgRating(total / data.data.length);
                    setReviewCount(data.data.length);
                } else {
                    setAvgRating(0);
                    setReviewCount(0);
                }
            } catch (err) {
                console.error(err);
            }
        };
        fetchReviews();
    }, [product.prodId]);

    const addToCart = async () => {
        const userToken = localStorage.getItem('token');

        if(!userToken){
            setLoginMessage("Jelentkezzen be!");
            setTimeout(() => {
                setLoginMessage("");
            }, 3000);
            return;
        }

        try{
            await apiFetch(`/cart/add/${product.prodId}/1`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });
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
                
                <div className="ratingDisplay" onClick={() => onOpenReviews(product)}>
                    <div className="starsContainer">
                        <span className="starFilled">{'★'.repeat(Math.round(avgRating))}</span>
                        <span className="starEmpty">{'★'.repeat(5 - Math.round(avgRating))}</span>
                    </div>
                    <div className="ratingInfoRow">
                        <span className="ratingText">
                            ({avgRating.toFixed(1)}) - {reviewCount} értékelés
                        </span>
                    </div>
                </div>

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
    const [selectedProductForReview, setSelectedProductForReview] = useState(null);
    const navigate = useNavigate();

    const { categoryId } = useParams();
    const [queryParams] = useSearchParams();
    const searchText = queryParams.get('q');

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await apiFetch('/category');
                if(data.data) setAllCategories(data.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try{
                let fetchUrl = '/products';

                if(searchText){
                    fetchUrl = `/products/search/${searchText}`;
                }

                const productsResult = await apiFetch(fetchUrl);
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
                        <ProductCard 
                            key={product.prodId} 
                            product={product} 
                            onOpenReviews={setSelectedProductForReview}
                        />
                    ))}
                </div>
            )}

            {selectedProductForReview && (
                <ReviewModal 
                    product={selectedProductForReview} 
                    onClose={() => setSelectedProductForReview(null)} 
                />
            )}
        </div>
    );
}