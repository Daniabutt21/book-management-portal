'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

interface Feedback {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.id as string;
  
  const [book, setBook] = useState<Book | null>(null);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (bookId) {
      fetchBookDetails();
      fetchBookFeedback();
    }
  }, [bookId]);

  const fetchBookDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3001/books/${bookId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch book details');
      }
      const data = await response.json();
      setBook(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load book details');
    }
  };

  const fetchBookFeedback = async () => {
    try {
      const response = await fetch(`http://localhost:3001/feedback/book/${bookId}?isApproved=true`);
      if (!response.ok) {
        throw new Error('Failed to fetch feedback');
      }
      const data = await response.json();
      setFeedback(data.data || []);
    } catch (err: any) {
      console.error('Failed to fetch feedback:', err);
    }
  };

  const getAverageRating = () => {
    if (feedback.length === 0) return 0;
    const sum = feedback.reduce((acc, f) => acc + f.rating, 0);
    return (sum / feedback.length).toFixed(1);
  };

  const getRatingStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !book) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Book not found'}
        </Alert>
        <Button component={Link} href="/books" variant="outlined">
          Back to Books
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Button component={Link} href="/books" variant="outlined" sx={{ mb: 2 }}>
          ← Back to Books
        </Button>
        
        <Card>
          <CardContent>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {book.title}
            </Typography>
            
            <Typography variant="h6" color="text.secondary" gutterBottom>
              by {book.author}
            </Typography>

            <Box display="flex" gap={2} mb={3}>
              <Chip label={book.genre} variant="outlined" />
              <Chip label={book.publishedYear} variant="outlined" />
              <Chip label={`ISBN: ${book.isbn}`} variant="outlined" />
            </Box>

            <Typography variant="body1" paragraph>
              {book.description}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Reviews ({feedback.length})
              </Typography>
              {feedback.length > 0 && (
                <Typography variant="h6" color="primary">
                  Average Rating: {getAverageRating()}/5
                </Typography>
              )}
              {isAuthenticated && (
                <Button 
                  component={Link} 
                  href={`/books/${book.id}/feedback`} 
                  variant="contained"
                >
                  Add Review
                </Button>
              )}
            </Box>

            {feedback.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  No reviews yet. Be the first to review this book!
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {feedback.map((review) => (
                  <Grid item xs={12} key={review.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {review.user.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        
                        <Box mb={1}>
                          <Typography variant="h6" color="primary">
                            {getRatingStars(review.rating)}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2">
                          {review.comment}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
