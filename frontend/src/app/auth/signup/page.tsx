'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  AppBar,
  Toolbar,
  Grid,
} from '@mui/material';
import {
  Book as BookIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [error, setError] = useState<string>('');
  const { signup } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    setError('');

    try {
      await signup(data.name, data.email, data.password);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: 'primary.main',
          boxShadow: 'none',
          borderRadius: 0,
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 1, sm: 2 } }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
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
          </Link>

          <Box display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2, md: 3 }}>
            <Link href="/#home" style={{ textDecoration: 'none' }}>
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
            <Link href="/#features" style={{ textDecoration: 'none' }}>
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
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, backgroundColor: 'white' }}>
        <Container component="main" maxWidth="sm">
          <Box
            sx={{
              marginTop: { xs: 4, sm: 6, md: 8 },
              marginBottom: { xs: 4, sm: 6, md: 8 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Paper elevation={3} sx={{ padding: { xs: 3, sm: 4 }, width: '100%' }}>
              <Typography component="h1" variant="h4" align="center" gutterBottom>
                Sign Up
              </Typography>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ mb: 2 }}
                >
                  {error}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{ mt: 1 }}
              >
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  autoComplete="name"
                  autoFocus
                  variant="outlined"
                  {...register('name')}
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  autoComplete="email"
                  variant="outlined"
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  variant="outlined"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  variant="outlined"
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                </Button>

                <Box textAlign="center">
                  <Typography variant="body2">
                    Already have an account?{' '}
                    <Link href="/auth/login">Sign in here</Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
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
          <Grid container spacing={{ xs: 2, sm: 3 }} justifyContent="space-between">
            {/* About Section */}
            <Grid item xs={12} md={5}>
              <Box display="flex" alignItems="center" mb={1.5}>
                <BookIcon sx={{ color: 'secondary.main', mr: 1, fontSize: 24 }} />
                <Typography variant="h6" fontWeight={600} fontSize="1rem">
                  Book Management Portal
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.6, fontSize: '0.875rem' }}>
                Browse, review, and manage your book collection with ease.
              </Typography>
            </Grid>

            <Grid item xs={6} md={3}>
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
            </Grid>

            <Grid item xs={6} md={3}>
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
            </Grid>
          </Grid>

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
