import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import ReviewModal from './ReviewModal';
import { apiFetch } from '../assets/util/fetch';
import './ProductList.css';

function ProductCard({ product, onOpenReviews, showToast }) {
  const navigate = useNavigate();

  const avgRating = parseFloat(product.avgRating) || 0;
  const reviewCount = product.reviewCount || 0;

  const formatPrice = (price) => {
    return parseInt(price).toLocaleString('hu-HU').replaceAll(',', ' ');
  };

  const addToCart = async (e) => {
    e.stopPropagation();
    const userToken = localStorage.getItem('token');

    if (!userToken) {
      showToast('Jelentkezzen be a vásárláshoz!', 'error');
      return;
    }

    if (product.quantity <= 0) {
      showToast('Sajnáljuk, a termék jelenleg nincs készleten!', 'error');
      return;
    }

    try {
      const response = await apiFetch(`/cart/add/${product.prodId}/1`, {
        method: 'POST',
      });
      showToast('Sikeresen a kosárba helyezve!', 'success');
    } catch (error) {
      showToast(error.message || 'Hiba történt a művelet során!', 'error');
    }
  };

  const navigateToProduct = () => {
    navigate(`/product/${product.prodId}`);
  };

  const getImageUrl = (imgPath) => {
    if (!imgPath) return '';
    if (imgPath.startsWith('http')) return imgPath;
    if (!imgPath.includes('uploads/')) {
      return `/uploads/products/${imgPath}`;
    }
    return imgPath.startsWith('/') ? imgPath : `/${imgPath}`;
  };

  return (
    <div
      className={`productCard ${product.quantity <= 0 ? 'outOfStock' : ''}`}
      onClick={navigateToProduct}
    >
      <div className="imageContainer">
        <img src={getImageUrl(product.productImg)} alt={product.productName} />
        {product.conditionState ? (
          <span className={`conditionBadge ${product.conditionState}`}>
            {product.conditionState}
          </span>
        ) : null}
      </div>
      <div className="cardContent">
        <h3 title={product.productName}>{product.productName}</h3>
        <div
          className="ratingDisplay"
          onClick={(e) => {
            e.stopPropagation();
            onOpenReviews(product);
          }}
        >
          <div className="starsContainer">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={
                  star <= Math.round(avgRating) ? 'starFilled' : 'starEmpty'
                }
              >
                ★
              </span>
            ))}
          </div>
          <span className="ratingText">({reviewCount})</span>
        </div>
        <p className="productDescription">{product.productDescription}</p>
        <div className="cardFooter">
          <span className="productPrice">
            {formatPrice(product.productPrice)} Ft
          </span>
          <button
            id="intoCartButton"
            onClick={addToCart}
            disabled={product.quantity <= 0}
          >
            {product.quantity <= 0 ? 'Elfogyott' : 'Kosárba'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductList() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProductForReview, setSelectedProductForReview] =
    useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: '',
    key: 0,
  });

  const sortType = searchParams.get('sort') || 'default';
  const searchQuery = searchParams.get('q');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let url = '/products';
        if (categoryId) {
          url = `/products/category/${categoryId}`;
        } else if (searchQuery) {
          url = `/products/search/${searchQuery}`;
        }

        const data = await apiFetch(url);
        setProducts(data.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [categoryId, searchQuery]);

  useEffect(() => {
    let sorted = [...products];
    if (sortType === 'price_asc')
      sorted.sort((a, b) => a.productPrice - b.productPrice);
    else if (sortType === 'price_desc')
      sorted.sort((a, b) => b.productPrice - a.productPrice);
    else if (sortType === 'sold_desc')
      sorted.sort((a, b) => b.soldQuantity - a.soldQuantity);
    else if (sortType === 'sold_asc')
      sorted.sort((a, b) => a.soldQuantity - b.soldQuantity);
    else if (sortType === 'rating_desc')
      sorted.sort((a, b) => b.avgRating - a.avgRating);
    else if (sortType === 'rating_asc')
      sorted.sort((a, b) => a.avgRating - b.avgRating);

    setDisplayedProducts(sorted);
  }, [products, sortType]);

  const showToast = (message, type) => {
    setToast({ show: true, message, type, key: Date.now() });
    setTimeout(() => {
      setToast((prev) => {
        if (prev.key <= Date.now() - 3000) {
          return { ...prev, show: false };
        }
        return prev;
      });
    }, 3000);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    const currentParams = new URLSearchParams(searchParams);
    if (newSort === 'default') currentParams.delete('sort');
    else currentParams.set('sort', newSort);
    navigate({ search: currentParams.toString() });
  };

  if (isLoading)
    return (
      <div className="loadingContainer">
        <p>Termékek betöltése...</p>
      </div>
    );

  return (
    <div id="productListContainer">
      {toast.show && (
        <div key={toast.key} className={`toastMessage toast-${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div id="productListHeader">
        <div id="filterAndTitleArea">
          {categoryId && (
            <div id="activeFilterContainer">
              Kategória:{' '}
              <span id="activeFilterName">
                {displayedProducts.length > 0
                  ? displayedProducts[0]?.categoryName
                  : 'Nincs találat'}
              </span>
              <button id="clearFilterButton" onClick={() => navigate('/')}>
                ×
              </button>
            </div>
          )}
          {searchQuery && !categoryId && (
            <div id="activeFilterContainer">
              Keresés: <span id="activeFilterName">{searchQuery}</span>
              <button id="clearFilterButton" onClick={() => navigate('/')}>
                ×
              </button>
            </div>
          )}
        </div>

        <div className="desktopSortContainer">
          <select
            value={sortType}
            onChange={handleSortChange}
            className="desktopSortSelect"
          >
            <option value="default">Rendezés: Alapértelmezett</option>
            <option value="sold_desc">Eladások szerint csökkenő</option>
            <option value="sold_asc">Eladások szerint növekvő</option>
            <option value="price_asc">Ár szerint növekvő</option>
            <option value="price_desc">Ár szerint csökkenő</option>
            <option value="rating_desc">Értékelés szerint csökkenő</option>
            <option value="rating_asc">Értékelés szerint növekvő</option>
          </select>
        </div>
      </div>

      {displayedProducts.length === 0 ? (
        <p>Nincs találat.</p>
      ) : (
        <div id="productGrid">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.prodId}
              product={product}
              onOpenReviews={setSelectedProductForReview}
              showToast={showToast}
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
