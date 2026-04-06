import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../assets/util/fetch';
import ReviewModal from './ReviewModal';
import './productPage.css';

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loginMessage, setLoginMessage] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchProductData = async () => {
    try {
      const productResponse = await apiFetch(`/products/${productId}`);
      if (productResponse.result === 'success') {
        setProduct(productResponse.data);

        const reviewsResponse = await apiFetch(`/reviews/${productId}`);
        if (reviewsResponse.result === 'success') {
          setReviews(reviewsResponse.data);
          if (reviewsResponse.data.length > 0) {
            const totalRating = reviewsResponse.data.reduce(
              (accumulator, currentReview) =>
                accumulator + currentReview.rating,
              0
            );
            setAverageRating(totalRating / reviewsResponse.data.length);
            setReviewCount(reviewsResponse.data.length);
          } else {
            setAverageRating(0);
            setReviewCount(0);
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, refreshTrigger]);

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const addToCart = async () => {
    const userToken = localStorage.getItem('token');
    if (!userToken) {
      setLoginMessage('A vásárláshoz jelentkezzen be!');
      setTimeout(() => setLoginMessage(''), 3000);
      return;
    }

    try {
      await apiFetch(`/cart/add/${product.prodId}/1`, {
        method: 'POST',
      });
      setLoginMessage('Termék a kosárba került! ✅');
      setTimeout(() => setLoginMessage(''), 3000);
    } catch (error) {
      setLoginMessage('Hiba történt a kosárba helyezéskor.');
      setTimeout(() => setLoginMessage(''), 3000);
    }
  };

  const formatPrice = (price) => {
    return parseInt(price).toLocaleString('hu-HU').replaceAll(',', ' ');
  };

  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
  };

  if (isLoading)
    return (
      <div className="loadingContainer">
        <div className="loader"></div>
      </div>
    );
  if (!product)
    return <div className="errorContainer">A termék nem található.</div>;

  return (
    <div className="pageWrapper">
      <div className="productPageContainer">
        <button className="backButton" onClick={() => navigate(-1)}>
          &larr; Vissza
        </button>

        <div className="productMainLayout">
          <div className="leftColumn">
            <div className="imageWrapper">
              <img
                src={getImageUrl(product.productImg)}
                alt={product.productName}
                className="mainProductImage"
              />
              {product.conditionState && (
                <span
                  className={`conditionBadgeLarge ${product.conditionState}`}
                >
                  {product.conditionState}
                </span>
              )}
            </div>
          </div>

          <div className="rightColumn">
            <h1 className="productTitleMain">{product.productName}</h1>

            <div
              className="ratingBlock"
              onClick={() => setShowReviewModal(true)}
            >
              <div className="stars">
                <span className="starFilled">
                  {'★'.repeat(Math.round(averageRating))}
                </span>
                <span className="starEmpty">
                  {'★'.repeat(5 - Math.round(averageRating))}
                </span>
              </div>
              <span className="ratingLink">{reviewCount} értékelés</span>
            </div>

            <div className="priceBlock">
              <span className="currentPrice">
                {formatPrice(product.productPrice)} Ft
              </span>
              <span className="vatInfo">Bruttó ár, 27% ÁFA-t tartalmaz</span>
              <p className="salesInfo">
                Eladott: <strong>{product.soldQuantity || 0} db</strong>
              </p>
            </div>

            <div className="availabilityBlock">
              <div
                className={`availabilityItem ${product.quantity > 5 ? 'inStock' : product.quantity > 0 ? 'lowStock' : 'outOfStock'}`}
              >
                {product.quantity > 5 ? (
                  <>
                    <span className="checkIcon">✔</span>
                    <span className="availabilityText">Raktáron</span>
                  </>
                ) : product.quantity > 0 ? (
                  <>
                    <span className="checkIcon">●</span>
                    <span className="availabilityText">
                      Alacsony készlet: {product.quantity} maradt
                    </span>
                  </>
                ) : (
                  <>
                    <span className="checkIcon">✗</span>
                    <span className="availabilityText">Elfogyott</span>
                  </>
                )}
              </div>
              <div
                className={`availabilityItem ${product.quantity > 0 ? 'inStock' : 'outOfStock'}`}
              >
                {product.quantity > 0 ? (
                  <>
                    <span className="checkIcon">✔</span>
                    <span className="availabilityText">
                      Azonnal szállítható
                    </span>
                  </>
                ) : (
                  <>
                    <span className="checkIcon">✗</span>
                    <span className="availabilityText">
                      Kérem várja meg, míg feltöltjük készletünket
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="actionBlock">
              <button
                className="addToCartBtnBig"
                onClick={product.quantity > 0 ? addToCart : null}
              >
                Kosárba
              </button>
            </div>

            {loginMessage && (
              <div
                className={`messageToast ${loginMessage.includes('✅') ? 'success' : 'error'}`}
              >
                {loginMessage}
              </div>
            )}

            <div className="descriptionContainer">
              <h3>Termékleírás</h3>
              <p>{product.productDescription}</p>
            </div>
          </div>
        </div>

        <div className="additionalInfoSection">
          <div className="infoBox">
            <h3>Szállítási információk</h3>
            <ul>
              <li>Ingyenes kiszállítás 50.000 Ft felett</li>
              <li>Várható kézbesítés: 1-2 munkanap</li>
              <li>Személyes átvétel üzletünkben: Ingyenes</li>
              <li>GLS Csomagpont: 1.290 Ft</li>
              <li>Házhozszállítás futárral: 1.990 Ft</li>
            </ul>
          </div>
          <div className="infoBox">
            <h3>Garancia és visszaküldés</h3>
            <ul>
              <li>
                Erre a termékre 24 hónap hivatalos gyártói garanciát vállalunk.
              </li>
              <li>14 napos visszaküldési jog (bontatlan csomagolás esetén).</li>
              <li>Gyors és rugalmas garanciális ügyintézés.</li>
              <li>Használt termékekre 6 hónap szavatosság.</li>
            </ul>
          </div>
        </div>

        <div className="reviewsSection">
          <h2 className="reviewsTitle">Vélemények</h2>
          {reviews.length === 0 ? (
            <p className="noReviews">
              Ehhez a termékhez még nem érkezett vélemény.
            </p>
          ) : (
            <div className="reviewsList">
              {reviews.map((review, index) => (
                <div key={index} className="reviewCard">
                  <div className="reviewHeader">
                    <div className="reviewUser">
                      <div className="userAvatarPlaceholder">
                        {review.userName
                          ? review.userName.charAt(0).toUpperCase()
                          : 'U'}
                      </div>
                      <span className="userName">
                        {review.userName || 'Névtelen felhasználó'}
                      </span>
                    </div>
                    <div className="reviewStars">
                      <span className="starFilled">
                        {'★'.repeat(review.rating)}
                      </span>
                      <span className="starEmpty">
                        {'★'.repeat(5 - review.rating)}
                      </span>
                    </div>
                  </div>
                  <div className="reviewContent">
                    <p>
                      {review.review ||
                        review.comment ||
                        'Nincs szöveges értékelés.'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showReviewModal && (
          <ReviewModal
            product={product}
            onClose={() => setShowReviewModal(false)}
            refreshParentData={triggerRefresh}
          />
        )}
      </div>
    </div>
  );
}