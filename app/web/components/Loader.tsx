import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { Stack } from '@mui/system';

export const Loader = ({
  loading,
  message
}: {
  loading: boolean;
  message?: string;
}) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        mx: { md: 5 },
        padding: 2,
        minHeight: '100vh',
        flexShrink: 0,
        background: '#2F3136',
        borderRadius: '4px 4px 4px 4px'
        // borderLeft: "4px solid #5865f2",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="start"
      >
        <Skeleton variant="text" animation="wave" width={'40%'} />
        <Skeleton variant="rectangular" width={40} height={40} />
      </Stack>

      {!loading && message && (
        <Typography sx={{ color: '#dcddde' }}>{message}</Typography>
      )}

      <Stack direction="column" spacing={1} sx={{ mt: 1, mb: 1 }}>
        {Array(20)
          .fill(0)
          .map((_, i) => (
            <Stack key={i} direction="row" justifyContent="space-between">
              <Skeleton width={'30%'} />
              <Skeleton width={'30%'} />
              <Skeleton width={'30%'} />
            </Stack>
          ))}
      </Stack>

      <Skeleton width={'100%'} />
      <Skeleton width={'100%'} />
      <Skeleton width={'100%'} />
    </Paper>
  );
};
