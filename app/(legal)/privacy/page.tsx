/* eslint-disable react/no-unescaped-entities */
import Container from '@mui/material/Container';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Fragment } from 'react';

const docs: DocProps[] = [
  {
    section: '',
    description:
      "ClashPerk ('we', 'us', 'our') operates the ClashPerk Discord bot ('the Bot'). This Privacy Policy outlines how we collect, use, and disclose information from users ('you', 'your') of the Bot."
  },
  {
    section: 'Information We Collect',
    details: [
      {
        type: 'User-Provided Information',
        description:
          'We may collect and store the information you provide when interacting with the Bot, such as Discord user IDs, server IDs, and Channel IDs.'
      },
      {
        type: 'In-game Data',
        description:
          'We collect information through the Clash of Clans API, which includes your game performance and statistics.'
      },
      {
        type: 'Automatically Collected Information',
        description:
          'We may collect certain information automatically, including usage details.'
      }
    ]
  },
  {
    section: 'Use of Information',
    description: 'We may use the information we collect to:',
    uses: [
      'Provide and maintain the Bot and its features',
      'Improve, personalize, and optimize the Bot',
      'Respond to your inquiries, support requests, and feedback',
      'Communicate with you about updates, news, and other information related to the Bot'
    ]
  },
  {
    section: 'Disclosure of Information',
    description: 'We may disclose your information:',
    uses: [
      'To comply with applicable laws, regulations, legal processes, or government requests',
      'To enforce our Terms of Service or protect our rights, property, or safety, or the rights, property, or safety of others'
    ]
  },
  {
    section: 'Security',
    description:
      'We implement a variety of security measures to safeguard the information we collect. However, no method of transmission over the Internet or electronic storage is completely secure, so we cannot guarantee absolute security.'
  },
  {
    section: 'User Rights',
    description:
      'You have the right to request the deletion of your personal information that we have collected and stored. To request the deletion of your data, please contact us.'
  },
  {
    section: 'Changes to This Privacy Policy',
    description:
      'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.'
  },
  {
    section: 'Contact Us',
    description:
      'If you have any questions about this Privacy Policy, please contact us at',
    contact_link: 'https://discord.gg/clashperk-support-509784317598105619'
  },
  {
    section: 'Agreement',
    description:
      'By using the ClashPerk Discord bot, you agree to the terms of this Privacy Policy.'
  }
];

export interface DocProps {
  section: string;
  description?: string;
  details?: { type: string; description: string }[];
  uses?: string[];
  contact_link?: string;
}

const Privacy = () => {
  return (
    <Container maxWidth="md" sx={{ py: 5 }}>
      <Stack direction="column" spacing={1}>
        <Typography variant="h4" fontWeight="bold">
          Privacy Policy
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
              <Typography paragraph color="text.secondary">
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
                      <Typography mb={0.5} paragraph color="text.secondary">
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
                    <Typography m={0} paragraph color="text.secondary">
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

export default Privacy;
