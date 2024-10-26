'use client';

import { authCookieKey } from '@/lib/constants';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Container from '@mui/material/Container';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { setCookie } from 'cookies-next';
import { useRouter, useSearchParams } from 'next/navigation';
import { unique } from 'radash';
import { Fragment, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ActionModal } from '../../../components/ActionModal';
import {
  GuildRosterOutput,
  RosterCategoriesEntity,
  RosterMember,
  RostersEntity,
  RostersEntityExtended
} from '../hooks/types';
import { useRosters } from '../hooks/useRosters';
import { ActionBar } from './ActionBar';

const rolesMap: Record<string, string> = {
  leader: 'Lead',
  coLeader: 'Co',
  admin: 'Eld',
  member: 'Mem'
};

export const RostersPage = (props: {
  guildId: string;
  userId: string;
  token: string;
}) => {
  const [rosterId, setRosterId] = useState<string>('');
  const [roster, setRoster] = useState<RostersEntityExtended>();
  const [categoriesMap, setCategoriesMap] = useState<
    Record<string, RosterCategoriesEntity | null>
  >({});
  const searchParams = useSearchParams();
  const [selectedMembers, setSelectedMembers] = useState<RosterMember[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const [isRosterSwapOpen, setIsRosterSwapOpen] = useState(false);
  const [isDelOpen, setIsDelOpen] = useState(false);
  const [isCategorySwapOpen, setIsCategorySwapOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [guild, setGuildRoster] = useState<GuildRosterOutput | null>(null);
  const [newRoster, setNewRoster] = useState<RostersEntity | null>(null);
  const [newCategory, setNewCategory] = useState<RosterCategoriesEntity | null>(
    null
  );
  const [selectedCategories, setSelectedCategories] = useState<
    Record<string, 'full' | 'partial' | null>
  >({});

  const { getRosters, changeCategory, getRoster, changeRoster, removeMembers } =
    useRosters();

  const fetchRosters = async () => {
    try {
      const data = await getRosters({ guildId: props.guildId });

      setCategoriesMap(
        Object.fromEntries(
          (data as GuildRosterOutput).categories.map((cat) => [cat._id, cat])
        )
      );
      setGuildRoster(data);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
  };

  const handleGroupMembers = (roster: RostersEntity) => {
    const membersMap = roster.members.reduce<Record<string, RosterMember[]>>(
      (result, member) => {
        const key = categoriesMap[member.categoryId!]?._id || 'un-categorized';
        result[key] ??= [];
        result[key].push(member);
        return result;
      },
      {}
    );
    const membersGrouped = Object.entries(membersMap).map(
      ([categoryId, members]) => ({ categoryId, members })
    );

    membersGrouped.sort((a, b) => {
      if (a.categoryId === 'un-categorized') return 1;
      if (b.categoryId === 'un-categorized') return -1;
      return a.categoryId.localeCompare(b.categoryId);
    });

    setRoster({ ...roster, membersGrouped, membersMap });
  };

  const handleGetRoster = async (rosterId: string) => {
    setLoading(true);
    try {
      const data = await getRoster({ rosterId });
      handleGroupMembers(data);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleChangeRoster = async (
    members: RosterMember[],
    newRoster: RostersEntity
  ) => {
    setLoading(true);
    try {
      const data = await changeRoster({
        body: {
          playerTags: members.map((member) => member.tag),
          rosterId: newRoster._id,
          categoryId: newCategory?._id || null
        },
        rosterId: roster!._id
      });

      if (Array.isArray(data.result)) {
        const errors = data.result
          .filter((x) => !x.success)
          .map((x) => `${x.player.name} (${x.player.tag}) - ${x.message}`);
        if (errors.length) setErrors(errors);
      }

      cancelAction();
      setIsRosterSwapOpen(false);
      handleGroupMembers(data.roster);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
      setNewRoster(null);
    }
  };

  const handleChangeCategory = async (
    members: RosterMember[],
    newCategory: RosterCategoriesEntity
  ) => {
    setLoading(true);
    try {
      const data = await changeCategory({
        rosterId: roster!._id,
        body: {
          playerTags: members.map((member) => member.tag),
          categoryId: newCategory._id
        }
      });
      cancelAction();
      setIsCategorySwapOpen(false);
      handleGroupMembers(data);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setNewCategory(null);
      setLoading(false);
    }
  };

  const handleRemoveMembers = async (members: RosterMember[]) => {
    setLoading(true);
    try {
      await removeMembers({
        rosterId: roster!._id,
        body: { playerTags: members.map((member) => member.tag) }
      });
      cancelAction();
      setIsDelOpen(false);
      handleGetRoster(rosterId);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelAction = () => {
    setIsRosterSwapOpen(false);
    setIsCategorySwapOpen(false);
    setNewRoster(null);
    setNewCategory(null);
    setIsDelOpen(false);
    setSelectedMembers([]);
  };

  const switchRoster = (rosterId: string) => {
    router.push(
      `/rosters?roster=${rosterId}&token=${searchParams.get('token')}`
    );
    setRosterId(rosterId);
    cancelAction();
  };

  useEffect(() => {
    const rosterId = searchParams.get('roster');
    if (rosterId && guild) {
      handleGetRoster(rosterId as string);
      setRosterId(rosterId as string);
    }
  }, [searchParams, guild]); // eslint-disable-line

  useEffect(() => {
    const rosterId = searchParams.get('roster');
    if (guild?.rosters.length && !rosterId) {
      switchRoster(guild.rosters[0]._id);
    }
  }, [guild]); // eslint-disable-line

  useEffect(() => {
    setCookie(authCookieKey, props.token);
    if (props.guildId) fetchRosters();
  }, []); // eslint-disable-line

  return (
    <>
      <Container maxWidth="sm" sx={{ py: 2, minHeight: '100vh' }}>
        {roster && guild && (
          <Fragment>
            <Typography
              sx={{
                fontWeight: 700
              }}
              align="center"
            >
              Rosters
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
              mb={3}
            >
              <FormControl fullWidth>
                <InputLabel id="roster-select-label">
                  {loading ? 'Loading...' : 'ROSTER'}
                </InputLabel>
                <Select
                  labelId="roster-select-label"
                  id="roster-select"
                  sx={{ color: '#00b0f4', fontWeight: 700 }}
                  label={loading ? 'Loading...' : 'ROSTER'}
                  value={rosterId}
                  onChange={(e) => switchRoster(e.target.value as string)}
                >
                  {guild.rosters.map((roster) => (
                    <MenuItem key={roster.name} value={roster._id}>
                      {getRosterName(roster)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack sx={{ mb: 1 }}>
              <Typography variant="h6" color="var(--blurple)">
                {roster.name} {roster.clan ? `- ${roster.clan.name}` : ''}
              </Typography>

              {[
                {
                  name: 'Total Members',
                  value: `${roster.members.length}/${roster.maxMembers || 65}`
                },
                {
                  name: 'Minimum TownHall',
                  value: `${roster.minTownHall || 0}`
                },
                {
                  name: 'Maximum TownHall',
                  value: `${roster.maxTownHall || 0}`
                },
                {
                  name: 'Minimum Hero Level',
                  value: `${roster.minHeroLevels || 0}`
                }
              ].map((item, idx) => (
                <Stack
                  direction="row"
                  spacing={2}
                  justifyContent="space-between"
                  sx={{ borderRadius: 1, px: 1 }}
                  bgcolor="#464a4c"
                  mb={0.2}
                  key={idx}
                >
                  <Typography variant="caption">{item.name}</Typography>
                  <Typography variant="caption">{item.value}</Typography>
                </Stack>
              ))}
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignContent="center"
              alignItems="center"
            >
              <Box
                display="flex"
                gap={1}
                alignContent="center"
                alignItems="center"
              >
                <IconButton
                  sx={{ p: 0, pl: 0.5 }}
                  onClick={() => {
                    if (selectedMembers.length !== roster.members.length) {
                      setSelectedMembers(roster.members);
                    } else {
                      setSelectedMembers([]);
                    }
                  }}
                >
                  {!selectedMembers.length ? (
                    <CheckBoxOutlineBlankIcon />
                  ) : roster.members.length === selectedMembers.length ? (
                    <CheckBoxIcon />
                  ) : (
                    <IndeterminateCheckBoxIcon />
                  )}
                </IconButton>
                {selectedMembers.length > 1 && (
                  <Typography variant="body2">
                    {selectedMembers.length} selected
                  </Typography>
                )}
              </Box>

              <Stack spacing={1} direction="row-reverse">
                <Button variant="outlined" sx={{ height: 30 }}>
                  Edit
                </Button>
                <Button color="error" variant="outlined" sx={{ height: 30 }}>
                  Delete
                </Button>
              </Stack>
            </Stack>

            <Table aria-label="table" sx={{ mb: 3 }}>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="left"
                    sx={{ p: 0.5, maxWidth: '75px' }}
                    width={2}
                  >
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

                  <TableCell align="right" sx={{ p: 1.5 }} width={2}>
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

                  <TableCell align="right" sx={{ p: 0.5 }} width={2}>
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
                </TableRow>
              </TableHead>
              <TableBody sx={{ width: '100%' }}>
                {roster.membersGrouped.map(({ members, categoryId }, n) => (
                  <>
                    {members.map((row, idx) => (
                      <>
                        {idx === 0 && (
                          <TableRow
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                              '& td': { border: 0 }
                            }}
                          >
                            <TableCell
                              colSpan={4}
                              align="left"
                              sx={{ p: 0, py: 1 }}
                            >
                              <Paper sx={{ p: 0.5 }} variant="outlined">
                                <Stack
                                  justifyContent="space-between"
                                  direction="row"
                                >
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    alignContent="center"
                                    alignItems="center"
                                  >
                                    <Checkbox
                                      checkedIcon={
                                        selectedCategories[categoryId] ===
                                        'full' ? (
                                          <CheckBoxIcon />
                                        ) : (
                                          <IndeterminateCheckBoxIcon />
                                        )
                                      }
                                      sx={{ p: 0 }}
                                      checked={Boolean(
                                        selectedMembers.length &&
                                          (selectedCategories[categoryId] ===
                                            'full' ||
                                            selectedMembers.some(
                                              (x) =>
                                                (x.categoryId ||
                                                  'un-categorized') ===
                                                categoryId
                                            ))
                                      )}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedMembers((record) =>
                                            unique(
                                              [...record, ...members],
                                              (x) => x.tag
                                            )
                                          );
                                        } else {
                                          setSelectedMembers((record) =>
                                            record.filter(
                                              (member) =>
                                                !members.some(
                                                  (x) => x.tag === member.tag
                                                )
                                            )
                                          );
                                        }

                                        setSelectedCategories((record) => ({
                                          ...record,
                                          [categoryId]: e.target.checked
                                            ? 'full'
                                            : null
                                        }));
                                      }}
                                    />
                                    <Typography>
                                      {categoriesMap[categoryId]?.displayName ||
                                        'Ungrouped'}
                                    </Typography>
                                  </Stack>

                                  <Typography>{members.length}</Typography>
                                </Stack>
                              </Paper>
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow
                          key={n}
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            '& td': { border: 0 },
                            ...(idx === members.length - 1
                              ? {}
                              : { borderBottom: '0.5px solid #dcddde' })
                          }}
                        >
                          <TableCell
                            align="left"
                            width={2}
                            sx={{
                              p: 0,
                              m: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '75px'
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Checkbox
                                sx={{ p: 0, pl: 0.5 }}
                                checked={selectedMembers.some(
                                  (x) => x.tag === row.tag
                                )}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedMembers([
                                      ...selectedMembers,
                                      row
                                    ]);
                                  } else {
                                    setSelectedMembers(
                                      selectedMembers.filter(
                                        (member) => member.tag !== row.tag
                                      )
                                    );
                                  }
                                  setSelectedCategories((record) => ({
                                    ...record,
                                    [categoryId]: 'partial'
                                  }));
                                }}
                              />
                              <Stack direction="column" spacing={0.1}>
                                <Typography
                                  variant="body2"
                                  sx={{ fontSize: '12px' }}
                                >
                                  {row.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    color: 'GrayText',
                                    fontSize: '10px'
                                  }}
                                >
                                  {row.tag}
                                </Typography>
                              </Stack>
                            </Stack>
                          </TableCell>

                          <TableCell sx={{ p: 0.5 }} width={2} align="right">
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ color: '#dcddde', fontSize: '12px' }}
                            >
                              {row.townHallLevel}
                            </Typography>
                          </TableCell>

                          <TableCell
                            sx={{ p: 1.5 }}
                            width={'auto'}
                            align="right"
                          >
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ color: '#dcddde', fontSize: '12px' }}
                            >
                              {row.role ? rolesMap[row.role] : 'NONE'}
                            </Typography>
                          </TableCell>

                          <TableCell
                            sx={{
                              p: 0.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              maxWidth: '80px'
                            }}
                            width={2}
                            align="right"
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
                        </TableRow>
                      </>
                    ))}
                  </>
                ))}
              </TableBody>
            </Table>

            {/* SWAP ROSTER */}
            {selectedMembers.length > 0 && (
              <ActionModal
                isOpen={isRosterSwapOpen}
                onClose={() => cancelAction()}
              >
                <DialogTitle id="dialog-title">Change Roster</DialogTitle>
                <DialogContent>
                  <FormControl fullWidth sx={{ mt: 1, gap: 1 }}>
                    <InputLabel id="roster-simple-select-label" required>
                      NEW ROSTER
                    </InputLabel>
                    <Select
                      labelId="roster-simple-select-label"
                      id="roster-simple-select"
                      sx={{
                        color: '#00b0f4',
                        fontWeight: 700
                      }}
                      required
                      label="NEW ROSTER"
                      value={newRoster?._id}
                      onChange={(e) => {
                        const roster = guild.rosters.find(
                          (roster) => roster._id === e.target.value
                        );
                        if (roster) setNewRoster(roster);
                        else setNewRoster(null);
                      }}
                    >
                      {guild.rosters
                        .filter((_roster) => roster._id !== _roster._id)
                        .map((roster) => (
                          <MenuItem key={roster._id} value={roster._id}>
                            {getRosterName(roster)}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mt: 2.5, gap: 1 }}>
                    <InputLabel id="group-simple-select-label">
                      NEW GROUP
                    </InputLabel>
                    <Select
                      labelId="group-simple-select-label"
                      id="group-simple-select"
                      sx={{
                        color: '#00b0f4',
                        fontWeight: 700
                      }}
                      label="NEW GROUP"
                      value={newCategory?._id}
                      onChange={(e) => {
                        const category = guild.categories.find(
                          (cat) => cat._id === e.target.value
                        );
                        if (category) setNewCategory(category);
                        else setNewCategory(null);
                      }}
                    >
                      {guild.categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.displayName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <DialogContentText>
                    {newRoster && (
                      <>
                        <Typography
                          variant="body1"
                          sx={{ pt: 2 }}
                          color="textSecondary"
                        >
                          Moving to <strong>{getRosterName(newRoster)}</strong>
                        </Typography>

                        <Typography variant="body2" sx={{ pt: 2 }}>
                          {selectedMembers.map((member) => (
                            <>
                              {member.name} ({member.tag}) <br />
                            </>
                          ))}
                        </Typography>
                      </>
                    )}
                  </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ mb: 2, mr: 1 }}>
                  <Stack
                    direction="row"
                    sx={{ float: 'right', mt: 2 }}
                    spacing={2}
                  >
                    <Button
                      onClick={() => cancelAction()}
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
                      color="success"
                      loading={loading}
                      disabled={!newRoster}
                      onClick={() =>
                        handleChangeRoster(selectedMembers, newRoster!)
                      }
                    >
                      Confirm
                    </LoadingButton>
                  </Stack>
                </DialogActions>
              </ActionModal>
            )}

            {/*  SWAP CATEGORY */}
            {selectedMembers.length > 0 && (
              <ActionModal
                isOpen={isCategorySwapOpen}
                onClose={() => cancelAction()}
              >
                <DialogTitle id="dialog-title">Change Group</DialogTitle>
                <DialogContent>
                  <FormControl fullWidth sx={{ mt: 1 }}>
                    <InputLabel id="group-simple-select-label">
                      NEW GROUP
                    </InputLabel>
                    <Select
                      labelId="group-simple-select-label"
                      id="group-simple-select"
                      sx={{
                        color: '#00b0f4',
                        fontWeight: 700
                      }}
                      label="NEW GROUP"
                      value={newCategory?._id}
                      onChange={(e) => {
                        const category = guild.categories.find(
                          (cat) => cat._id === e.target.value
                        );
                        if (category) setNewCategory(category);
                        else setNewCategory(null);
                      }}
                    >
                      {guild.categories.map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.displayName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <DialogContentText>
                    {newCategory && (
                      <>
                        <Typography
                          variant="body1"
                          sx={{ pt: 2 }}
                          color="textSecondary"
                        >
                          Moving to <strong>{newCategory.displayName}</strong>
                        </Typography>

                        <Typography variant="body2" sx={{ pt: 2 }}>
                          {selectedMembers.map((member) => (
                            <>
                              {member.name} ({member.tag}) <br />
                            </>
                          ))}
                        </Typography>
                      </>
                    )}
                  </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ mb: 2, mr: 1 }}>
                  <Stack
                    direction="row"
                    sx={{ float: 'right', mt: 2 }}
                    spacing={2}
                  >
                    <Button
                      onClick={() => cancelAction()}
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
                      color="success"
                      loading={loading}
                      disabled={!newCategory}
                      onClick={() =>
                        handleChangeCategory(selectedMembers, newCategory!)
                      }
                    >
                      Confirm
                    </LoadingButton>
                  </Stack>
                </DialogActions>
              </ActionModal>
            )}

            {/* DELETE DIALOG  */}
            {selectedMembers.length > 0 && (
              <ActionModal isOpen={isDelOpen} onClose={() => cancelAction()}>
                <DialogTitle id="dialog-title">
                  Are you sure you want to remove the following players?
                </DialogTitle>
                <DialogContent>
                  <DialogContentText>
                    <Typography variant="body2">
                      {selectedMembers.map((member, idx) => (
                        <span key={idx}>
                          {member.name} ({member.tag})
                          <br />
                        </span>
                      ))}
                    </Typography>
                  </DialogContentText>
                </DialogContent>

                <DialogActions sx={{ mb: 2, mr: 1 }}>
                  <Stack
                    direction="row"
                    sx={{ float: 'right', mt: 2 }}
                    spacing={2}
                  >
                    <Button
                      onClick={() => cancelAction()}
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
                      onClick={() => handleRemoveMembers(selectedMembers)}
                    >
                      Confirm
                    </LoadingButton>
                  </Stack>
                </DialogActions>
              </ActionModal>
            )}
          </Fragment>
        )}

        {errors.length > 0 && (
          <ActionModal isOpen={true} onClose={() => setErrors([])}>
            <DialogTitle id="dialog-title">Error</DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="body2">
                  {errors.map((log, idx) => (
                    <span key={idx}>
                      {log} <br />
                    </span>
                  ))}
                </Typography>
              </DialogContentText>
            </DialogContent>

            <DialogActions sx={{ mb: 2, mr: 1 }}>
              <Stack direction="row" sx={{ float: 'right', mt: 2 }} spacing={2}>
                <Button
                  onClick={() => setErrors([])}
                  variant="outlined"
                  color="inherit"
                >
                  Close
                </Button>
              </Stack>
            </DialogActions>
          </ActionModal>
        )}

        {selectedMembers.length > 0 && (
          <ActionBar
            onClick={(action) => {
              if (action === 'remove') setIsDelOpen(true);
              if (action === 'change-roster') setIsRosterSwapOpen(true);
              if (action === 'change-category') setIsCategorySwapOpen(true);
            }}
          />
        )}
      </Container>
    </>
  );
};

function getRosterName(roster: RostersEntity) {
  if (roster.clan) {
    return `${roster.name} (${roster.clan.name})`;
  }
  return roster.name;
}
