'use client';

import AttackLog from '@/app/web/components/AttackLog';
import Loader from '@/app/web/components/Loader';
import Container from '@mui/material/Container';
import { useParams } from 'next/navigation';
import * as React from 'react';

export function AttackLogPage({ token }: { token: string }) {
  const [data, setData] = React.useState<any>();
  const [loading, setLoading] = React.useState(true);
  const params = useParams();

  const getWar = async (id: string, clanTag: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/clans/${clanTag}/wars/${id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    const data = await res.json();
    setData(data);
    setLoading(false);
  };

  React.useEffect(() => {
    if (params.id) {
      getWar(params.id as string, params.tag as string);
    }
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!data)
    return <Loader loading={loading} message={'No data available...'} />;

  return (
    <Container maxWidth="sm">
      <AttackLog data={data} />
    </Container>
  );
}
