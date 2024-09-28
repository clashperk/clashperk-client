export const authCookieKey = 'x-token';

export const authenticatedPaths = [
  '/groups',
  '/expenses',
  '/activity',
  '/account'
];

export const authenticatedPathsRegex = [
  /^\/expenses/,
  /^\/activity/,
  /^\/account/,
  /^\/groups\/?/
];

// make them all in one regex
export const authenticatedPathRegex = new RegExp(
  authenticatedPathsRegex.map((r) => r.source).join('|')
);
