export const authCookieKey = 'x-token';

export const authenticatedPaths = ['/embeds', '/reminders'];

export const authenticatedPathsRegex = [/^\/embeds/, /^\/reminders/];

export const authenticatedPathRegex = new RegExp(
  authenticatedPathsRegex.map((route) => route.source).join('|')
);
