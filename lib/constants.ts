export const authCookieKey = 'x-token';

export const authenticatedPaths = ['/embeds', '/reminders', '/rosters'];

export const authenticatedPathsRegex = [
  /^\/embeds/,
  /^\/reminders/,
  /^\/rosters\/?/
];

export const authenticatedPathRegex = new RegExp(
  authenticatedPathsRegex.map((route) => route.source).join('|')
);
