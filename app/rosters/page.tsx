import jwt from 'jsonwebtoken';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { RostersPage } from './components/RostersPage';

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
      guildId: decoded.guild_id,
      userId: decoded.user_id
    };
  } catch (e) {
    console.error(e);
    return redirect('/expired');
  }
};

export default async function Rosters() {
  const { guildId, userId, token } = await getServerSideProps();
  return <RostersPage guildId={guildId} userId={userId} token={token} />;
}
