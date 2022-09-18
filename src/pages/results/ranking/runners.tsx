import React from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../../components/layout';
import { prisma } from '../../../../prisma';
import { Runner } from '@prisma/client';
import style from '../../../styles/results-scoreboard.module.css';

interface RunnerWithLapCount extends Runner {
  _count: {
    laps: number;
  };
}

export async function getServerSideProps(_context: any) {
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
        number: 'desc'
      }
    ]
  });
  runners = JSON.parse(JSON.stringify(runners));
  return { props: { runners } };
}

export default function LeaderbordPage({ runners }: { runners: RunnerWithLapCount[] }) {
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
      <div className={style.leaderboard}>
        <div className="w-11/12 max-w-4xl flex flex-col justify-between items-center my-6 gap-2">
          {runners &&
            [runners[0], runners[1], runners[2]].map((runner: RunnerWithLapCount, index: number) => (
              <div
                key={index}
                className="w-full stats grow shadow-lg first:h-44 first:z-20 z-10 last:z-0 h-36 last:h-32 text-[#d4af37] first:text-[#c0c0c0] last:text-[#bf8970] mt-[-20px]"
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
        <div className="w-11/12 max-w-4xl flex flex-col gap-2">
          {runners &&
            runners.slice(3).map((runner: RunnerWithLapCount, index: number) => (
              <div key={index} className="shadow-md rounded-full flex flex-row items-center justify-between p-1">
                <a className="btn btn-circle btn-outline btn-primary">{index + 3}</a>
                <div>
                  {runner.firstName} {runner.lastName} ({runner.number})
                </div>
                <div className="btn btn-ghost rounded-full">
                  {runner._count.laps} {runner._count.laps === 1 ? 'Runde' : 'Runden'}
                </div>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
}
