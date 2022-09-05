import React from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import { prisma } from '../../../prisma';
import { Group, Runner, Lap } from '@prisma/client';
import style from '../../styles/results-scoreboard.module.css';

interface RunnerWithGroupAndLapsCount extends Runner {
  group?: Group;
  _count: {
    laps: number;
  };
}

export async function getServerSideProps(_context: any) {
  let runners = await prisma.runner.findMany({
    include: {
      group: true,
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

export default function LeaderbordPage({ runners }: { runners: RunnerWithGroupAndLapsCount[] }) {
  const { status } = useSession();
  const loading = status === 'loading';

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  console.log(runners);

  // Make sure runners has a least three elements
  if (runners.length < 3) {
    for (let i = 0; i <= 2; i++) {
      if (!runners[i]) {
        runners[i] = {
          number: i,
          firstName: 'Niemand',
          lastName: '',
          groupUuid: null,
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
        <div className={style.topThree}>
          {runners &&
            [runners[1], runners[0], runners[2]].map((runner: RunnerWithGroupAndLapsCount, index: number) => (
              <div key={index} className={style.item}>
                <div className={style.name}>
                  {runner.firstName} {runner.lastName} ({runner.number})
                </div>
                <div className={style.podium}>
                  <div className={style.pos}>{runners.indexOf(runner) + 1}</div>
                  <div className={style.laps}>
                    {runner._count.laps} {runner._count.laps === 1 ? 'Runde' : 'Runden'}
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className={style.rest}>
          {runners &&
            runners.slice(3).map((runner: RunnerWithGroupAndLapsCount, index: number) => (
              <div key={index} className={style.item}>
                <div className={style.pos}>{index + 3}</div>
                <div className={style.name}>
                  {runner.firstName} {runner.lastName} ({runner.number})
                </div>
                <div className={style.laps}>
                  {runner._count.laps} {runner._count.laps === 1 ? 'Runde' : 'Runden'}
                </div>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
}
