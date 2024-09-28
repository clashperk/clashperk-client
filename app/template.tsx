'use client';

import BottomNav from '@/components/BottomNav';
import TopNav from '@/components/TopNav';
import { authenticatedPaths } from '@/lib/constants';
import Container from '@mui/material/Container';
import { useParams, usePathname } from 'next/navigation';

export default function RootTemplate({
  children
}: {
  children: React.ReactNode;
}) {
  const { id: groupId } = useParams();
  const pathname = usePathname();

  if (![...authenticatedPaths, `/groups/${groupId}`].includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <Container maxWidth="xs" style={{ padding: 5 }}>
      <TopNav />
      {children}
      <BottomNav />
    </Container>
  );
}
