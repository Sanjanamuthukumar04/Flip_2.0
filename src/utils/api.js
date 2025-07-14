const API_BASE = 'https://www.googleapis.com/books/v1/volumes?q=';

/**
 * Fetch the top 3 most reviewed books.
 */
export async function getTopBooks() {
  const topQueries = [
    'call me by your name',
    'the bell jar',
    'intermezzo'
  ];

  const results = await Promise.all(
    topQueries.map(async (query) => {
      const res = await fetch(`${API_BASE}${encodeURIComponent(query)}`);
      const data = await res.json();
      return data.items?.[0] || null;
    })
  );

  return results.filter(Boolean);
}

/**
 * Search books by query string.
 */
export async function searchBooks(query) {
  if (!query.trim()) return [];

  const res = await fetch(`${API_BASE}${encodeURIComponent(query)}`);
  const data = await res.json();

  return data.items || [];
}
