import StarIcon from '@mui/icons-material/Star';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { getStars } from './Stars';

interface WarHistory {
  id: number;
  warType: number;
  startTime: string;
  endTime: string;
  clan: {
    name: string;
    tag: string;
  };
  opponent: {
    name: string;
    tag: string;
  };
  attacker: {
    name: string;
    tag: string;
    townhallLevel: number;
    mapPosition: number;
  };
  attacks: {
    stars: number;
    oldStars: number;
    defenderTag: string;
    destructionPercentage: number;
    defender: {
      tag: string;
      townhallLevel: number;
      mapPosition: number;
    };
  }[];
}

interface Summary {
  season: string;
  wars: number;
  rounds: number;
  stars: number;
  attacks: number;
  missed: number;
  destruction: number;
}

export default function History({
  wars,
  attacker,
  summary
}: {
  wars: WarHistory[];
  attacker: WarHistory['attacker'];
  summary: Summary[];
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        mx: { md: 1 },
        padding: 1,
        minHeight: '100vh',
        flexShrink: 0,
        background: '#2F3136',
        borderRadius: '4px 4px 4px 4px'
        // borderLeft: `4px solid #5865f2`,
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="start"
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography
            sx={{
              textDecoration: 'none',
              color: '#00b0f4',
              fontWeight: 'bold'
            }}
          >
            {`${attacker.name} (${attacker.tag})`}
          </Typography>
        </Stack>
        <Avatar
          sx={{ width: 40, height: 40 }}
          src={`https://coc.guide/static/imgs/other/town-hall-${attacker.townhallLevel}${
            attacker.townhallLevel > 12 ? `-5` : ''
          }.png`}
          variant="square"
        />
      </Stack>
      <Table aria-label="table">
        <TableBody>
          {wars.map((row, index) => (
            <TableRow
              key={row.id}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                '& td': { border: 0 },
                ...(index === wars.length - 1
                  ? {}
                  : { borderBottom: '0.5px solid #dcddde' })
              }}
            >
              <TableCell align="left" sx={{ p: 0.5 }} width={0}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#dcddde',
                    fontSize: { xs: '10px', md: '12px' }
                  }}
                >
                  {row.clan.name} vs {row.opponent.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#dcddde',
                    fontSize: { xs: '8px', md: '12px' }
                  }}
                >
                  <span
                    style={{
                      color: row.warType === 2 ? 'gold' : '#1DA1F2',
                      fontWeight: 600
                    }}
                  >
                    {row.warType === 3
                      ? 'CWL'
                      : row.warType === 2
                        ? 'Friendly'
                        : null}
                  </span>
                  <span>
                    {' '}
                    {moment(new Date(row.startTime)).format('D MMM YYYY')}
                  </span>
                </Typography>
              </TableCell>

              <TableCell sx={{ p: 0.5 }} width={2} align="right">
                {row.attacks.map((atk, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    sx={{
                      color: '#1DA1F2',
                      fontSize: { xs: '10px', md: '10px' }
                    }}
                  >
                    {row.attacker.mapPosition}
                  </Typography>
                ))}
              </TableCell>

              <TableCell sx={{ p: 0 }} width={2} align="right">
                {row.attacks.map((atk, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    sx={{
                      color: '#F98D0F',
                      fontSize: { xs: '10px', md: '10px' }
                    }}
                  >
                    {row.attacker.townhallLevel}
                  </Typography>
                ))}
              </TableCell>

              <TableCell sx={{ p: 0.5 }} width={2} align="right">
                {row.attacks!.map((atk) => (
                  <Stack key={1} direction="row">
                    {getStars(atk.oldStars, atk.stars)}
                  </Stack>
                ))}
              </TableCell>

              <TableCell sx={{ p: 0.5 }} width={2} align="right">
                {row.attacks!.map((atk, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    sx={{ color: '#dcddde', fontSize: '10px' }}
                  >
                    {atk.destructionPercentage.toFixed(0)}%
                  </Typography>
                ))}
              </TableCell>

              <TableCell sx={{ p: 0.5 }} width={2} align="right">
                <Typography
                  variant="body2"
                  sx={{ color: 'red', fontSize: '10px' }}
                >
                  {row.attacks.length > 0 ? 'v' : null}
                </Typography>
              </TableCell>

              <TableCell sx={{ p: 0.5 }} width={2} align="right">
                {row.attacks!.map((atk, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    sx={{ color: '#1DA1F2', fontSize: '10px' }}
                  >
                    {atk.defender.mapPosition}
                  </Typography>
                ))}
              </TableCell>

              <TableCell sx={{ p: 0.5 }} width={2} align="right">
                {row.attacks!.map((atk, i) => (
                  <Typography
                    key={i}
                    variant="body2"
                    sx={{ color: '#F98D0F', fontSize: '10px' }}
                  >
                    {atk.defender.townhallLevel}
                  </Typography>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {summary.length > 0 && (
        <>
          <Stack direction="row" justifyContent="center">
            <Typography
              sx={{
                // textDecoration: "none",
                color: '#00b0f4',
                fontWeight: 700
              }}
            >
              CWL Summary
            </Typography>
          </Stack>
          <Table aria-label="table">
            <TableHead>
              <TableRow>
                <TableCell align="left" sx={{ p: 0.5 }} width={0}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#dcddde',
                      fontSize: { xs: '10px', md: '12px' }
                    }}
                  >
                    Season
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
                    Star
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
                    Destruction
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
                    Missed
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
                    Wars
                  </Typography>
                </TableCell>
                {/* <TableCell align="right" sx={{ p: 0.5, pr: 0 }} width={2}>
                  <Typography variant="body2" sx={{ color: "#dcddde", fontSize: { xs: "10px", md: "12px" } }}>
                    Wars
                  </Typography>
                </TableCell> */}
              </TableRow>
            </TableHead>
            <TableBody>
              {summary.map((row, n) => (
                <TableRow
                  key={n}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '& td': { border: 0 },
                    ...(n === summary.length - 1
                      ? {}
                      : { borderBottom: '0.5px solid #dcddde' })
                  }}
                >
                  <TableCell align="left" sx={{ p: 0.5 }} width={0}>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#dcddde',
                        fontSize: { xs: '10px', md: '12px' }
                      }}
                    >
                      {moment(row.season).format('MMMM YYYY')}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ p: 0.5 }} width={2} align="right">
                    <Stack direction="row" spacing={0.1}>
                      <StarIcon
                        sx={{
                          color: '#dcddde',
                          width: 14,
                          height: 14,
                          opacity: 0.59
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: '#dcddde', fontSize: '10px' }}
                      >
                        {row.stars}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ p: 0.5 }} width={2} align="right">
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ color: '#dcddde', fontSize: '12px' }}
                    >
                      {row.destruction.toFixed(0)}%
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ p: 0.5 }} width={2} align="right">
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        color: row.missed > 0 ? 'red' : '#dcddde',
                        fontSize: '12px'
                      }}
                    >
                      {row.missed}
                    </Typography>
                  </TableCell>

                  <TableCell sx={{ p: 0.5 }} width={2} align="right">
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ color: '#1DA1F2', fontSize: '12px' }}
                    >
                      {row.wars}
                    </Typography>
                  </TableCell>

                  {/* <TableCell sx={{ p: 0.5 }} width={2} align="right">
                    <Typography variant="body2" noWrap sx={{ color: "#F98D0F", fontSize: "12px" }}>
                      {`${row.wars}`}
                    </Typography>
                  </TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </Paper>
  );
}

export const fakeWar = Array.from({ length: 50 }).map((_, index) => {
  const oldStars = Math.floor(Math.random() * 3);
  const newStars = Math.floor(Math.random() * 3);
  const percentage = Math.floor(Math.random() * 100);

  return {
    oldStars,
    newStars,
    percentage,
    townHall: Math.floor(Math.random() * 5) + 10,
    opponent: {
      townHall: Math.floor(Math.random() * 5) + 10,
      index: Math.floor(Math.random() * 50)
    }
  };
});

// export const fakeRounds = Array.from({ length: 10 }).map((_, index) => {
//   // generate random name
//   const name = Math.random().toString(36).substring(7);
//   return {
//     name: "Air Hounds vs War Snippers",
//     date: "10/10/2022",
//     index: Math.floor(Math.random() * 50),
//     war: fakeWar,
//   };
// });
