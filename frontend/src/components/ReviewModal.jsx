import React, { useState, useEffect } from 'react';
import './ReviewModal.css';

export default function ReviewModal({ product, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetch(`/reviews/${product.prodId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.result === 'success') {
          setReviews(data.data);
        }
      })
      .catch((err) => console.error(err));
  }, [product.prodId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (!token) {
      setErrorMessage('Értékeléshez jelentkezz be!');
      return;
    }

    try {
      const response = await fetch('/reviews/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.prodId,
          rating: rating,
          comment: comment,
        }),
      });

      const result = await response.json();

      if (response.ok && result.result === 'success') {
        setComment('');
        const newReviewRes = await fetch(`/reviews/${product.prodId}`);
        const newData = await newReviewRes.json();
        setReviews(newData.data);
        setErrorMessage('');
      } else {
        setErrorMessage('Hiba történt a mentéskor.');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage('Szerver hiba.');
    }
  };

  return (
    <div className="reviewModalOverlay" onClick={onClose}>
      <div className="reviewModalContent" onClick={(e) => e.stopPropagation()}>
        <button className="closeModalBtn" onClick={onClose}>
          &times;
        </button>
        <h2>Vélemények: {product.productName}</h2>

        <div className="addReviewSection">
          <h3>Írj véleményt!</h3>
          <div className="starInput">
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
          <button onClick={handleSubmit} className="submitReviewBtn">
            Küldés
          </button>
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
