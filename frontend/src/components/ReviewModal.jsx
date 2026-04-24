import React, { useState, useEffect } from 'react';
import { apiFetch } from '../assets/util/fetch';
import './ReviewModal.css';

export default function ReviewModal({ product, onClose, refreshParentData }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [existingReviewId, setExistingReviewId] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await apiFetch(`/reviews/${product.prodId}`);
        if (data.result === 'success') {
          setReviews(data.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchMyReview = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await apiFetch(`/reviews/my-review/${product.prodId}`);
          if (data.result === 'success' && data.data) {
            setRating(data.data.rating);
            setComment(data.data.comment || '');
            setExistingReviewId(data.data.reviewId);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchReviews();
    fetchMyReview();
  }, [product.prodId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setErrorMessage('Értékeléshez jelentkezz be!');
      return;
    } else {
      try {
        if (existingReviewId) {
          const result = await apiFetch(`/reviews/${existingReviewId}`, {
            method: 'PATCH',
            body: {
              rating: rating,
              comment: comment,
            },
          });
          if (result.result === 'success') {
            if (refreshParentData) refreshParentData();
            onClose();
          } else {
            setErrorMessage(result.message || 'Hiba történt');
          }
        } else {
          const result = await apiFetch('/reviews/', {
            method: 'POST',
            body: {
              productId: product.prodId,
              rating: rating,
              comment: comment,
            },
          });
          if (result.result === 'success') {
            if (refreshParentData) refreshParentData();
            onClose();
          } else {
            setErrorMessage(result.message || 'Hiba történt');
          }
        }
      } catch (err) {
        setErrorMessage('Hálózati hiba történt');
      }
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (token && existingReviewId) {
      try {
        const result = await apiFetch(`/reviews/${existingReviewId}`, {
          method: 'DELETE',
        });
        if (result.result === 'success') {
          if (refreshParentData) refreshParentData();
          onClose();
        } else {
          setErrorMessage(result.message || 'Hiba történt a törlés során');
        }
      } catch (err) {
        setErrorMessage('Hálózati hiba történt');
      }
    }
  };

  return (
    <div className="reviewModalOverlay" onClick={onClose}>
      <div className="reviewModalContent" onClick={(e) => e.stopPropagation()}>
        <button className="closeModalBtn" onClick={onClose}>
          &times;
        </button>
        <h2>Értékelések - {product.productName}</h2>

        <div className="addReviewSection">
          <h3>
            {existingReviewId ? 'Értékelés módosítása' : 'Írd meg a véleményed'}
          </h3>
          <div className="ratingSelector">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            maxLength="300"
            placeholder="Írd le a véleményed (max 300 karakter)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="reviewActionButtons">
            <button onClick={handleSubmit} className="submitReviewBtn">
              {existingReviewId ? 'Módosítás' : 'Küldés'}
            </button>
            {existingReviewId && (
              <button onClick={handleDelete} className="deleteReviewBtn">
                Törlés
              </button>
            )}
          </div>
          {errorMessage && <p className="errorMsg">{errorMessage}</p>}
        </div>

        <div className="reviewsList">
          {reviews.length === 0 ? <p>Még nem érkezett vélemény.</p> : null}
          {reviews.map((review) => (
            <div key={review.reviewId} className="reviewItem">
              <div className="reviewHeader">
                <span className="reviewUser">{review.userName}</span>
                <span className="reviewStars">{'★'.repeat(review.rating)}</span>
              </div>
              <p className="reviewText">{review.comment}</p>
              <small className="reviewDate">
                {new Date(review.reviewDate).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
