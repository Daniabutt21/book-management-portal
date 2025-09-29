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
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  IconButton,
} from '@mui/material';
import {
  People,
  AdminPanelSettings,
  Person,
  Delete,
} from '@mui/icons-material';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  createdAt: string;
  role: {
    id: string;
    name: string;
  };
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user?.role?.name !== 'ADMIN') {
      router.push('/books');
      return;
    }
    fetchUsers();
  }, [user, router, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');

      const res = await apiClient.get(`/users?${params.toString()}`);
      const userData = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setUsers(userData);
      setTotalPages(res.data?.pagination?.totalPages || 1);
      setTotal(res.data?.pagination?.total || userData.length);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await apiClient.patch(`/users/${userId}/role`, { roleId: newRole });
      setUsers(
        users.map((u) =>
          u.id === userId
            ? {
                ...u,
                roleId: newRole,
                role: { ...u.role, id: newRole, name: newRole.toUpperCase() },
              }
            : u
        )
      );
    } catch (err) {
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (userEmail === user?.email) {
      alert('You cannot delete your own account!');
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await apiClient.delete(`/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
      setTotal(total - 1);
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="70vh"
        >
          <CircularProgress />
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Loading users...
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
        <Button onClick={fetchUsers} variant="outlined">
          Retry
        </Button>
      </DashboardLayout>
    );
  }

  const adminCount = users.filter((u) => u.role?.name === 'ADMIN').length;
  const userCount = users.filter((u) => u.role?.name === 'USER').length;

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={700}
            color="#1a202c"
            sx={{
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            <People sx={{ fontSize: { xs: 28, sm: 32 }, color: '#3B82F6' }} />
            User Management
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Manage users and assign roles
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: { xs: 2, sm: 2.5, md: 3 },
            mb: 4,
            '@media (min-width: 750px)': {
              gridTemplateColumns: 'repeat(2, 1fr)',
            },
            '@media (min-width: 1024px)': {
              gridTemplateColumns: 'repeat(3, 1fr)',
            },
          }}
        >
          <Card
            sx={{
              p: { xs: 2.5, sm: 3 },
              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                mb: 1,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              Total Users
            </Typography>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}
            >
              {total}
            </Typography>
          </Card>

          <Card
            sx={{
              p: { xs: 2.5, sm: 3 },
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                mb: 1,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              Administrators
            </Typography>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}
            >
              {adminCount}
            </Typography>
          </Card>

          <Card
            sx={{
              p: { xs: 2.5, sm: 3 },
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              borderRadius: 2,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                mb: 1,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              Regular Users
            </Typography>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}
            >
              {userCount}
            </Typography>
          </Card>
        </Box>

        <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: 'white',
            }}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              All Users ({total})
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {users.map((u) => (
              <Card
                key={u.id}
                sx={{
                  mb: 2,
                  p: { xs: 2, sm: 2.5, md: 3 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 2,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)',
                    borderColor: '#3B82F6',
                  },
                  '@media (min-width: 750px)': {
                    flexDirection: 'row',
                    alignItems: 'center',
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flex: 1,
                  }}
                >
                  <Avatar
                    sx={{
                      width: { xs: 48, sm: 56 },
                      height: { xs: 48, sm: 56 },
                      backgroundColor: '#3B82F6',
                      fontWeight: 700,
                      fontSize: { xs: '1rem', sm: '1.25rem' },
                    }}
                  >
                    {getInitials(u.name)}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{
                        fontSize: { xs: '0.95rem', sm: '1.125rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {u.name}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.8rem', sm: '0.95rem' },
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {u.email}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      }}
                    >
                      Joined{' '}
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: { xs: 1.5, sm: 2 },
                    width: '100%',
                    '@media (min-width: 750px)': {
                      width: 'auto',
                    },
                  }}
                >
                  <Chip
                    icon={
                      u.role?.name === 'ADMIN' ? (
                        <AdminPanelSettings
                          sx={{ fontSize: { xs: 16, sm: 18 } }}
                        />
                      ) : (
                        <Person sx={{ fontSize: { xs: 16, sm: 18 } }} />
                      )
                    }
                    label={u.role?.name || 'USER'}
                    color={u.role?.name === 'ADMIN' ? 'primary' : 'default'}
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      minWidth: { xs: 80, sm: 100 },
                    }}
                  />

                  {u.email !== user?.email && (
                    <FormControl
                      size="small"
                      sx={{
                        minWidth: { xs: 100, sm: 120 },
                        flex: { xs: '1 1 auto', sm: '0 0 auto' },
                      }}
                    >
                      <InputLabel
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        Change Role
                      </InputLabel>
                      <Select
                        value={u.roleId}
                        label="Change Role"
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        <MenuItem
                          value="user"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          User
                        </MenuItem>
                        <MenuItem
                          value="admin"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          Admin
                        </MenuItem>
                      </Select>
                    </FormControl>
                  )}

                  {u.email === user?.email && (
                    <Chip
                      label="You"
                      size="small"
                      sx={{
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: { xs: '0.7rem', sm: '0.8125rem' },
                      }}
                    />
                  )}

                  {u.email !== user?.email && (
                    <IconButton
                      onClick={() => handleDeleteUser(u.id, u.email)}
                      size="small"
                      sx={{
                        color: '#ef4444',
                        padding: { xs: 0.75, sm: 1 },
                        '&:hover': {
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        },
                      }}
                    >
                      <Delete sx={{ fontSize: { xs: 20, sm: 22 } }} />
                    </IconButton>
                  )}
                </Box>
              </Card>
            ))}

            {!loading && totalPages > 1 && (
              <Box
                sx={{
                  mt: 4,
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
                  Showing {users.length} of {total} users
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size={window.innerWidth < 600 ? 'small' : 'medium'}
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
                  }}
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}

            {users.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography variant="h6" color="text.secondary">
                  No users found
                </Typography>
              </Box>
            )}
          </Box>
        </Card>
      </Box>
    </DashboardLayout>
  );
}
