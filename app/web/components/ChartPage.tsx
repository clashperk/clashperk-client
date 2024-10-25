'use client';

import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
  Tooltip
} from 'chart.js';
import 'chartjs-adapter-moment';
import Head from 'next/head';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  PointElement,
  LineElement,
  TimeScale
);

const colors = [
  '#266ef7',
  '#c63304',
  '#ffc107',
  '#50c878',
  '#ffac75',
  '#4dc1fa',
  '#cb5aff',
  '#808000',
  '#C9CBCF',
  '#FF6384',
  //
  '#3A87AD',
  '#F79256',
  '#8DC2E9',
  '#D1AED2',
  '#62C370',
  '#E36F8A',
  '#A4BF96',
  '#F0D96B',
  '#4F576C',
  '#B94C4C',
  '#5E7D7D',
  '#9A59B5',
  '#7EC08C',
  '#E39C4A',
  '#31859B',
  '#C58A6D',
  '#6D4D9E',
  '#92A1CF',
  '#C1B07E',
  '#486E76'
];

const randomNum = () => Math.floor(Math.random() * (235 - 52 + 1) + 52);
const randomRGB = () => `rgb(${randomNum()}, ${randomNum()}, ${randomNum()})`;

export const ChartPage = ({
  labels,
  datasets,
  unit,
  offset = 0,
  title,
  desktopOnly
}: {
  id: string;
  unit: string;
  offset: number;
  title: string;
  labels: string[];
  desktopOnly: boolean;
  datasets: { name: string; data: number[] }[];
}) => {
  return (
    <>
      {desktopOnly && (
        <Head>
          <meta name="viewport" content="width=1200" />
        </Head>
      )}

      <Line
        style={{ background: 'white' }}
        options={{
          spanGaps: unit === 'hour' ? 6 * 60 * 60 * 1000 : false,
          interaction: {
            mode: 'nearest'
          },
          responsive: true,
          elements: {
            point: {
              radius: 0,
              borderColor: '#5572AA',
              backgroundColor: '#5572AA'
            },
            line: {
              backgroundColor: '#7296DC',
              borderColor: '#7296DC'
            }
          },
          scales: {
            x: {
              display: true,
              ticks: {
                color: '#000000',
                autoSkip: false,
                maxRotation: 0,
                major: {
                  enabled: unit === 'hour'
                },
                maxTicksLimit:
                  labels.length >= 24 ? labels.length / 2 : labels.length,
                font: function (context) {
                  if (context.tick && context.tick.major)
                    return { weight: 'bold' };
                }
              },
              grid: {
                display: true
              },
              type: 'time',
              time: {
                unit: (unit || 'hour') as 'hour' | 'day',
                parser: function (ts) {
                  return new Date(ts as string).getTime() - offset;
                }
              }
            },
            y: {
              display: true,
              ticks: {
                // count: 10,
                color: '#000000',
                precision: 0
              },
              border: {
                display: false
              },
              grid: {
                display: true
              }
            },
            y1: {
              display: true,
              position: 'right',
              ticks: {
                callback: function (value) {
                  return `${value} ${unit}`;
                }
              },
              afterDataLimits: function (axis) {
                const y = axis.chart.scales.y;
                y.determineDataLimits(); // update y.min/max
                axis.min = y.min;
                axis.max = y.max;
              }
            }
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                font: {
                  size: 14
                },
                boxWidth: 14,
                padding: 4
              },
              fullSize: true
            },
            title: {
              position: 'top',
              display: true,
              padding: 3,
              text: title
            },
            tooltip: {
              displayColors: false
            }
          }
        }}
        title={title}
        data={{
          labels: labels,
          datasets: datasets.slice(0, 20).map((data, idx) => {
            const color = colors[idx] || randomRGB();
            return {
              ...data,
              label: data.name,
              tension: 0.1,
              cubicInterpolationMode: 'monotone',
              backgroundColor: color,
              borderColor: color,
              borderWidth: 4,
              pointBorderColor: color,
              pointBackgroundColor: color,
              pointRadius: 2
            };
          })
        }}
      />
    </>
  );
};
