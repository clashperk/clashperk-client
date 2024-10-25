import { CapitalContributionPage } from '@/app/web/components/CapitalContributionPage';
import { getSignedToken } from '@/util/access-token.helper';
import { NextPage } from 'next';

const Page: NextPage = async () => {
  const result = await getSignedToken();

  return (
    <>
      <CapitalContributionPage {...result} />
    </>
  );
};

export default Page;
