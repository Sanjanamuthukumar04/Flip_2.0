import React from "react";

function Navbar({ onLogout }) {
  return (
    <nav className="navbar">
      <h1>BookCritic</h1>
      <button onClick={onLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;