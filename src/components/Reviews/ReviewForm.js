import React, { useState } from 'react';

export default function ReviewForm({ onSubmit }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit({ text, rating: parseFloat(rating) });
    setText('');
    setRating(5);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your review…"
        rows="3"
        style={{ width: '100%', marginBottom: '10px' }}
      ></textarea>
      <br />
      <select value={rating} onChange={(e) => setRating(e.target.value)}>
        {[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5].map(r => (
          <option key={r} value={r}>{r} Stars</option>
        ))}
      </select>
      <button type="submit" style={{ marginLeft: '10px' }}>Submit</button>
    </form>
  );
}
