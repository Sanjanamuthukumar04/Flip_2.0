import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Rating from '../components/UI/Rating';
import ReviewForm from '../components/Reviews/ReviewForm';
import ReviewList from '../components/Reviews/ReviewList';
import { supabase } from '../supabaseClient';

export default function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUsername, setCurrentUsername] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      setCurrentUser(data.user);

      // fetch the logged-in user's username
      const { data: userData, error } = await supabase
        .from('users')
        .select('username')
        .eq('id', data.user.id)
        .single();

      if (!error && userData) {
        setCurrentUsername(userData.username);
      }
    })();
  }, []);

  useEffect(() => {
    if (currentUser && currentUsername) {
      fetchBookDetails();
      loadReviews();
    }
  }, [id, currentUser, currentUsername]);

  const fetchBookDetails = async () => {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
    const data = await res.json();
    setBook(data);
  };

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('public_reviews_with_username')
      .select('*')
      .eq('book_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const sorted = [...data].sort((a, b) => {
      if (a.username === currentUsername) return -1;
      if (b.username === currentUsername) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    setReviews(sorted);
  };

  const handleAddReview = async (newReview) => {
    if (!currentUser) return alert('Login to leave a review.');

    const existing = reviews.find(
      r => r.username === currentUsername
    );
    if (existing) return alert('You can only leave one review.');

    const { error } = await supabase.from('reviews').insert([{
      book_id: id,
      user_email: currentUser.email,
      content: newReview.text,
      rating: newReview.rating,
    }]);

    if (error) {
      console.error('Supabase error inserting review:', error);
      alert(`Failed to submit review: ${error.message}`);
    } else {
      loadReviews();
    }
  };

const handleDeleteReview = async (reviewId) => {
  if (!currentUser) return;

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) {
    console.error(error);
    alert('Failed to delete review.');
  } else {
    loadReviews();
  }
};


  if (!book) return <p>Loading book details...</p>;

  const info = book.volumeInfo;

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', textAlign: 'center' }}>
        {info.title}
      </h1>
      <p style={{ color: '#666', marginBottom: '30px', textAlign: 'center' }}>
        {info.authors?.join(', ')}
      </p>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px',
        alignItems: 'center', textAlign: 'center'
      }}>
        <img
          src={info.imageLinks?.thumbnail}
          alt={info.title}
          style={{
            maxWidth: '220px', width: '100%', height: 'auto',
            borderRadius: '6px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          }}
        />

        <div style={{ maxWidth: '600px', textAlign: 'center' }}>
          <Rating value={averageRating} count={reviews.length} />
          <div
            style={{ marginTop: '20px', lineHeight: '1.6', color: '#444', textAlign: 'left' }}
            dangerouslySetInnerHTML={{
              __html: info.description || 'No description available.',
            }}
          />
        </div>
      </div>

      <h2 style={{ marginTop: '40px', color: '#333' }}>Leave a Review</h2>
      <div style={{ marginBottom: '40px' }}>
        <ReviewForm onSubmit={handleAddReview} />
      </div>

      <h2 style={{ marginBottom: '20px', color: '#333' }}>Reviews</h2>
      <ReviewList
        reviews={reviews.map(r => ({
          ...r,
          username: r.username === currentUsername ? `${r.username}` : r.username,
          canDelete: currentUsername && r.username.startsWith(currentUsername),
          rating: r.rating || 0
        }))}
        onDelete={handleDeleteReview}
      />
    </div>
  );
}
