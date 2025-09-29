'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Book as BookIcon,
  RateReview as RateReviewIcon,
  AdminPanelSettings as AdminIcon,
  Search as SearchIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/books');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
      }}>
        <Typography variant="h6" color="text.secondary">Loading...</Typography>
      </Box>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: 'primary.main',
          boxShadow: 'none',
          borderRadius: 0,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
          <Box display="flex" alignItems="center">
            <BookIcon sx={{ color: 'secondary.main', mr: { xs: 0.5, sm: 1 }, fontSize: { xs: 24, sm: 28 } }} />
            <Typography 
              variant="h6" 
              fontWeight={700} 
              color="white"
              sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' } }}
            >
              Book Management Portal
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2, md: 3 }}>
            <Link href="#home" style={{ textDecoration: 'none' }}>
              <Typography 
                color="white" 
                sx={{ 
                  '&:hover': { opacity: 0.8 },
                  display: { xs: 'none', md: 'block' }
                }}
              >
                Home
              </Typography>
            </Link>
            <Link href="#features" style={{ textDecoration: 'none' }}>
              <Typography 
                color="white" 
                sx={{ 
                  '&:hover': { opacity: 0.8 },
                  display: { xs: 'none', md: 'block' }
                }}
              >
                Features
              </Typography>
            </Link>
            <Button 
              component={Link} 
              href="/auth/login" 
              variant="outlined"
              sx={{
                borderColor: 'white',
                color: 'white',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 0.75 },
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Login
            </Button>
            <Button 
              component={Link} 
              href="/auth/signup" 
              variant="contained"
              sx={{
                backgroundColor: 'secondary.main',
                color: 'white',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 0.75 },
                '&:hover': {
                  backgroundColor: 'secondary.dark',
                },
              }}
            >
              Sign Up
            </Button>
            
            <IconButton
              color="inherit"
              aria-label="menu"
              onClick={handleMobileMenuOpen}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>

        <Menu
          anchorEl={mobileMenuAnchor}
          open={Boolean(mobileMenuAnchor)}
          onClose={handleMobileMenuClose}
          sx={{ display: { xs: 'block', md: 'none' } }}
        >
          <MenuItem onClick={handleMobileMenuClose}>
            <Link href="#home" style={{ textDecoration: 'none', color: 'inherit' }}>
              Home
            </Link>
          </MenuItem>
          <MenuItem onClick={handleMobileMenuClose}>
            <Link href="#features" style={{ textDecoration: 'none', color: 'inherit' }}>
              Features
            </Link>
          </MenuItem>
        </Menu>
      </AppBar>

      <Box
        sx={{
          backgroundColor: 'primary.main',
          py: { xs: 4, sm: 5, md: 6 },
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr' }, alignItems: 'center' }}>
            <Box>
              <Typography 
                variant="h2" 
                fontWeight={700} 
                color="white" 
                gutterBottom
                sx={{ 
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                  mb: 2
                }}
              >
                Manage Your Books Smarter
              </Typography>
              <Typography 
                variant="h6" 
                color="white" 
                sx={{ 
                  mb: { xs: 2, md: 3 }, 
                  opacity: 0.9,
                  fontWeight: 400,
                  fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.2rem' },
                  lineHeight: 1.4
                }}
              >
                Browse books, leave reviews, and manage your library with powerful admin tools.
              </Typography>
              <Button
                component={Link}
                href="/auth/signup"
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  backgroundColor: 'secondary.main',
                  color: 'white',
                  px: { xs: 2, sm: 3 },
                  py: { xs: 1, sm: 1.2 },
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    backgroundColor: 'secondary.dark',
                  },
                }}
              >
                Get Started
              </Button>
            </Box>

          </Box>
        </Container>
      </Box>

      <Box
        id="features"
        sx={{
          backgroundColor: 'white',
          py: { xs: 4, sm: 6, md: 8 },
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            fontWeight={700} 
            color="text.primary" 
            textAlign="center" 
            gutterBottom
            sx={{ 
              mb: { xs: 3, sm: 4, md: 6 },
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' }
            }}
          >
            Features
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: { xs: 2, sm: 3, md: 4 }, justifyContent: 'center' }}>
            <Box sx={{ display: 'flex' }}>
              <Card sx={{ 
                width: '100%',
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.2s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <CardContent sx={{ 
                  flex: 1,
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 3,
                  '&:last-child': { pb: 3 }
                }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: 'secondary.main',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <SearchIcon sx={{ color: 'white', fontSize: 30 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                    Browse Books
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Search and filter through our collection
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ display: 'flex' }}>
              <Card sx={{ 
                width: '100%',
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.2s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <CardContent sx={{ 
                  flex: 1,
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 3,
                  '&:last-child': { pb: 3 }
                }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: 'secondary.main',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <RateReviewIcon sx={{ color: 'white', fontSize: 30 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                    Leave Feedback
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Rate and review books you&apos;ve read.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ display: 'flex' }}>
              <Card sx={{ 
                width: '100%',
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.2s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <CardContent sx={{ 
                  flex: 1,
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 3,
                  '&:last-child': { pb: 3 }
                }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: 'secondary.main',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <AdminIcon sx={{ color: 'white', fontSize: 30 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                    Admin Dashboard
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Full control over book management.
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Box sx={{ display: 'flex' }}>
              <Card sx={{ 
                width: '100%',
                textAlign: 'center',
                border: '1px solid',
                borderColor: 'grey.200',
                borderRadius: 2,
                '&:hover': {
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                },
                transition: 'all 0.2s ease-in-out',
                display: 'flex',
                flexDirection: 'column',
              }}>
                <CardContent sx={{ 
                  flex: 1,
                  display: 'flex', 
                  flexDirection: 'column',
                  p: 3,
                  '&:last-child': { pb: 3 }
                }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      backgroundColor: 'secondary.main',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                    }}
                  >
                    <BookIcon sx={{ color: 'white', fontSize: 30 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={600} color="text.primary" gutterBottom>
                    Feedback Moderation
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Monitor and moderate user reviews.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: { xs: 3, sm: 4 },
          mt: 'auto',
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 3fr 3fr' }, gap: { xs: 2, sm: 3 } }}>
            <Box>
              <Box display="flex" alignItems="center" mb={1.5}>
                <BookIcon sx={{ color: 'secondary.main', mr: 1, fontSize: 24 }} />
                <Typography variant="h6" fontWeight={600} fontSize="1rem">
                  Book Management Portal
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.6, fontSize: '0.875rem' }}>
                Browse, review, and manage your book collection with ease.
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1.5 }}>
                Resources
              </Typography>
              <Box display="flex" flexDirection="column" gap={0.8}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white', 
                    opacity: 0.85,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    '&:hover': { opacity: 1 } 
                  }}
                >
                  Documentation
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white', 
                    opacity: 0.85,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    '&:hover': { opacity: 1 } 
                  }}
                >
                  Help Center
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white', 
                    opacity: 0.85,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    '&:hover': { opacity: 1 } 
                  }}
                >
                  Privacy Policy
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom sx={{ mb: 1.5 }}>
                Company
              </Typography>
              <Box display="flex" flexDirection="column" gap={0.8}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white', 
                    opacity: 0.85,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    '&:hover': { opacity: 1 } 
                  }}
                >
                  About Us
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white', 
                    opacity: 0.85,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    '&:hover': { opacity: 1 } 
                  }}
                >
                  Contact
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'white', 
                    opacity: 0.85,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    '&:hover': { opacity: 1 } 
                  }}
                >
                  Terms of Service
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box 
            sx={{ 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)', 
              mt: 3, 
              pt: 2.5,
              textAlign: 'center'
            }}
          >
            <Typography variant="body2" sx={{ opacity: 0.8, fontSize: '0.813rem' }}>
              © {new Date().getFullYear()} Book Management Portal. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
