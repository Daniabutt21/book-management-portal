'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Rating,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const feedbackSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(500, 'Comment must be less than 500 characters'),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
  genre: string;
  description: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const rating = watch('rating');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    if (bookId) {
      fetchBookDetails();
    }
  }, [bookId, isAuthenticated, router]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/books/${bookId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch book details');
      }
      const data = await response.json();
      setBook(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FeedbackFormData) => {
    try {
      setSubmitting(true);
      setError('');

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:3001/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId,
          rating: data.rating,
          comment: data.comment,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/books/${bookId}`);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error && !book) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button component={Link} href="/books" variant="outlined">
          Back to Books
        </Button>
      </Container>
    );
  }

  if (success) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h5" color="success.main" gutterBottom>
              Feedback Submitted Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Thank you for your review. It will be reviewed by our moderators before being published.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to book details...
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box mb={4}>
        <Button component={Link} href={`/books/${bookId}`} variant="outlined" sx={{ mb: 2 }}>
          ← Back to Book Details
        </Button>
        
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Write a Review
        </Typography>
        
        {book && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {book.title}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                by {book.author}
              </Typography>
              <Box display="flex" gap={1}>
                <Chip label={book.genre} size="small" variant="outlined" />
                <Chip label={book.publishedYear} size="small" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                Rating *
              </Typography>
              <Rating
                value={rating}
                onChange={(_, newValue) => {
                  setValue('rating', newValue || 0);
                }}
                size="large"
                sx={{ mb: 1 }}
              />
              {errors.rating && (
                <Typography variant="body2" color="error">
                  {errors.rating.message}
                </Typography>
              )}
            </Box>

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Your Review *"
              placeholder="Share your thoughts about this book..."
              {...register('comment')}
              error={!!errors.comment}
              helperText={errors.comment?.message || `${watch('comment')?.length || 0}/500 characters`}
              sx={{ mb: 3 }}
            />

            <Box display="flex" gap={2}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ minWidth: 120 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Submit Review'}
              </Button>
              <Button
                component={Link}
                href={`/books/${bookId}`}
                variant="outlined"
                disabled={submitting}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
