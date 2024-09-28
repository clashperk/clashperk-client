'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

export function ActionBar({
  onClick
}: {
  onClick?: (action: string) => unknown;
}) {
  return (
    <Box
      width="100%"
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 0
      }}
    >
      <Container maxWidth="sm" style={{ padding: 0 }}>
        <Stack direction="row-reverse" spacing={1} px={2}>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => onClick?.('remove')}
            sx={{ height: 30 }}
          >
            REMOVE
          </Button>

          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={() => onClick?.('change-category')}
            sx={{ height: 30 }}
          >
            Change Group
          </Button>

          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={() => onClick?.('change-roster')}
            sx={{ height: 30 }}
          >
            Change Roster
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
