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
  const [userProfiles, setUserProfiles] = useState({});

  const whimsicalFont = `"Gloria Hallelujah", cursive`;

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user);
    })();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchBookDetails();
      loadReviews();
    }
  }, [id, currentUser]);

  const fetchBookDetails = async () => {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`);
    const data = await res.json();
    setBook(data);
  };

  const fetchUserProfiles = async (reviewEmails) => {
    const { data, error } = await supabase
      .from('users')
      .select('email, username')
      .in('email', reviewEmails);

    if (!error && data) {
      const profiles = {};
      data.forEach(user => {
        profiles[user.email] = user.username;
      });
      setUserProfiles(profiles);
    }
  };

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('book_id', id);

    if (error) {
      console.error(error);
      return;
    }

    const reviewEmails = [...new Set(data.map(r => r.user_email))];
    await fetchUserProfiles(reviewEmails);

    const sorted = [...data].sort((a, b) => {
      if (a.user_email === currentUser.email) return -1;
      if (b.user_email === currentUser.email) return 1;
      return new Date(b.created_at) - new Date(a.created_at);
    });

    setReviews(sorted);
  };

  const handleAddReview = async (newReview) => {
    if (!currentUser) return alert('Login to leave a review.');

    const existing = reviews.find(r => r.user_email === currentUser.email);
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
      .eq('id', reviewId)
      .eq('user_email', currentUser.email);

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
    <div
      style={{
        padding: '40px',
        maxWidth: '900px',
        margin: '0 auto',
        fontFamily: whimsicalFont,
      }}
    >
      <h1
        style={{
          fontSize: '2.5rem',
          marginBottom: '10px',
          textAlign: 'center',
        }}
      >
        {info.title}
      </h1>
      <p
        style={{
          color: '#666',
          marginBottom: '30px',
          textAlign: 'center',
        }}
      >
        {info.authors?.join(', ')}
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '30px',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <img
          src={info.imageLinks?.thumbnail}
          alt={info.title}
          style={{
            maxWidth: '220px',
            width: '100%',
            height: 'auto',
            borderRadius: '6px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          }}
        />

        <div style={{ maxWidth: '600px', textAlign: 'center' }}>
          <Rating value={averageRating} count={reviews.length} />
          <div
            style={{
              marginTop: '20px',
              lineHeight: '1.6',
              color: '#444',
              textAlign: 'left',
            }}
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
          username: userProfiles[r.user_email] || r.user_email.split('@')[0],
          canDelete: currentUser && r.user_email === currentUser.email,
          rating: r.rating || 0,
        }))}
        onDelete={handleDeleteReview}
      />
    </div>
  );
}
