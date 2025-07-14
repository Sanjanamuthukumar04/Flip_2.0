import React, { useState } from 'react';

function ReviewItem({ review, onDelete }) {
  const [likes, setLikes] = useState(review.likes || 0);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setLikes(isLiked ? likes - 1 : likes + 1);
    setIsLiked(!isLiked);
  };

  return (
    <div className="review-item">
      <div className="review-header">
        <strong>{review.user}</strong>
        <span>{review.date}</span>
      </div>
      <p>{review.text}</p>
      <div className="review-actions">
        <button onClick={handleLike} className="like-button">
          {isLiked ? '❤️' : '🤍'} {likes}
        </button>
        {review.user === 'You' && (
          <button onClick={onDelete} className="delete-button">Delete</button>
        )}
      </div>
    </div>
  );
}

export default ReviewItem;