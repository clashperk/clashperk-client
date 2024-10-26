import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { getStars } from './Stars';

interface ClanWar {
  endTime: string;
  result: string;
  clan: {
    stars: number;
    destructionPercentage: number;
    name: string;
    tag: string;
    members: {
      name: string;
      tag: string;
      mapPosition: number;
      townhallLevel: number;
      attacks: {
        stars: number;
        oldStars: number;
        destructionPercentage: number;
        order: number;
        defender: {
          name: string;
          tag: string;
          mapPosition: number;
          townhallLevel: number;
        };
      }[];
      defenses: {
        stars: number;
        destructionPercentage: number;
        order: number;
        defender: {
          name: string;
          tag: string;
          mapPosition: number;
          townhallLevel: number;
        };
      }[];
    }[];
  };
  opponent: {
    name: string;
    tag: string;
  };
}

export function AttackLog({ data }: { data: ClanWar }) {
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
        sx={{ mb: 1 }}
      >
        <Stack direction="column" spacing={0} alignItems="start">
          <Typography
            variant="body2"
            sx={{
              textDecoration: 'none',
              color: '#00b0f4',
              fontWeight: 'bold'
            }}
          >
            {data.clan.name} vs {data.opponent.name}
          </Typography>

          <Typography variant="body2" sx={{ color: '#dcddde' }}>
            {data.clan.stars} stars,{' '}
            {data.clan.destructionPercentage.toFixed(2)}% destruction (
            {data.result}) | {moment(data.endTime).format('D MMM YYYY')}
          </Typography>
        </Stack>

        <Avatar
          sx={{ width: 40, height: 40 }}
          src={
            'https://api-assets.clashofclans.com/badges/70/qmdmwrz9RtctdUgDml9qFoy7IZ2e0XQuLLssf25eLt8.png'
          }
          variant="square"
        />
      </Stack>

      <Table aria-label="table">
        <TableBody>
          {data.clan.members.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                '& td': { border: 0 },
                ...(index === data.clan.members.length - 1
                  ? {}
                  : { borderBottom: '0.5px solid #dcddde' })
              }}
            >
              <TableCell sx={{ p: 0.5 }} width={2} align="right">
                <Typography
                  variant="body2"
                  sx={{
                    color: '#1DA1F2',
                    fontSize: { xs: '10px', md: '12px' }
                  }}
                >
                  {row.mapPosition}
                </Typography>
              </TableCell>

              <TableCell sx={{ p: 0.5 }} width={2} align="right">
                <Typography
                  variant="body2"
                  sx={{
                    color: '#F98D0F',
                    fontSize: { xs: '10px', md: '12px' }
                  }}
                >
                  {row.townhallLevel}
                </Typography>
              </TableCell>

              <TableCell align="left" sx={{ p: 0.5, pl: 1 }} width={0}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#dcddde',
                    fontSize: { xs: '10px', md: '12px' }
                  }}
                >
                  {row.name}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#dcddde',
                    fontSize: { xs: '10px', md: '12px' }
                  }}
                >
                  <span> {row.tag}</span>
                </Typography>
              </TableCell>

              <TableCell sx={{ p: 0.5 }} width={2} align="right">
                {(row.attacks ?? []).map((atk, n) => (
                  <Stack key={n} direction="row">
                    {getStars(atk.oldStars, atk.stars)}
                  </Stack>
                ))}
              </TableCell>

              <TableCell sx={{ p: 0.5 }} width={2} align="right">
                {row.attacks!.map((atk, n) => (
                  <Typography
                    key={n}
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
                  sx={{ color: '#dcddde', fontSize: '10px' }}
                >
                  {row.attacks.length > 0 ? 'v' : ''}
                </Typography>
              </TableCell>

              <TableCell sx={{ p: 0.5 }} width={2} align="right">
                {row.attacks!.map((atk, n) => (
                  <Typography
                    key={n}
                    variant="body2"
                    sx={{ color: '#1DA1F2', fontSize: '10px' }}
                  >
                    {atk.defender.mapPosition}
                  </Typography>
                ))}
              </TableCell>

              <TableCell sx={{ p: 0.5 }} width={2} align="right">
                {row.attacks!.map((atk, n) => (
                  <Typography
                    key={n}
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
    </Paper>
  );
}
