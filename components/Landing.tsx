'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Icon from '@mui/material/Icon';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import {
  FaAward,
  FaBolt,
  FaDiscord,
  FaFileExcel,
  FaGithub,
  FaRss,
  FaSearch,
  FaTrophy,
  FaUserCheck
} from 'react-icons/fa';
import { FiActivity } from 'react-icons/fi';

export const FEATURES = [
  {
    icon: FaSearch,
    title: 'Clash Search',
    description:
      'Search Players, Clans, Wars, CWL, Clan Capital, Clan Games or anything you can imagine.'
  },
  {
    icon: FaRss,
    title: 'Clan Feed',
    description:
      'See when Players Join or Leave, Donate or Receive Troops, Upgrades Town Hall, and more.'
  },
  {
    icon: FaAward,
    title: 'Best Players',
    description:
      'Top Donations, Heroes, Trophies, Clan Games, Clan Capital, Legend League Attacks and more.'
  },
  {
    icon: FaTrophy,
    title: 'War and CWL',
    description:
      'CWL, War Log, Missed Attacks, Attack History, Advanced Roster Management and more.'
  },
  {
    icon: FiActivity,
    title: 'Clan Activity',
    description:
      'Most Active/Inactive Members, Last Seen, Activity Score, Advanced Historical data and more.'
  },
  {
    icon: FaFileExcel,
    title: 'Google Sheet Export',
    description:
      'Export Clan Members, Season Stats, CWL, Wars, Missed Attacks, and Historical into Google Sheet'
  },
  {
    icon: FaUserCheck,
    title: 'Personalized Bot',
    description:
      'Customize your bot by changing its avatar and name while utilizing the power of ClashPerk'
  },
  {
    icon: FaBolt,
    title: 'User Friendly and Stable',
    description: 'No Complex Setup. Stable and Always Online.'
  }
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Intro />
      <Features />
      <Footer />
    </>
  );
}

const Navbar = () => {
  return (
    <>
      <Paper sx={{ width: '100%' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ py: 2, px: { xs: 2, md: 20 } }}
        >
          <Stack
            direction="row"
            spacing={3}
            alignItems="center"
            alignContent="center"
          >
            <Typography
              variant="h5"
              fontWeight="600"
              component={Link}
              href="/"
              sx={{ textDecoration: 'none' }}
            >
              CLASHPERK
            </Typography>

            <Typography
              component={Link}
              href="https://docs.clashperk.com"
              target="_blank"
              variant="h6"
              fontWeight="600"
              color="textSecondary"
              sx={{
                textDecoration: 'none',
                display: { xs: 'none', md: 'flex' }
              }}
            >
              Guide
            </Typography>
          </Stack>

          <Typography
            variant="h6"
            fontWeight="600"
            color="textSecondary"
            component={Link}
            href="https://discord.gg/ppuppun"
            target="_blank"
            sx={{ textDecoration: 'none' }}
          >
            Discord
          </Typography>
        </Stack>
      </Paper>
    </>
  );
};

const Intro = () => {
  return (
    <Box sx={{ background: '#23272A' }}>
      <Container
        maxWidth="lg"
        sx={{
          minHeight: 'calc(100vh - 64px)',
          marginTop: '64px',
          alignItems: 'center',
          display: 'flex'
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{ textAlign: { xs: 'center', md: 'center' } }}
        >
          <Grid item xs={12} md={12} lg={12}>
            <Typography
              variant="h1"
              fontWeight="600"
              sx={{
                mb: { xs: 2, sm: 4 },
                color: 'white',
                fontSize: { xs: '2rem', md: '3.5rem' }
              }}
            >
              BUILD THE BEST DISCORD COMMUNITY
            </Typography>
            <Typography
              variant="h2"
              sx={{
                mt: 1,
                mb: { xs: 2, sm: 4 },
                fontWeight: '200',
                color: 'textSecondary',
                fontSize: { xs: '1.25rem', md: '1.75rem' }
              }}
            >
              Feature-Rich and Powerful Clash of Clans Discord bot with
              everything you will ever need.
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                color="primary"
                size="large"
                href="https://clashperk.com/invite"
                target="_blank"
                sx={{
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: 300
                }}
              >
                Add to Discord
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const Features = () => {
  return (
    <Box sx={{ background: '#1d1e22' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
        <Typography
          variant="h3"
          sx={{
            mt: 1,
            mb: { xs: 2, sm: 4, md: 6 },
            textAlign: 'center',
            fontWeight: 'bold'
          }}
        >
          FEATURES
        </Typography>

        <Grid container spacing={2}>
          {FEATURES.map(({ icon, title, description }) => (
            <Grid key={title} item xs={12} sm={6} md={3}>
              <Box sx={{ padding: 2, height: '100%' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Icon
                    sx={{
                      textAlign: 'center',
                      height: { xs: 100, md: 120 },
                      width: { xs: 100, md: 120 },
                      fontWeight: 'bold',
                      color: 'GrayText'
                    }}
                    component={icon}
                  />
                </Box>
                <Typography
                  sx={{ textAlign: 'center', mb: 1 }}
                  fontWeight={400}
                  variant="h4"
                  color="text.primary"
                >
                  {title.toUpperCase()}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ textAlign: 'center' }}
                >
                  {description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

const Footer = () => {
  return (
    <>
      <Paper sx={{ width: '100%' }}>
        <Stack
          alignItems="center"
          direction={{ md: 'row', xs: 'column-reverse' }}
          justifyContent={{ md: 'space-between', xs: 'center' }}
          sx={{ py: 2, px: { xs: 2, md: 20 } }}
        >
          <Typography color="textSecondary">
            {`Copyright © ClashPerk 2019-${new Date().getFullYear()}`}
          </Typography>

          <Stack direction="row" spacing={2}>
            <Typography
              color="textSecondary"
              component={Link}
              target="_blank"
              href={'https://github.com/clashperk'}
              style={{ textDecoration: 'none' }}
            >
              <Stack direction="row" spacing={1}>
                <Icon component={FaGithub} />
                <span style={{ verticalAlign: 'middle' }}>GitHub</span>
              </Stack>
            </Typography>

            <Typography
              color="textSecondary"
              component={Link}
              href={'https://discord.gg/ppuppun'}
              target="_blank"
              style={{ textDecoration: 'none' }}
            >
              <Stack direction="row" spacing={1}>
                <Icon component={FaDiscord} />
                <span style={{ verticalAlign: 'middle' }}>Discord</span>
              </Stack>
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </>
  );
};
