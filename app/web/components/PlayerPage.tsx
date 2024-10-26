'use client';

import { History } from '@/app/web/components/History';
import { Loader } from '@/app/web/components/Loader';
import Container from '@mui/material/Container';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function PlayerPage({ token }: { token: string }) {
  const [loading, setLoading] = useState<boolean>(true);
  const [wars, setWars] = useState<any>([]);
  const [summary, setSummary] = useState<any>([]);
  const params = useParams();

  const getHistory = async (tag: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/players/${tag}/wars?months=6`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    const wars = await res.json();
    setWars(wars);
  };

  const getCwlSummary = async (tag: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/players/${tag}/cwl-stats`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );
    const summary = await res.json();
    setSummary(summary);
  };

  const fetchData = async (playerTag: string) => {
    try {
      await Promise.all([getHistory(playerTag), getCwlSummary(playerTag)]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.tag) {
      fetchData(params.tag as string);
    }
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!wars.length)
    return <Loader loading={loading} message={'No data available...'} />;

  const attacker = wars?.[0]?.attacker;

  return (
    <>
      <Container maxWidth="sm">
        <History wars={wars} summary={summary} attacker={attacker} />
      </Container>
    </>
  );
}
