import React from "react";

export default function ReviewList({ reviews, onDelete }) {
  if (!reviews || reviews.length === 0) {
    return <p>No reviews yet. Be the first to leave one!</p>;
  }

  return (
    <div>
      {reviews.map((review) => (
        <div
          key={review.review_id}
          style={{
            border: "1px solid #ccc",
            padding: "10px",
            marginBottom: "10px",
            borderRadius: "5px",
          }}
        >
          <p>
            <strong>
              {review.username}{" "}
              {review.canDelete && (
                <span style={{ color: "#888" }}>(you)</span>
              )}
            </strong>{" "}
            rated {review.rating}⭐
          </p>

          <p style={{ whiteSpace: "pre-wrap" }}>{review.content}</p>

          {review.canDelete && (
            <button
              onClick={() => onDelete(review.review_id)}
              style={{
                backgroundColor: "red",
                color: "white",
                border: "none",
                padding: "5px 10px",
                borderRadius: "3px",
              }}
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
