import React from 'react';

// Simple reusable button component
function Button({ children, onClick, type = 'button' }) {
  return (
    <button 
      type={type}
      className="button"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;