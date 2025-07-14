import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import BookDetails from './pages/BookDetails';
import MyAccount from './pages/MyAccount';
import AIRecommender from './pages/AIRecommender';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/account" element={<MyAccount />} />
        <Route path="/recommendations" element={<AIRecommender />} />
      </Routes>
    </Router>
  );
}

export default App;
