/* eslint-disable react/no-unescaped-entities */
import Container from '@mui/material/Container';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Fragment } from 'react';
import { DocProps } from '../privacy/page';

const docs: DocProps[] = [
  {
    section: '',
    description:
      "Welcome to ClashPerk! These terms of service ('Terms') govern your use of the ClashPerk Discord bot ('the Bot'). By using the Bot, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use the Bot."
  },
  {
    section: 'Use of the Bot',
    uses: [
      "You must comply with Discord's Terms of Service and Community Guidelines in addition to these Terms.",
      'You may use the Bot only for lawful purposes and in accordance with these Terms and any applicable laws and regulations.'
    ]
  },
  {
    section: 'License',
    description:
      'ClashPerk grants you a non-exclusive, non-transferable, revocable license to use the Bot in Discord servers that you own or have the necessary permissions to add the Bot to.'
  },
  {
    section: 'Prohibited Activities',
    description: 'You agree not to:',
    uses: [
      'Engage in massive spamming, including but not limited to the repetitive posting of messages or commands that disrupt the normal functioning of the Bot or Discord servers.'
    ]
  },
  {
    section: 'Changes to Terms',
    description:
      "ClashPerk reserves the right to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice before any new terms take effect."
  },
  {
    section: 'Termination',
    description:
      'ClashPerk may terminate or suspend your access to the Bot immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms.'
  },
  {
    section: 'Contact Us',
    description:
      'If you have any questions about these Terms, please contact us at',
    contact_link: 'https://discord.gg/clashperk-support-509784317598105619'
  },
  {
    section: 'Agreement',
    description: 'By using the ClashPerk Discord bot, you agree to these Terms.'
  }
];

const Terms = () => {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Stack direction="column" spacing={1}>
        <Typography variant="h4" fontWeight="bold">
          Terms of Service
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          Last Updated: July 30, 2024
        </Typography>

        {docs.map((doc, index) => (
          <Stack key={index} direction="column" spacing={1}>
            <Typography variant="h5" mt={1} fontWeight="bold">
              {doc.section}
            </Typography>

            {doc.description && (
              <Typography paragraph color="textSecondary">
                {doc.description}{' '}
                {doc.contact_link && (
                  <span>
                    <a
                      href={doc.contact_link}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#346ddb' }}
                    >
                      discord.gg/clashperk
                    </a>
                  </span>
                )}{' '}
              </Typography>
            )}

            {doc.details && (
              <ListItem dense component="li">
                <Stack direction="column" spacing={0}>
                  {doc.details.map((detail, index) => (
                    <Fragment key={index}>
                      <Typography variant="body1" fontWeight="bold">
                        {detail.type}
                      </Typography>
                      <Typography mb={0.5} paragraph color="textSecondary">
                        {detail.description}
                      </Typography>
                    </Fragment>
                  ))}
                </Stack>
              </ListItem>
            )}

            {doc.uses && (
              <ul style={{ paddingLeft: 30, color: '#ffffffb3' }}>
                {doc.uses.map((use, idx) => (
                  <li key={idx}>
                    <Typography m={0} paragraph color="textSecondary">
                      {use}
                    </Typography>
                  </li>
                ))}
              </ul>
            )}
          </Stack>
        ))}
      </Stack>
    </Container>
  );
};

export default Terms;
