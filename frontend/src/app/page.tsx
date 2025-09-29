'use client';

import { Container, Typography, Box, Button } from '@mui/material';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={4}
      >
        <Typography variant="h4" fontWeight={700}>
          Book Management Portal
        </Typography>
        <Box display="flex" gap={2} alignItems="center">
          {isAuthenticated ? (
            <>
              <Typography variant="body2" color="text.secondary">
                Welcome, {user?.name} ({user?.role.name})
              </Typography>
              <Button onClick={logout} variant="outlined">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} href="/auth/login" variant="outlined">
                Login
              </Button>
              <Button component={Link} href="/auth/signup" variant="contained">
                Sign up
              </Button>
            </>
          )}
        </Box>
      </Box>
      <Typography variant="body1">
        Manage books, submit feedback, and administer users and reviews.
      </Typography>
    </Container>
  );
}
