'use client';

import Alert from '@mui/material/Alert';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { DragSystem } from './DragSystem';

export interface ClanGroup {
  categories: {
    _id: string;
    name: any;
    order: any;
    guildId: any;
  }[];
  grouped: {
    _id: string | string;
    name: any;
    order: any;
    clans: {
      _id: string;
      name: any;
      tag: any;
      guildId: any;
    }[];
  }[];
  clans: {
    _id: string;
    name: any;
    tag: any;
    guildId: any;
  }[];
}

export const ClansPage = (props: {
  token: string;
  guildId: string;
  userId: string;
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handleClose = () => setErrorMessage(null);
  const [clanGroup, setClanGroup] = useState<ClanGroup | null>(null);

  const getGuild = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/guilds/${props.guildId}`,
        {
          headers: {
            Authorization: `Bearer ${props.token}`
          }
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setClanGroup(data);
    } catch (err: any) {
      console.log(err);
      setErrorMessage(err.message);
    }
  };

  const updateClans = async (payload: any) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/guilds/${props.guildId}/clans/reorder`,
        {
          headers: {
            Authorization: `Bearer ${props.token}`,
            'Content-Type': 'application/json'
          },
          method: 'PUT',
          body: JSON.stringify({ categories: payload })
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setClanGroup(data);
    } catch (err) {
      console.log(err);
      setErrorMessage(err.message);
    }
  };

  useEffect(() => {
    if (props.guildId) getGuild();
  }, []); // eslint-disable-line

  return (
    <>
      <Container
        maxWidth="sm"
        sx={{ py: 2, background: '#1d1e22', minHeight: '100vh' }}
      >
        {clanGroup && (
          <>
            <Typography sx={{ fontWeight: 700 }} align="center">
              Reorder Clans
            </Typography>
            <Typography
              align="center"
              variant="body2"
              sx={{ color: '#dcddde', fontSize: '12px', pb: 2 }}
            >
              Do not share this link to anyone.
            </Typography>

            {/* <QuoteApp clanGroup={clanGroup} /> */}
            <DragSystem
              clanGroup={clanGroup}
              onReordered={(payload) => updateClans(payload)}
            />
          </>
        )}

        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={3000}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
};
