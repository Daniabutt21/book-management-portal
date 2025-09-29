'use client';

import { ReactNode } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#9c27b0' },
  },
  transitions: {
    duration: {
      shortest: 0,
      shorter: 0,
      short: 0,
      standard: 0,
      complex: 0,
      enteringScreen: 0,
      leavingScreen: 0,
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            '&:hover': {
              backgroundColor: 'white',
            },
            '&.Mui-focused': {
              backgroundColor: 'white',
            },
          },
          '& .MuiInputBase-input': {
            '&:-webkit-autofill': {
              WebkitBoxShadow: '0 0 0 1000px white inset !important',
              WebkitTextFillColor: '#000000 !important',
            },
            '&:-webkit-autofill:hover': {
              WebkitBoxShadow: '0 0 0 1000px white inset !important',
              WebkitTextFillColor: '#000000 !important',
            },
            '&:-webkit-autofill:focus': {
              WebkitBoxShadow: '0 0 0 1000px white inset !important',
              WebkitTextFillColor: '#000000 !important',
            },
            '&:-webkit-autofill:active': {
              WebkitBoxShadow: '0 0 0 1000px white inset !important',
              WebkitTextFillColor: '#000000 !important',
            },
          },
        },
      },
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
