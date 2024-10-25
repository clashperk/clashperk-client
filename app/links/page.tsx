import { getAccessToken } from '@/util/access-token.helper';
import { NextPage } from 'next';
import { LinksPage } from './components/LinksPage';

const Page: NextPage = async () => {
  const { guildId, userId, token, isPublicBot } = await getAccessToken();
  return (
    <LinksPage
      guildId={guildId}
      isPublicBot={isPublicBot}
      token={token}
      userId={userId}
    />
  );
};

export default Page;
