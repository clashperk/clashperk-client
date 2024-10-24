'use client';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

export default function TopNav() {
  return (
    <Paper
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 50,
        zIndex: 4
      }}
      elevation={2}
    >
      <Container
        maxWidth="xs"
        style={{ padding: 0, alignContent: 'center', alignItems: 'center' }}
      >
        <Stack direction="row" justifyContent="space-between">
          <Typography padding={1} fontWeight={600} variant="h5">
            clashperk
          </Typography>
        </Stack>
      </Container>
    </Paper>
  );
}
