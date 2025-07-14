import React from "react";
import Rating from "../UI/Rating";


function BookCard({ book, onClick }) {
  return (
    <div className="book-card" onClick={onClick}>
      <img src={book.image} alt={book.title} />
      <div className="book-info">
        <h3>{book.title}</h3>
        <p>{book.author}</p>
        <Rating value={book.rating} count={book.reviewCount} />
      </div>
    </div>
  );
}

export default BookCard;