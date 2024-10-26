'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { NextPage } from 'next';
import toast from 'react-hot-toast';
import { FaDiscord } from 'react-icons/fa';

const ExpiredPage: NextPage = () => {
  return <LoginPage />;
};

const LoginPage = () => {
  return (
    <Container
      maxWidth="xs"
      sx={{ minHeight: '100vh', alignContent: 'center', alignItems: 'center' }}
    >
      <Box width="100%" alignContent="center" textAlign="center" mb={20}>
        <Typography variant="h3" fontWeight={600}>
          CLASHPERK
        </Typography>

        <Typography variant="body2" color="textSecondary">
          Feature-Rich and Powerful Clash of Clans Discord bot with everything
          you will ever need.
        </Typography>
      </Box>

      <Stack spacing={3} mb={2}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<FaDiscord />}
          sx={{ height: 45 }}
          onClick={() => {
            toast.error('Login with Discord is not available');
          }}
        >
          Login with Discord
        </Button>
      </Stack>

      <Typography variant="body2" align="center" color="textSecondary">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </Typography>
    </Container>
  );
};

export default ExpiredPage;
