'use client';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

const navigationItems = [
  {
    value: '/clans',
    label: 'Clans',
    icon: <PeopleAltIcon />
  },
  {
    value: '/rosters',
    label: 'Rosters',
    icon: <AttachMoneyIcon />
  },
  {
    value: '/reminders',
    label: 'Reminders',
    icon: <ReceiptLongIcon />
  },
  {
    value: '/logs',
    label: 'Logs',
    icon: <ManageAccountsIcon />
  }
];

export default function BottomNav() {
  const _pathname = usePathname();
  const { id } = useParams();

  const pathname = _pathname === `/clans/${id}` ? '/clans' : _pathname;

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: { sm: 65, md: 55 }
      }}
      elevation={2}
    >
      <Container maxWidth="xs" style={{ padding: 0 }}>
        <BottomNavigation showLabels value={pathname}>
          {navigationItems.map((item, idx) => (
            <BottomNavigationAction
              key={idx}
              value={item.value}
              label={item.label}
              href={item.value}
              LinkComponent={Link}
              icon={item.icon}
            />
          ))}
        </BottomNavigation>
      </Container>
    </Paper>
  );
}
