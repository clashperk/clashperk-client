'use client';

import CapitalDonation from '@/app/web/components/CapitalDonation';
import Loader from '@/app/web/components/Loader';
import Container from '@mui/material/Container';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function CapitalContributionPage({ token }: { token: string }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [logs, setLogs] = useState<any>([]);
  const params = useParams();

  const getHistory = async (tag: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/clans/${tag}/capital-contribution`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    const data = await res.json();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    if (params.tag) {
      getHistory(params.tag as string);
    }
  }, [params]);

  if (!logs.length)
    return <Loader loading={loading} message={'No data available...'} />;

  return (
    <>
      <Container maxWidth="sm">
        <CapitalDonation logs={logs} />
      </Container>
    </>
  );
}
