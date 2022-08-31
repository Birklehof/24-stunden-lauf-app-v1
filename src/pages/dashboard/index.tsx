import React from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import { prisma } from '../../../prisma';
import { Group, Runner, Lap } from '@prisma/client';
import style from '../../styles/leaderboard.module.css';

interface RunnerWithGroupAndLaps extends Runner {
  group?: Group;
  laps?: Lap[];
}

export async function getServerSideProps(_context: any) {
  let runners = await prisma.runner.findMany({
    include: {
      group: true,
      laps: true
    },
    orderBy: {
      laps: {
        _count: 'desc'
      }
    }
  });
  runners = JSON.parse(JSON.stringify(runners));
  return { props: { runners } };
}

export default function IndexRunnersPage({ runners }: { runners: RunnerWithGroupAndLaps[] }) {
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
          firstName: 'Niemand',
          lastName: '',
          groupUuid: null,
          grade: ''
        };
      }
    }
  }

  return (
    <Layout>
      <div className={style.leaderboard}>
        <div className={style.topThree}>
          {runners &&
            [runners[1], runners[0], runners[2]].map((runner: RunnerWithGroupAndLaps, index: number) => (
              <div key={index} className={style.item}>
                <div className={style.name}>
                  {runner.firstName} {runner.lastName} ({runner.number})
                </div>
                <div className={style.podium}>
                  <div className={style.pos}>{runners.indexOf(runner) + 1}</div>
                  <div className={style.laps}>
                    {runner.laps?.length} {runner.laps?.length === 1 ? 'Runde' : 'Runden'}
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className={style.rest}>
          {runners &&
            runners.slice(3).map((runner: RunnerWithGroupAndLaps, index: number) => (
              <div key={index} className={style.item}>
                <div className={style.pos}>{index + 3}</div>
                <div className={style.name}>
                  {runner.firstName} {runner.lastName} ({runner.number})
                </div>
                <div className={style.laps}>
                  {runner.laps?.length} {runner.laps?.length === 1 ? 'Runde' : 'Runden'}
                </div>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
}
