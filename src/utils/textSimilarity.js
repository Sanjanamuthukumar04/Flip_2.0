export function tfidfVectorizer(texts) {
  const tfidf = {};
  const vocab = new Set();

  texts.forEach(text => {
    const words = text.toLowerCase().split(/\W+/);
    words.forEach(w => vocab.add(w));
  });

  const vocabArr = Array.from(vocab);
  const vectors = texts.map(text => {
    const words = text.toLowerCase().split(/\W+/);
    const counts = {};
    words.forEach(w => counts[w] = (counts[w] || 0) + 1);
    return vocabArr.map(w => counts[w] || 0);
  });

  return vectors;
}

export function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (normA * normB);
}
