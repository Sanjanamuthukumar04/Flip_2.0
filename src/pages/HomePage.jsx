import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { searchBooks } from '../utils/api';

export default function HomePage() {
  const [topBooks, setTopBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [noResults, setNoResults] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTopBooks();
  }, []);

  const fetchTopBooks = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('book_id, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return;
    }

    const counts = {};
    data.forEach((review) => {
      if (!counts[review.book_id]) {
        counts[review.book_id] = { count: 1, latest: review.created_at };
      } else {
        counts[review.book_id].count += 1;
      }
    });

    const sortedBooks = Object.entries(counts)
      .map(([book_id, { count, latest }]) => ({ book_id, count, latest }))
      .sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return new Date(b.latest) - new Date(a.latest);
      })
      .slice(0, 3);

    const bookDetails = await Promise.all(
      sortedBooks.map(async (book) => {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${book.book_id}`);
        const json = await res.json();
        return json;
      })
    );

    setTopBooks(bookDetails);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const results = await searchBooks(searchQuery);
    if (results.length === 0) {
      setNoResults(true);
      setSearchResults([]);
    } else {
      setNoResults(false);
      setSearchResults(results);
    }
    setShowSearchResults(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSearchResults(false);
    setNoResults(false);
    setSearchResults([]);
  };

  const renderBookCard = (book) => {
    if (!book?.id || !book?.volumeInfo) return null;

    return (
      <div
        key={book.id}
        onClick={() => navigate(`/book/${book.id}`)}
        style={styles.bookCard}
      >
        <img
          src={book.volumeInfo.imageLinks?.thumbnail}
          alt={book.volumeInfo.title}
          style={{ width: '100%' }}
        />
        <p>{book.volumeInfo.title}</p>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Welcome to Flip!</h1>

        <div style={styles.headerControls}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search books..."
            style={styles.input}
          />

          <button onClick={handleSearch} style={styles.iconButton}>
            <img src="/pics/search.png" alt="Search" style={{ width: '45px', height: '45px' }} />
          </button>

          <button onClick={() => navigate('/account')} style={styles.iconButtonAccount}>
            <img src="/pics/my account.jpg" alt="My Account" style={{ width: '55px', height: '40px' }} />
          </button>
        </div>
      </div>

      {showSearchResults && (
        <div style={styles.buttonsGroup}>
          <button
            onClick={handleClearSearch}
            style={{ ...styles.button, backgroundColor: '#6c757d' }}
          >
            Clear
          </button>
        </div>
      )}

      {!showSearchResults && (
        <>
          <h2 style={styles.sectionTitle}>Top Reviewed Books</h2>
          <div style={styles.booksGrid}>{topBooks.map(renderBookCard)}</div>
          <button
            onClick={() => navigate('/recommendations')}
            style={{ ...styles.button, backgroundColor: '#007bff', marginTop: '30px' }}
          >
            <span style={{ fontSize: '1.2rem' }}>
              Get personalized book recommendations
              <br /> with <span style={{ fontWeight: 'bold' }}>Flipper</span>, our AI pal!
            </span>
          </button>
        </>
      )}

      {showSearchResults && (
        <>
          <h2 style={styles.sectionTitle}>Search Results</h2>
          {noResults ? (
            <p>No books found for “{searchQuery}”.</p>
          ) : (
            <div style={styles.booksGrid}>{searchResults.map(renderBookCard)}</div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  headerControls: {
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '5px',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '10px',
  },
  input: {
    padding: '8px',
    fontSize: '1rem',
    width: '200px',
    maxWidth: '60%',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  iconButton: {
    backgroundColor: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: '-5px',
  },
  iconButtonAccount: {
    backgroundColor: 'white',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    marginLeft: '4px',
    padding: '4px',
  },
  buttonsGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    margin: '20px 0',
    flexWrap: 'wrap',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#007bff',
    color: '#fff',
    cursor: 'pointer',
  },
  sectionTitle: {
    marginTop: '30px',
    fontSize: '2rem',
  },
  booksGrid: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '20px',
  },
  bookCard: {
    cursor: 'pointer',
    border: '1px solid #ccc',
    padding: '10px',
    width: '150px',
    textAlign: 'center',
  },
};
