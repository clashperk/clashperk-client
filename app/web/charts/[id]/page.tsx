import { NextPage } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ChartPage } from '../../components/ChartPage';

const Page: NextPage = async () => {
  const headersList = headers();
  const query = new URLSearchParams(headersList.get('x-search') as string);
  const chartId = (headersList.get('x-pathname') as string)
    .split('/')
    .at(-1) as string;

  const res = await fetch(`https://chart.clashperk.com/${chartId}/json`);
  const data = await res.json();

  if (!res.ok) {
    return notFound();
  }

  return (
    <>
      <ChartPage
        {...{
          ...data,
          title: data.title.replace(/\(.*\)/, '').trim(),
          id: chartId,
          desktopOnly: query.get('device') !== 'mobile'
        }}
      />
    </>
  );
};

export default Page;
