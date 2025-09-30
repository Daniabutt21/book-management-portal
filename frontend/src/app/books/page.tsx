'use client';

import { useState, useEffect, useCallback } from 'react';
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
  TextField,
  InputAdornment,
  IconButton,
  Pagination,
} from '@mui/material';
import {
  Add,
  Person,
  CalendarMonth,
  Tag,
  Search,
  Clear,
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
  const [searchTitle, setSearchTitle] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [searchISBN, setSearchISBN] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { isAuthenticated, user } = useAuth();

  const fetchBooks = useCallback(async (title?: string, author?: string, isbn?: string) => {
    const searchTitleValue = title !== undefined ? title : searchTitle;
    const searchAuthorValue = author !== undefined ? author : searchAuthor;
    const searchISBNValue = isbn !== undefined ? isbn : searchISBN;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTitleValue) params.append('title', searchTitleValue);
      if (searchAuthorValue) params.append('author', searchAuthorValue);
      if (searchISBNValue) params.append('isbn', searchISBNValue);
      params.append('page', page.toString());
      params.append('limit', '8');

      const url = `/books?${params.toString()}`;

      const res = await apiClient.get(url);
      let fetchedBooks = res.data.data || [];

      if (tab === 1) {
        // Recently Added - sort by createdAt descending
        fetchedBooks = [...fetchedBooks].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else if (tab === 2) {
        // Most Reviewed - sort by number of feedbacks descending
        fetchedBooks = [...fetchedBooks].sort(
          (a, b) => (b.feedbacks?.length || 0) - (a.feedbacks?.length || 0)
        );
      }

      setBooks(fetchedBooks);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading books');
    } finally {
      setLoading(false);
    }
  }, [page, tab]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = () => {
    setPage(1);
    fetchBooks(searchTitle, searchAuthor, searchISBN);
  };

  const fetchAllBooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', '1');
      params.append('limit', '8');

      const url = `/books?${params.toString()}`;
      const res = await apiClient.get(url);
      const fetchedBooks = res.data.data || [];

      setBooks(fetchedBooks);
      setTotalPages(res.data.pagination?.totalPages || 1);
      setTotal(res.data.pagination?.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading books');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTitle('');
    setSearchAuthor('');
    setSearchISBN('');
    setTab(0); // Reset to "All Books" tab
    setPage(1);
    fetchAllBooks();
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
    setPage(1);
  };


  const formatDate = (date: string | null) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const getInitials = (title: string) => {
    const words = title.split(' ').filter((w) => w.length > 0);
    return words.length >= 2
      ? (words[0][0] + words[1][0]).toUpperCase()
      : title.substring(0, 2).toUpperCase();
  };

  const avgRating = (book: Book) => {
    if (!book.feedbacks?.length) return 0;
    return (
      book.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
      book.feedbacks.length
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Loading books...
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={() => window.location.reload()} variant="outlined">
          Retry
        </Button>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ minHeight: 'calc(100vh - 64px)', p: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            mb: { xs: 3, sm: 4 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight={700}
              color="#1a202c"
              sx={{
                mb: 1,
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
              }}
            >
              Discover Books
        </Typography>
            <Typography
              color="text.secondary"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Browse books in our collection
        </Typography>
      </Box>

          {user?.role?.name === 'ADMIN' && (
            <Button
              component={Link}
              href="/books/new"
              variant="contained"
              startIcon={<Add />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1.25 },
                width: { xs: '100%', sm: 'auto' },
                backgroundColor: '#3B82F6',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#2563EB',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                },
              }}
            >
              Add New Book
            </Button>
          )}
        </Box>

        <Box
          sx={{
            mb: 4,
            p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 2,
            background:
              'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #60a5fa 100%)',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 1.5, sm: 2 },
              alignItems: { xs: 'stretch', md: 'center' },
              flexWrap: 'wrap',
            }}
          >
            <TextField
              placeholder="Search by title..."
              variant="outlined"
              size="small"
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                flex: { xs: '1 1 100%', md: '1 1 0' },
                minWidth: { xs: '100%', sm: '200px' },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 1.5,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                    borderWidth: 2,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person
                      sx={{ color: '#9CA3AF', fontSize: { xs: 18, sm: 20 } }}
                    />
                  </InputAdornment>
                ),
                endAdornment: searchTitle && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTitle('')} size="small">
                      <Clear sx={{ fontSize: { xs: 16, sm: 18 } }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              placeholder="Search by author..."
              variant="outlined"
              size="small"
              value={searchAuthor}
              onChange={(e) => setSearchAuthor(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                flex: { xs: '1 1 100%', md: '1 1 0' },
                minWidth: { xs: '100%', sm: '200px' },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 1.5,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                    borderWidth: 2,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person
                      sx={{ color: '#9CA3AF', fontSize: { xs: 18, sm: 20 } }}
                    />
                  </InputAdornment>
                ),
                endAdornment: searchAuthor && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setSearchAuthor('')}
                      size="small"
                    >
                      <Clear sx={{ fontSize: { xs: 16, sm: 18 } }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              placeholder="Search by ISBN..."
              variant="outlined"
              size="small"
              value={searchISBN}
              onChange={(e) => setSearchISBN(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{
                flex: { xs: '1 1 100%', md: '1 1 0' },
                minWidth: { xs: '100%', sm: '200px' },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 1.5,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                  '&.Mui-focused fieldset': {
                    borderColor: 'white',
                    borderWidth: 2,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Tag
                      sx={{ color: '#9CA3AF', fontSize: { xs: 18, sm: 20 } }}
                    />
                  </InputAdornment>
                ),
                endAdornment: searchISBN && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchISBN('')} size="small">
                      <Clear sx={{ fontSize: { xs: 16, sm: 18 } }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              startIcon={<Search sx={{ fontSize: { xs: 18, sm: 20 } }} />}
              onClick={handleSearch}
              sx={{
                backgroundColor: 'white',
                color: '#1e3a8a',
                fontWeight: 600,
                px: { xs: 2, sm: 3 },
                py: { xs: 0.75, sm: 1 },
                borderRadius: 1.5,
                textTransform: 'none',
                boxShadow: 'none',
                fontSize: { xs: '0.875rem', sm: '1rem' },
                flex: { xs: '1 1 100%', sm: '0 0 auto' },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                },
              }}
            >
              Search
            </Button>

            {(searchTitle || searchAuthor || searchISBN) && (
              <Button
                variant="text"
                startIcon={<Clear sx={{ fontSize: { xs: 18, sm: 20 } }} />}
                onClick={handleClearFilters}
                sx={{
                  color: 'white',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.75, sm: 1 },
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  flex: { xs: '1 1 100%', sm: '0 0 auto' },
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Clear
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ mb: { xs: 3, sm: 4 }, overflowX: 'auto' }}>
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                color: '#718096',
                '&.Mui-selected': { color: '#3B82F6' },
              },
              '& .MuiTabs-indicator': { backgroundColor: '#3B82F6', height: 3 },
            }}
          >
            <Tab label="All Books" />
            <Tab label="Recently Added" />
            <Tab label="Most Reviewed" />
          </Tabs>
            </Box>

        {books.length === 0 ? (
          <Card
            sx={{
              textAlign: 'center',
              py: 8,
              boxShadow: 'none',
              border: '1px solid #e2e8f0',
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              No books available
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Be the first to add a book
            </Typography>
            {user?.role?.name === 'Admin' && (
              <Button 
                component={Link} 
                href="/books/new" 
                variant="contained"
                startIcon={<Add />}
              >
                Add First Book
              </Button>
            )}
        </Card>
      ) : (
        <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: { xs: 2, sm: 3 },
                '@media (min-width: 750px) and (max-width: 1199px)': {
                  gridTemplateColumns: 'repeat(2, 1fr)',
                },
                '@media (min-width: 1200px) and (max-width: 1535px)': {
                  gridTemplateColumns: 'repeat(3, 1fr)',
                },
                '@media (min-width: 1536px)': {
                  gridTemplateColumns: 'repeat(4, 1fr)',
                },
              }}
            >
            {books.map((book) => (
                <Box key={book.id}>
                <Card 
                  sx={{ 
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
                        borderColor: '#3B82F6',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        p: { xs: 2.5, sm: 3 },
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      }}
                    >
                      <Box sx={{ display: 'flex', mb: 2 }}>
                        <Avatar
                          sx={{
                            width: { xs: 48, sm: 56 },
                            height: { xs: 48, sm: 56 },
                            backgroundColor: '#3B82F6',
                            mr: { xs: 1.5, sm: 2 },
                          }}
                        >
                          {getInitials(book.title)}
                        </Avatar>
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            fontWeight={700}
                            color="#2d3748"
                            sx={{
                              fontSize: { xs: '0.95rem', sm: '1rem' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              height: { xs: 40, sm: 44 },
                              mb: 0.5,
                            }}
                          >
                      {book.title}
                    </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                          >
                            Added {formatDate(book.createdAt)}
                    </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{ 
                          mb: 2,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          minHeight: 28,
                        }}
                      >
                        {book.feedbacks && book.feedbacks.length > 0 ? (
                          <>
                            <Rating
                              value={avgRating(book)}
                              precision={0.5}
                              readOnly
                        size="small" 
                        sx={{ 
                                color: '#f59e0b',
                                fontSize: { xs: '1rem', sm: '1.25rem' },
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              ({book.feedbacks.length})
                            </Typography>
                          </>
                        ) : (
                          <Typography
                            variant="caption"
                            color="#a0aec0"
                            sx={{
                              fontSize: { xs: '0.75rem', sm: '0.8rem' },
                              fontStyle: 'italic',
                            }}
                          >
                            No reviews yet
                          </Typography>
                        )}
                    </Box>

                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="#718096"
                          sx={{
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            fontSize: { xs: '0.6rem', sm: '0.65rem' },
                            display: 'block',
                            mb: 1.5,
                          }}
                        >
                          About This Book
                    </Typography>

                    <Typography 
                          color="#4a5568"
                      sx={{ 
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            lineHeight: 1.6,
                            mb: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        display: '-webkit-box',
                            WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                            height: { xs: 40, sm: 44 },
                          }}
                        >
                          {book.description ||
                            'A fascinating book that will take you on an incredible journey.'}
                        </Typography>

                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: { xs: 1.25, sm: 1.5 },
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                            }}
                          >
                            <Person
                              sx={{
                                fontSize: { xs: 16, sm: 18 },
                                color: '#3B82F6',
                              }}
                            />
                            <Typography
                              color="#4a5568"
                              sx={{
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {book.author}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                            }}
                          >
                            <CalendarMonth
                              sx={{
                                fontSize: { xs: 16, sm: 18 },
                                color: '#3B82F6',
                              }}
                            />
                            <Typography
                              color="#4a5568"
                              sx={{
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              }}
                            >
                              {formatDate(book.publishedAt)}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1.5,
                            }}
                          >
                            <Tag
                              sx={{
                                fontSize: { xs: 16, sm: 18 },
                                color: '#3B82F6',
                              }}
                            />
                            <Typography
                              color="#4a5568"
                              sx={{
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                fontFamily: 'monospace',
                        overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                      }}
                    >
                              {book.isbn.substring(0, 18)}
                              {book.isbn.length > 18 ? '...' : ''}
                    </Typography>
                          </Box>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          gap: { xs: 1, sm: 1 },
                          mt: 'auto',
                        }}
                      >
                    <Button 
                      component={Link} 
                      href={`/books/${book.id}`} 
                      variant="outlined"
                      fullWidth
                      sx={{
                            textTransform: 'none',
                        fontWeight: 600,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            py: { xs: 1, sm: 1.25 },
                            borderColor: '#e2e8f0',
                            color: '#4a5568',
                        '&:hover': {
                              borderColor: '#3B82F6',
                              backgroundColor: 'rgba(59, 130, 246, 0.04)',
                              color: '#3B82F6',
                            },
                          }}
                        >
                          Details
                    </Button>
                    {isAuthenticated && (
                      <Button 
                        component={Link} 
                        href={`/books/${book.id}/feedback`} 
                        variant="contained"
                        fullWidth
                        sx={{
                              textTransform: 'none',
                          fontWeight: 600,
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              py: { xs: 1, sm: 1.25 },
                              backgroundColor: '#3B82F6',
                              boxShadow: 'none',
                          '&:hover': {
                                backgroundColor: '#2563EB',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                              },
                        }}
                      >
                            Review
                      </Button>
                    )}
                      </Box>
                    </Box>
                </Card>
                </Box>
              ))}
            </Box>

            {!loading && books.length > 0 && totalPages > 1 && (
              <Box
                sx={{
                  mt: { xs: 4, sm: 5, md: 6 },
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                  Showing {books.length} of {total} books
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="medium"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 500,
                      '&.Mui-selected': {
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: '#2563EB',
                        },
                      },
                    },
                    '& .MuiPaginationItem-sizeMedium': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      minWidth: { xs: '32px', sm: '40px' },
                      height: { xs: '32px', sm: '40px' },
                    },
                  }}
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
        </>
      )}
      </Box>
    </DashboardLayout>
  );
}
