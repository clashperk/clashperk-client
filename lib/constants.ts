export const authCookieKey = 'x-token';

export const authenticatedPaths = [
  '/clans',
  '/embeds',
  '/reminders',
  '/rosters'
];

export const authenticatedPathsRegex = [
  /^\/clans/,
  /^\/embeds/,
  /^\/reminders/,
  /^\/rosters\/?/
];

export const authenticatedPathRegex = new RegExp(
  authenticatedPathsRegex.map((route) => route.source).join('|')
);
