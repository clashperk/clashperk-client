import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { LinksPage } from './components/LinksPage';

const getServerSideProps = async () => {
  const headersList = headers();
  const query = new URLSearchParams(headersList.get('x-search') as string);
  const authToken = query.get('token');

  try {
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
  } catch (e) {
    console.error(e);
    return redirect('/expired');
  }
};

export default async function Links() {
  const { guildId, userId, token, isPublicBot } = await getServerSideProps();
  return (
    <LinksPage
      guildId={guildId}
      isPublicBot={isPublicBot}
      token={token}
      userId={userId}
    />
  );
}
