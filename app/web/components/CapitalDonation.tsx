import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import 'moment-duration-format';

interface Logs {
  name: string;
  tag: string;
  season: string;
  initial: number;
  current: number;
  clan: { name: string; tag: string };
  createdAt: string;
}

export default function CapitalDonation({ logs }: { logs: Logs[] }) {
  const clan = logs[0]?.clan;
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
            {`${clan.name} (${clan.tag})`} | Capital Contribution Logs (last 10
            days)
          </Typography>
        </Stack>
      </Stack>
      <Table aria-label="table">
        <TableBody>
          {logs.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                '& td': { border: 0 },
                ...(index === logs.length - 1
                  ? {}
                  : { borderBottom: '0.5px solid #dcddde' })
              }}
            >
              <TableCell align="left" sx={{ p: 0.5 }} width={0}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#dcddde',
                    fontSize: { xs: '12px', md: '12px', fontWeight: 'bold' }
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
                  {/* <span style={{ color: row.warType === 2 ? "gold" : "#1DA1F2", fontWeight: 600 }}>
                      {row.warType === 3 ? "CWL" : row.warType === 2 ? "Friendly" : null}
                    </span> */}
                  <span>
                    {' '}
                    {moment
                      .duration(Date.now() - new Date(row.createdAt).getTime())
                      .format('d[d] h[h] m[m]', { trim: 'both mid' })}{' '}
                    ago
                  </span>
                </Typography>
              </TableCell>

              <TableCell sx={{ p: 0.5 }} width={2} align="right">
                <Typography
                  variant="body2"
                  sx={{
                    color: '#1DA1F2',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {row.current - row.initial}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
