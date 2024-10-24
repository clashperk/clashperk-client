import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export default function SkeletonLoader() {
  return (
    <Stack spacing={1} my={6}>
      <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 2 }} />

      {Array.from({ length: 10 }).map((_, idx) => (
        <Skeleton variant="rounded" height={60} key={idx} />
      ))}
    </Stack>
  );
}
