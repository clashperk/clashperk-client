import { AttackLogPage } from '@/app/web/components/AttackLogPage';
import { getSignedToken } from '@/util/access-token.helper';
import { NextPage } from 'next';

const Page: NextPage = async () => {
  const result = await getSignedToken();

  return (
    <>
      <AttackLogPage {...result} />
    </>
  );
};

export default Page;
