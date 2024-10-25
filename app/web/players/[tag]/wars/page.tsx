import { PlayerPage } from '@/app/web/components/PlayerPage';
import { getSignedToken } from '@/util/access-token.helper';
import { NextPage } from 'next';

const Page: NextPage = async () => {
  const result = await getSignedToken();

  return (
    <>
      <PlayerPage {...result} />
    </>
  );
};

export default Page;
