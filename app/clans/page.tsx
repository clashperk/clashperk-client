import { getAccessToken } from '@/util/access-token.helper';
import { NextPage } from 'next';
import { ClansPage } from './components/ClansPage';

const Page: NextPage = async () => {
  const result = await getAccessToken();

  return (
    <>
      <ClansPage {...result} />
    </>
  );
};

export default Page;
