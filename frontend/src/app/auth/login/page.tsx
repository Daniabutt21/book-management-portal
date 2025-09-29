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
} from '@mui/material';
import { Book as BookIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState<string>('');
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setError('');

    try {
      await login(data.email, data.password);
    } catch (err) {
      const error = err as { message?: string };
      setError(error.message || 'Login failed');
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
          <Link
            href="/"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Box display="flex" alignItems="center">
              <BookIcon
                sx={{
                  color: 'secondary.main',
                  mr: { xs: 0.5, sm: 1 },
                  fontSize: { xs: 24, sm: 28 },
                }}
              />
              <Typography
                variant="h6"
                fontWeight={700}
                color="white"
                sx={{
                  fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' },
                }}
              >
                Book Management Portal
              </Typography>
            </Box>
          </Link>

          <Box
            display="flex"
            alignItems="center"
            gap={{ xs: 1.5, sm: 2, md: 3 }}
          >
            <Link href="/#home" style={{ textDecoration: 'none' }}>
              <Typography
                color="white"
                sx={{
                  '&:hover': { opacity: 0.8 },
                  display: { xs: 'none', md: 'block' },
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
                  display: { xs: 'none', md: 'block' },
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
            <Paper
              elevation={3}
              sx={{ padding: { xs: 3, sm: 4 }, width: '100%' }}
            >
              <Typography
                component="h1"
                variant="h4"
                align="center"
                gutterBottom
              >
                Login
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
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
                  id="email"
                  label="Email Address"
                  autoComplete="email"
                  autoFocus
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
                  autoComplete="current-password"
                  variant="outlined"
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </Button>

                <Box textAlign="center">
                  <Typography variant="body2">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/signup">Sign up here</Link>
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
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '5fr 3fr 3fr' },
              gap: { xs: 2, sm: 3 },
            }}
          >
            <Box>
              <Box display="flex" alignItems="center" mb={1.5}>
                <BookIcon
                  sx={{ color: 'secondary.main', mr: 1, fontSize: 24 }}
                />
                <Typography variant="h6" fontWeight={600} fontSize="1rem">
                  Book Management Portal
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ opacity: 0.85, lineHeight: 1.6, fontSize: '0.875rem' }}
              >
                Browse, review, and manage your book collection with ease.
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mb: 1.5 }}
              >
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
                    '&:hover': { opacity: 1 },
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
                    '&:hover': { opacity: 1 },
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
                    '&:hover': { opacity: 1 },
                  }}
                >
                  Privacy Policy
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                gutterBottom
                sx={{ mb: 1.5 }}
              >
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
                    '&:hover': { opacity: 1 },
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
                    '&:hover': { opacity: 1 },
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
                    '&:hover': { opacity: 1 },
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
              textAlign: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{ opacity: 0.8, fontSize: '0.813rem' }}
            >
              © {new Date().getFullYear()} Book Management Portal. All rights
              reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
