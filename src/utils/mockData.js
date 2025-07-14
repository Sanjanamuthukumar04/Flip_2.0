export const sampleBooks = [
  {
    id: "1",
    title: "Call Me By Your Name",
    author: "André Aciman",
    description: "A passionate and fleeting romance between a 17-year-old boy and a summer guest at his parents' cliffside mansion on the Italian Riviera.",
    image: "https://images-na.ssl-images-amazon.com/images/I/81h2gWPTYJL.jpg",
    rating: 4.2,
    reviewCount: 1250,
    reviews: [
      {
        user: "Sophie",
        date: "2023-10-15",
        text: "A heartbreakingly beautiful novel about desire and first love.",
        likes: 42
      },
      {
        user: "Mark",
        date: "2023-09-22",
        text: "The prose is lyrical and immersive. One of my all-time favorites.",
        likes: 18
      }
    ]
  },
  {
    id: "2",
    title: "The Bell Jar",
    author: "Sylvia Plath",
    description: "A semi-autobiographical novel about a young woman's descent into mental illness.",
    image: "https://images-na.ssl-images-amazon.com/images/I/71X7tXQyQsL.jpg",
    rating: 4.5,
    reviewCount: 980,
    reviews: [
      {
        user: "Emma",
        date: "2023-11-05",
        text: "Raw and powerful. Sylvia Plath's writing is unforgettable.",
        likes: 56
      }
    ]
  },
  {
    id: "3",
    title: "Intermezzo",
    author: "Sally Rooney",
    description: "A novel about love, grief, and the complexities of human relationships.",
    image: "https://images-na.ssl-images-amazon.com/images/I/91B5Xh2j5VL.jpg",
    rating: 3.8,
    reviewCount: 620,
    reviews: [
      {
        user: "Daniel",
        date: "2023-08-30",
        text: "Rooney captures the quiet tragedies of everyday life.",
        likes: 23
      }
    ]
  }
];

// Mock API functions
export const getTopBooks = () => {
  return Promise.resolve(sampleBooks.slice(0, 3)); // Top 3 most reviewed
};

export const searchBooks = (query) => {
  const normalizedQuery = query.toLowerCase();
  return Promise.resolve(
    sampleBooks.filter(
      (book) =>
        book.title.toLowerCase().includes(normalizedQuery) ||
        book.author.toLowerCase().includes(normalizedQuery)
    )
  );
};