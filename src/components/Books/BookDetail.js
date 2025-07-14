import React, { useState } from 'react';
import Rating from '../UI/Rating';
import ReviewList from '../Reviews/ReviewList';
import ReviewForm from '../Reviews/ReviewForm';

function BookDetail({ book, onBack }) {
  const [reviews, setReviews] = useState(book.reviews || []);

  const handleAddReview = (newReview) => {
    if (reviews.some((r) => r.user === 'You')) {
      alert('You can only submit one review!');
      return;
    }
    setReviews([{ ...newReview, user: 'You' }, ...reviews]);
  };

  const handleDeleteReview = () => {
    setReviews(reviews.filter((r) => r.user !== 'You'));
  };

  // clean the description by stripping HTML tags & trimming whitespace
  const cleanDescription =
    book.description && typeof book.description === 'string'
      ? book.description.replace(/<[^>]*>/g, '').trim()
      : 'No description available.';

  return (
    <div className="book-detail">
      <button onClick={onBack} className="back-button">
        ← Back
      </button>

      <div className="book-header">
        <img src={book.image} alt={book.title} />
        <div>
          <h1>{book.title}</h1>
          <p>{book.author}</p>
          <Rating value={book.rating} count={book.reviewCount} />
        </div>
      </div>

      <p className="book-description">{cleanDescription}</p>

      <ReviewForm onSubmit={handleAddReview} />
      <ReviewList reviews={reviews} onDelete={handleDeleteReview} />
    </div>
  );
}

export default BookDetail;
