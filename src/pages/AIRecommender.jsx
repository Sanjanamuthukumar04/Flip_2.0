import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { cosineSimilarity, tfidfVectorizer } from '../utils/textSimilarity';

export default function AIRecommender() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [favoriteBook, setFavoriteBook] = useState('');
  const [fallbackRec, setFallbackRec] = useState(null);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const fetchRecommendations = async () => {
    setLoading(true);

    const { data: user } = await supabase.auth.getUser();
    if (!user || !user.user) {
      setLoading(false);
      return;
    }

    const email = user.user.email;

    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('user_email', email)
      .order('rating', { ascending: false })
      .order('created_at', { ascending: false });

    if (!reviews || reviews.length < 2) {
      setShowFallback(true);
      setLoading(false);
      return;
    }

    const topBooks = reviews.slice(0, 2);

    const referenceBooks = await Promise.all(
      topBooks.map(async (r) => {
        const res = await fetch(
          `https://www.googleapis.com/books/v1/volumes/${r.book_id}`
        );
        const data = await res.json();
        return {
          id: r.book_id,
          title: data.volumeInfo?.title || '',
          desc: data.volumeInfo?.description || '',
          authors: data.volumeInfo?.authors || [],
          categories: data.volumeInfo?.categories || [],
        };
      })
    );

    const referenceIds = new Set(referenceBooks.map(b => b.id));

    const allAuthors = new Set();
    const allCategories = new Set();
    let referenceText = '';

    referenceBooks.forEach((book) => {
      book.authors.forEach((a) => allAuthors.add(a.toLowerCase()));
      book.categories.forEach((c) => allCategories.add(c.toLowerCase()));
      referenceText += ` ${book.title} ${book.desc}`;
    });

    const queryWord =
      [...allCategories][0] || [...allAuthors][0] || 'bestseller';

    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        queryWord
      )}&maxResults=30`
    );
    const json = await res.json();

    const candidates = [];
    const seenTitles = new Set();

    if (json.items) {
      for (const item of json.items) {
        const info = item.volumeInfo;
        const title = info?.title?.toLowerCase();
        if (!title || seenTitles.has(title)) continue;
        if (referenceIds.has(item.id)) continue;

        seenTitles.add(title);

        candidates.push({
          ...item,
          text: `${info.title} ${info.description || ''} ${(info.categories || []).join(' ')} ${(info.authors || []).join(' ')}`,
          authors: info.authors || [],
          categories: info.categories || [],
        });
      }
    }

    const vectors = tfidfVectorizer([
      referenceText,
      ...candidates.map((c) => c.text),
    ]);

    const scores = candidates.map((c, idx) => {
      const authorMatch = c.authors.some((a) =>
        allAuthors.has(a.toLowerCase())
      )
        ? 1
        : 0;
      const categoryMatch = c.categories.some((cat) =>
        allCategories.has(cat.toLowerCase())
      )
        ? 1
        : 0;

      return {
        ...c,
        score:
          0.5 * cosineSimilarity(vectors[0], vectors[idx + 1]) +
          0.25 * authorMatch +
          0.25 * categoryMatch,
      };
    });

    scores.sort((a, b) => b.score - a.score);

    setRecommendations(scores.slice(0, 5));
    setLoading(false);
  };

  const handleFavoriteSubmit = async () => {
    if (!favoriteBook) return;

    setLoading(true);
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(favoriteBook)}&maxResults=1`);
    const data = await res.json();
    const seed = data.items?.[0];
    if (!seed) {
      setMessage("Couldn't find that book. Try another.");
      setLoading(false);
      return;
    }

    const seedId = seed.id;
    const seedTitle = seed.volumeInfo?.title?.toLowerCase() || '';
    const desc = seed.volumeInfo?.description || seed.volumeInfo?.title || '';
    const refText = `${seed.volumeInfo.title} ${desc}`;

    const recRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(seed.volumeInfo.title)}&maxResults=20`);
    const recData = await recRes.json();

    const candidates = recData.items
      .filter(b => b.id !== seedId && b.volumeInfo.title?.toLowerCase() !== seedTitle)
      .map(b => ({
        ...b,
        text: `${b.volumeInfo.title} ${b.volumeInfo.description || ''}`,
      }));

    const vectors = tfidfVectorizer([refText, ...candidates.map(c => c.text)]);
    const scored = candidates.map((c, i) => ({
      ...c,
      score: cosineSimilarity(vectors[0], vectors[i + 1]),
    }));

    scored.sort((a, b) => b.score - a.score);
    setFallbackRec(scored[0]);
    setLoading(false);
  };

return (
  <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
    {/* Header */}
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '30px',
      }}
    >
      <img
        src={
          (recommendations.length > 0 || fallbackRec)
            ? '/pics/flipper2.jpg'
            : showFallback
            ? '/pics/flipper3.jpg'
            : '/pics/flipper1.jpg'
        }
        alt="Flipper"
        style={{ width: '200px', borderRadius: '8px' }}
      />
      <div style={{ maxWidth: '500px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>
          Hi, I’m <span style={{ color: '#007bff' }}>Flipper</span>!
        </h1>
        <p style={{ fontSize: '1rem', color: '#444' }}>Your personal AI book buddy!</p>
      </div>
    </div>

    {!showFallback && (
      <>
        <p style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#444' }}>
          Based on your <strong>2 highest-rated books</strong> from recent reviews,<br />
          here are <strong>5 AI-powered recommendations</strong> just for you.
        </p>

        <button
          onClick={fetchRecommendations}
          disabled={loading}
          style={{
            padding: '12px 20px',
            fontSize: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginBottom: '30px',
          }}
        >
          {loading ? 'Fetching…' : 'Get Recommendations'}
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px' }}>
          {recommendations.map(book => (
            <div
              key={book.id}
              onClick={() => navigate(`/book/${book.id}`)}
              style={{
                width: '150px',
                cursor: 'pointer',
                border: '1px solid #ddd',
                padding: '10px',
                borderRadius: '6px',
                textAlign: 'center',
              }}
            >
              <img
                src={book.volumeInfo?.imageLinks?.thumbnail}
                alt={book.volumeInfo?.title}
                style={{ width: '100%', height: 'auto', marginBottom: '10px' }}
              />
              <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{book.volumeInfo?.title}</p>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>{book.volumeInfo?.authors?.join(', ')}</p>
            </div>
          ))}
        </div>
      </>
    )}

    {showFallback && (
      <div style={{ marginTop: '30px', maxWidth: '700px', marginInline: 'auto' }}>
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '10px' }}>
          Uh-oh! You need to leave at least 2 reviews so we can understand your taste.
        </p>
        <p style={{ fontSize: '1rem', marginBottom: '20px' }}>
          But don’t worry — You can either: 
          < br/>
          < br/>Come back after reviewing 2 or more books < br/> OR < br/> Enter your favorite book below and I’ll give you 1 recommendation!
        </p>

        <input
          type="text"
          placeholder="Enter your favorite book"
          value={favoriteBook}
          onChange={e => setFavoriteBook(e.target.value)}
          style={{
            fontSize: '1rem',
            padding: '8px',
            width: '90%',
            maxWidth: '400px',
            margin: '10px auto',
            display: 'block',
          }}
        />

        <button
          onClick={handleFavoriteSubmit}
          disabled={loading || !favoriteBook.trim()}
          style={{
            padding: '8px 16px',
            fontSize: '1rem',
            marginTop: '10px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Fetching…' : 'Get 1 Recommendation'}
        </button>

        {fallbackRec && (
          <div style={{ marginTop: '30px' }}>
            <h3>Here’s a book you might enjoy:</h3>
            <div
              onClick={() => navigate(`/book/${fallbackRec.id}`)}
              style={{
                width: '150px',
                margin: '0 auto',
                cursor: 'pointer',
                border: '1px solid #ddd',
                padding: '10px',
                borderRadius: '6px',
                textAlign: 'center',
              }}
            >
              <img
                src={fallbackRec.volumeInfo?.imageLinks?.thumbnail}
                alt={fallbackRec.volumeInfo?.title}
                style={{ width: '100%', height: 'auto', marginBottom: '10px' }}
              />
              <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{fallbackRec.volumeInfo?.title}</p>
              <p style={{ fontSize: '0.85rem', color: '#666' }}>
                {fallbackRec.volumeInfo?.authors?.join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);
}
