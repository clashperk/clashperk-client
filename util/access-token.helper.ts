'use server';

import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';

export const getAccessToken = async () => {
  const headersList = headers();
  const query = new URLSearchParams(headersList.get('x-search') as string);
  const authToken = query.get('token');

  const decoded = jwt.verify(
    authToken as string,
    process.env.JWT_DECODE_SECRET as string
  ) as {
    guild_id: string;
    user_id: string;
  };

  const token = jwt.sign(
    {
      jti: 'vercel-uid',
      sub: decoded.user_id,
      roles: ['viewer', 'user'],
      version: 'v1'
    },
    process.env.JWT_SECRET_V2 as string,
    {
      expiresIn: '100m'
    }
  );

  return {
    token,
    userId: decoded.user_id,
    guildId: decoded.guild_id,
    isPublicBot: query.get('bot') !== 'custom'
  };
};

export const getSignedToken = async () => {
  const token = jwt.sign(
    { jti: 'vercel-uid', sub: 'vercel-user', roles: ['viewer'], version: 'v1' },
    process.env.JWT_SECRET_V2 as string,
    {
      expiresIn: '1m'
    }
  );

  return {
    token
  };
};
