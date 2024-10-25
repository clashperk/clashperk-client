'use client';

import AddLinkIcon from '@mui/icons-material/AddLink';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import VerifiedIcon from '@mui/icons-material/Verified';
import LoadingButton from '@mui/lab/LoadingButton';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Snackbar from '@mui/material/Snackbar';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';

import { ActionModal } from '@/components/ActionModal';
import { authCookieKey } from '@/lib/constants';
import { setCookie } from 'cookies-next';
import { APIUser } from 'discord-api-types/v10';
import { AutocompleteSearch } from './Autocomplete';

const rolesMap: Record<string, string> = {
  leader: 'Lead',
  coLeader: 'Co',
  admin: 'Eld',
  member: 'Mem'
};

interface ClanMember {
  name: string;
  tag: string;
  username: string;
  userId: string;
  role: string;
  townHallLevel: number;
  verified: boolean;
  deletable: boolean;
}

interface ClanData {
  name: string;
  tag: string;
  members: number;
  memberList: ClanMember[];
}

interface GuildData {
  name: string;
  guildId: string;
  clans: {
    _id: string;
    name: string;
    tag: string;
    order: number;
  }[];
}

export const LinksPage = (props: {
  token: string;
  userId: string;
  guildId: string;
  isPublicBot: boolean;
}) => {
  const [clanTag, setClanTag] = useState<string>('');
  const [clan, setClan] = useState<ClanData>();
  const [isOpen, setIsOpen] = useState(false);
  const [isDelOpen, setIsDelOpen] = useState(false);
  const [selected, setSelected] = useState<ClanMember | null>();
  const [user, setUser] = useState<APIUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const handleClose = () => setErrorMessage(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [guild, setGuild] = useState<GuildData | null>(null);
  const searchParams = useSearchParams();

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
      setGuild(data);
    } catch (err) {
      console.log(err);
      setErrorMessage(err.message);
    }
  };

  const fetchClan = async (tag: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/clans/${encodeURIComponent(tag)}/links`,
        {
          headers: {
            Authorization: `Bearer ${props.token}`
          }
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setClan(data);
    } catch (err) {
      console.log(err);
      setErrorMessage(err.message);
    }
    setLoading(false);
  };

  const linkAccount = async (member: ClanMember, user: APIUser) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/links`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${props.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerTag: member.tag,
          userId: user.id
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setIsOpen(false);
      fetchClan(clanTag);
    } catch (err) {
      console.log(err);
      setErrorMessage(err.message);
    }
    setLoading(false);
  };

  const deleteAccount = async (playerTag: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/links`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${props.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          playerTag
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setIsDelOpen(false);
      fetchClan(clanTag);
    } catch (err) {
      console.log(err);
      setErrorMessage(err.message);
    }
    setLoading(false);
  };

  const cancelLink = () => {
    setUser(null);
    setSelected(null);
    setIsOpen(false);
    setIsDelOpen(false);
  };

  const changeClan = (tag: string) => {
    router.push(
      `/links?tag=${encodeURIComponent(tag)}&token=${searchParams.get('token')}`
    );
    fetchClan(tag);
    setClanTag(tag);
  };

  useEffect(() => {
    const tag = searchParams.get('tag');
    if (tag) {
      fetchClan(tag);
      setClanTag(tag);
    }
  }, [searchParams]); // eslint-disable-line

  useEffect(() => {
    const tag = searchParams.get('tag');
    if (guild?.clans.length && !tag) {
      changeClan(guild.clans[0].tag);
    }
  }, [guild]); // eslint-disable-line

  useEffect(() => {
    setCookie(authCookieKey, props.token);
    if (props.guildId) getGuild();
  }, []); // eslint-disable-line

  return (
    <>
      <Container
        maxWidth="sm"
        sx={{ py: 2, background: '#1d1e22', minHeight: '100vh' }}
      >
        {clan && guild && (
          <Fragment>
            <Typography
              sx={{
                fontWeight: 700
              }}
              align="center"
            >
              {guild.name} Discord Links
            </Typography>
            <Typography
              align="center"
              variant="body2"
              sx={{ color: '#dcddde', fontSize: '12px', pb: 2 }}
            >
              Do not share this link to anyone.
            </Typography>

            <Stack
              direction="row"
              justifyContent="space-around"
              alignItems="center"
            >
              <FormControl fullWidth>
                <InputLabel id="clan-select-label">
                  {loading ? 'Loading...' : 'CLAN'}
                </InputLabel>
                <Select
                  sx={{
                    color: '#00b0f4',
                    fontWeight: 700,
                    mb: 3,
                    height: '45px'
                  }}
                  // disabled
                  labelId="clan-select-label"
                  id="clan-select"
                  label={loading ? 'Loading...' : 'CLAN'}
                  value={clanTag}
                  onChange={(e) => changeClan(e.target.value as string)}
                >
                  {guild.clans.map((clan) => (
                    <MenuItem key={clan.tag} value={clan.tag}>
                      {clan.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Table aria-label="table">
              <TableHead>
                <TableRow>
                  <TableCell align="left" sx={{ p: 0.5 }} width={3}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#dcddde',
                        fontSize: { xs: '10px', md: '12px' }
                      }}
                    >
                      NAME
                    </Typography>
                  </TableCell>

                  <TableCell align="right" sx={{ p: 0.5 }} width={2}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#dcddde',
                        fontSize: { xs: '10px', md: '12px' }
                      }}
                    >
                      TH
                    </Typography>
                  </TableCell>
                  <TableCell align="left" sx={{ p: 1.5 }} width={2}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#dcddde',
                        fontSize: { xs: '10px', md: '12px' }
                      }}
                    >
                      ROLE
                    </Typography>
                  </TableCell>

                  <TableCell align="left" sx={{ p: 0.5 }} width={2}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#dcddde',
                        fontSize: { xs: '10px', md: '12px' }
                      }}
                    >
                      DISCORD
                    </Typography>
                  </TableCell>

                  <TableCell align="right" sx={{ p: 0.5 }} width={2}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#dcddde',
                        fontSize: { xs: '10px', md: '12px' }
                      }}
                    >
                      ACTION
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clan.memberList.map((row, n) => (
                  <TableRow
                    key={n}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 },
                      '& td': { border: 0 },
                      ...(n === clan.members - 1
                        ? {}
                        : { borderBottom: '0.5px solid #dcddde' })
                    }}
                  >
                    <TableCell
                      align="left"
                      sx={{
                        p: 0,
                        m: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '75px'
                      }}
                    >
                      <Stack direction="row" spacing={0.1} alignItems="center">
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#dcddde',
                            fontSize: '12px'
                          }}
                        >
                          {row.name}
                        </Typography>
                        {row.verified && (
                          <VerifiedIcon
                            sx={{ color: '#1DA1F2', fontSize: '14px' }}
                          />
                        )}
                      </Stack>
                      {/* show tag under */}
                      <Typography
                        variant="body2"
                        sx={{ color: '#dcddde', fontSize: '10px' }}
                      >
                        {row.tag}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 0.5 }} width={0} align="right">
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ color: '#dcddde', fontSize: '12px' }}
                      >
                        {row.townHallLevel}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 1.5 }} width={'auto'} align="left">
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ color: '#dcddde', fontSize: '12px' }}
                      >
                        {rolesMap[row.role]}
                      </Typography>
                    </TableCell>

                    <TableCell
                      sx={{
                        p: 0.5,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100px'
                      }}
                      width={1}
                      align="left"
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#dcddde',
                          fontSize: '12px'
                        }}
                      >
                        {row.username}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ p: 0.5 }} align="right">
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ color: '#1DA1F2', fontSize: '12px' }}
                      >
                        {row.userId ? (
                          <IconButton
                            onClick={() => {
                              setIsDelOpen(true);
                              setSelected(row);
                            }}
                            color="error"
                            disabled={
                              !row.deletable ||
                              (row.verified && row.userId !== props.userId)
                            }
                          >
                            {row.deletable ? <LinkOffIcon /> : <LinkIcon />}
                          </IconButton>
                        ) : (
                          <IconButton
                            onClick={() => {
                              setIsOpen(true);
                              setSelected(row);
                            }}
                            color="default"
                            disabled={Boolean(row.userId)}
                          >
                            {row.userId ? <LinkIcon /> : <AddLinkIcon />}
                          </IconButton>
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {selected && (
              <ActionModal isOpen={isOpen} onClose={() => cancelLink()}>
                <DialogTitle id="dialog-title">Select a user...</DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <AutocompleteSearch
                      guildId={props.guildId}
                      token={props.token}
                      isPublicBot={props.isPublicBot}
                      onSelect={(user) => setUser(user)}
                    />
                  </DialogContentText>

                  <DialogContentText>
                    <Typography
                      variant="body2"
                      sx={{ color: '#dcddde', fontSize: '12px', pt: 2 }}
                    >
                      Search for <strong>{selected.name}</strong> on Discord and
                      link their account to their Clash account.
                    </Typography>

                    <Stack
                      direction="row"
                      sx={{ float: 'right', mt: 2 }}
                      spacing={2}
                    >
                      <Button
                        onClick={() => cancelLink()}
                        variant="contained"
                        color="error"
                      >
                        Cancel
                      </Button>

                      <LoadingButton
                        sx={{
                          float: 'right'
                        }}
                        variant="contained"
                        color="success"
                        loading={loading}
                        disabled={!user}
                        onClick={() => linkAccount(selected, user!)}
                      >
                        Confirm
                      </LoadingButton>
                    </Stack>
                  </DialogContentText>
                </DialogContent>
              </ActionModal>
            )}

            {selected && (
              <ActionModal isOpen={isDelOpen} onClose={() => cancelLink()}>
                <DialogTitle id="dialog-title">
                  Are you sure you want to unlink this account?
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <Typography
                      variant="body2"
                      sx={{ color: '#dcddde', fontSize: '12px' }}
                    >
                      - {selected.name} ({selected.tag})
                      <br />- {selected.username}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#dcddde', fontSize: '12px', pt: 2 }}
                    >
                      - This action cannot be undone.
                      <br />
                      {selected.userId === props.userId && (
                        <>- You are unlinking your own account.</>
                      )}
                    </Typography>
                  </DialogContentText>
                </DialogContent>

                <DialogActions>
                  <Stack
                    direction="row"
                    sx={{ float: 'right', mt: 2 }}
                    spacing={2}
                  >
                    <Button
                      onClick={() => cancelLink()}
                      variant="outlined"
                      color="inherit"
                    >
                      Cancel
                    </Button>

                    <LoadingButton
                      sx={{
                        float: 'right'
                      }}
                      variant="contained"
                      color="error"
                      loading={loading}
                      onClick={() => deleteAccount(selected.tag)}
                    >
                      Confirm
                    </LoadingButton>
                  </Stack>
                </DialogActions>
              </ActionModal>
            )}
          </Fragment>
        )}

        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={10000}
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
