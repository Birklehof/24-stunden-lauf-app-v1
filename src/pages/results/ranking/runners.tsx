import React from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../../components/layout';
import { prisma } from '../../../../prisma';
import { Runner } from '@prisma/client';

interface RunnerWithLapCount extends Runner {
  _count: {
    laps: number;
  };
}

const timezoneHoursOffset = parseInt(process.env.TIMEZONE_HOURS_OFFSET || '0');

export async function getStaticProps(_context: any) {
  let runners = await prisma.runner.findMany({
    include: {
      _count: {
        select: {
          laps: true
        }
      }
    },
    orderBy: [
      {
        laps: {
          _count: 'desc'
        }
      },
      {
        lastName: 'asc'
      },
      {
        firstName: 'asc'
      }
    ]
  });
  runners = JSON.parse(JSON.stringify(runners));
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + timezoneHoursOffset);
  const formattedCurrentDate = currentDate.toLocaleDateString('de') + ' ' + currentDate.toLocaleTimeString('de');
  return { props: { runners, formattedCurrentDate }, revalidate: 60 };
}

export default function LeaderbordPage({
  runners,
  formattedCurrentDate
}: {
  runners: RunnerWithLapCount[];
  formattedCurrentDate: string;
}) {
  const { status } = useSession();
  const loading = status === 'loading';

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  // Make sure runners has a least three elements
  if (runners.length < 3) {
    for (let i = 0; i <= 2; i++) {
      if (!runners[i]) {
        runners[i] = {
          number: i,
          studentNumber: 0,
          firstName: 'Niemand',
          lastName: '',
          house: '',
          grade: '',
          _count: {
            laps: 0
          }
        };
      }
    }
  }

  return (
    <Layout>
      <div className="w-11/12 max-w-lg">
        <div className="flex flex-col w-full">
          <div className="flex flex-col gap-4">
            {runners &&
              [runners[0], runners[1], runners[2]].map((runner: RunnerWithLapCount, index: number) => (
                <div
                  key={index}
                  className="w-full stats grow shadow-lg first:h-40 first:z-36 z-10 last:z-0 h-32 last:h-28 text-[#d4af37] first:text-[#c0c0c0] last:text-[#bf8970]"
                >
                  <div className="stat place-items-center">
                    <div className="stat-title text-black">
                      {runner.firstName} {runner.lastName} ({runner.number})
                    </div>
                    <div className="stat-value">{runners.indexOf(runner) + 1}</div>
                    <div className="stat-desc text-black">
                      {runner._count.laps} {runner._count.laps === 1 ? 'Runde' : 'Runden'}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="divider"></div>
          <div className="flex flex-col">
            {runners &&
              runners.slice(3).map((runner: RunnerWithLapCount, index: number) => (
                <div
                  key={index}
                  className="bg-white shadow-md rounded-full w-full mb-2 flex flex-row justify-between items-center p-1"
                >
                  <a className="btn btn-circle btn-outline btn-primary cursor-default">{index + 4}</a>
                  <div>
                    {runner.firstName} {runner.lastName} ({runner.number})
                  </div>
                  <div className="font-bold px-4">
                    {runner._count.laps}{' '}
                    <span className="hidden sm:inline">{runner._count.laps === 1 ? 'Runde' : 'Runden'}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
      <p className="mt-4 mb-4">Stand: {formattedCurrentDate}</p>
    </Layout>
  );
}
