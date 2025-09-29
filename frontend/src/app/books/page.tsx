'use client';

import { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Tabs,
  Tab,
  Rating,
} from '@mui/material';
import {
  Add,
  Person,
  CalendarMonth,
  Tag,
  RateReview,
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  feedbacks?: { id: string; rating: number; comment: string }[];
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/books');
      setBooks(res.data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading books');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getInitials = (title: string) => {
    const words = title.split(' ').filter(w => w.length > 0);
    return words.length >= 2 
      ? (words[0][0] + words[1][0]).toUpperCase()
      : title.substring(0, 2).toUpperCase();
  };

  const avgRating = (book: Book) => {
    if (!book.feedbacks?.length) return 0;
    return book.feedbacks.reduce((sum, f) => sum + f.rating, 0) / book.feedbacks.length;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
          <Typography color="text.secondary" sx={{ mt: 2 }}>Loading books...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        <Button onClick={() => window.location.reload()} variant="outlined">Retry</Button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: 'calc(100vh - 64px)', p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: { xs: 3, sm: 4 }, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} color="#1a202c" 
              sx={{ mb: 1, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' } }}>
              Discover Books
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Browse {books.length} book{books.length !== 1 ? 's' : ''} in our collection
            </Typography>
          </Box>
          
          {user?.role?.name === 'ADMIN' && (
            <Button component={Link} href="/books/new" variant="contained" startIcon={<Add />}
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600, 
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.25 },
                width: { xs: '100%', sm: 'auto' },
                backgroundColor: '#3B82F6',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#2563EB', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)' }
              }}>
              Add New Book
            </Button>
          )}
        </Box>

        <Box sx={{ mb: { xs: 3, sm: 4 }, overflowX: 'auto' }}>
          <Tabs value={tab} onChange={(e, val) => setTab(val)} variant="scrollable" scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { 
                textTransform: 'none', 
                fontWeight: 600, 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                color: '#718096',
                '&.Mui-selected': { color: '#3B82F6' }
              },
              '& .MuiTabs-indicator': { backgroundColor: '#3B82F6', height: 3 }
            }}>
            <Tab label="All Books" />
            <Tab label="Recently Added" />
            <Tab label="Most Reviewed" />
          </Tabs>
        </Box>

        {books.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8, boxShadow: 'none', border: '1px solid #e2e8f0' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>No books available</Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>Be the first to add a book</Typography>
            {user?.role?.name === 'Admin' && (
              <Button component={Link} href="/books/new" variant="contained" startIcon={<Add />}>
                Add First Book
              </Button>
            )}
          </Card>
        ) : (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)', xl: 'repeat(4, 1fr)' },
            gap: { xs: 2, sm: 3 }
          }}>
            {books.map(book => (
              <Box key={book.id}>
                <Card sx={{ 
                  height: { xs: 'auto', sm: 460 },
                  minHeight: { sm: 460 },
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid #e2e8f0',
                  borderRadius: 3,
                  transition: 'all 0.3s',
                  '&:hover': { 
                    boxShadow: '0 10px 30px rgba(59, 130, 246, 0.15)', 
                    transform: 'translateY(-4px)', 
                    borderColor: '#3B82F6' 
                  }
                }}>
                  <Box sx={{ p: { xs: 2.5, sm: 3 }, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Avatar sx={{ 
                        width: { xs: 48, sm: 56 }, 
                        height: { xs: 48, sm: 56 }, 
                        backgroundColor: '#3B82F6', 
                        mr: { xs: 1.5, sm: 2 } 
                      }}>
                        {getInitials(book.title)}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography fontWeight={700} color="#2d3748" sx={{ 
                          fontSize: { xs: '0.95rem', sm: '1rem' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          height: { xs: 40, sm: 44 },
                          mb: 0.5
                        }}>
                          {book.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" 
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          Added {formatDate(book.createdAt)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, minHeight: 28 }}>
                      {book.feedbacks && book.feedbacks.length > 0 ? (
                        <>
                          <Rating value={avgRating(book)} precision={0.5} readOnly size="small" 
                            sx={{ color: '#f59e0b', fontSize: { xs: '1rem', sm: '1.25rem' } }} />
                          <Typography variant="caption" color="text.secondary" 
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                            ({book.feedbacks.length})
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="caption" color="#a0aec0" sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' }, fontStyle: 'italic' }}>
                          No reviews yet
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" fontWeight={600} color="#718096" sx={{ 
                        textTransform: 'uppercase', 
                        letterSpacing: 1, 
                        fontSize: { xs: '0.6rem', sm: '0.65rem' },
                        display: 'block',
                        mb: 1.5
                      }}>
                        About This Book
                      </Typography>

                      <Typography color="#4a5568" sx={{ 
                        fontSize: { xs: '0.8rem', sm: '0.875rem' },
                        lineHeight: 1.6,
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        height: { xs: 40, sm: 44 }
                      }}>
                        {book.description || 'A fascinating book that will take you on an incredible journey.'}
                      </Typography>

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.25, sm: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Person sx={{ fontSize: { xs: 16, sm: 18 }, color: '#3B82F6' }} />
                          <Typography color="#4a5568" sx={{ 
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {book.author}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <CalendarMonth sx={{ fontSize: { xs: 16, sm: 18 }, color: '#3B82F6' }} />
                          <Typography color="#4a5568" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                            {formatDate(book.publishedAt)}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Tag sx={{ fontSize: { xs: 16, sm: 18 }, color: '#3B82F6' }} />
                          <Typography color="#4a5568" sx={{ 
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            fontFamily: 'monospace',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {book.isbn.substring(0, 18)}{book.isbn.length > 18 ? '...' : ''}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 1 }, mt: 'auto' }}>
                      <Button component={Link} href={`/books/${book.id}`} variant="outlined" fullWidth
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          py: { xs: 1, sm: 1.25 },
                          borderColor: '#e2e8f0',
                          color: '#4a5568',
                          '&:hover': { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.04)', color: '#3B82F6' }
                        }}>
                        Details
                      </Button>
                      {isAuthenticated && (
                        <Button component={Link} href={`/books/${book.id}/feedback`} variant="contained" fullWidth
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            py: { xs: 1, sm: 1.25 },
                            backgroundColor: '#3B82F6',
                            boxShadow: 'none',
                            '&:hover': { backgroundColor: '#2563EB', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }
                          }}>
                          Review
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </DashboardLayout>
  );
}
