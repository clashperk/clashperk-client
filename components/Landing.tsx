'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { FaDiscord } from 'react-icons/fa';

export default function LandingPage() {
  return (
    <Container
      maxWidth="xs"
      sx={{ minHeight: '100vh', alignContent: 'center', alignItems: 'center' }}
    >
      <Box width="100%" alignContent="center" textAlign="center" mb={20}>
        <Typography variant="h3" fontWeight={600}>
          CLASHPERK
        </Typography>

        <Typography variant="body2" color="text.secondary">
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
          href="/rosters?roster=64aac945ec2810a62e535555&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNDQ0NDMyNDg5ODE4MzU3NzYwIiwiZ3VpbGRfaWQiOiI1MDk3ODQzMTc1OTgxMDU2MTkiLCJpYXQiOjE3MjY5NDg3NjEsImV4cCI6MTcyNjk3MDM2MX0.tW-DhdMFxi27-d9Gnj3GCgfBecJgd7DnzGDfaG6D_xA"
        >
          Login with Discord
        </Button>
      </Stack>

      <Typography variant="body2" align="center" color="text.secondary">
        By signing up, you agree to our Terms of Service and Privacy Policy
      </Typography>
    </Container>
  );
}
