import React from "react";

function Rating({ value, count }) {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (value >= i) {
      // full star
      stars.push(<span key={i}>★</span>);
    } else if (value >= i - 0.5) {
      // half star
      stars.push(<span key={i}>☆</span>);
    } else {
      // empty star
      stars.push(<span key={i}>☆</span>);
    }
  }

  return (
    <div className="rating" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
      {stars}
      {count !== undefined && (
        <span className="rating-count" style={{ marginLeft: "8px" }}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

export default Rating;
