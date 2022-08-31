import React from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import { prisma } from '../../../prisma';
import { Group, Runner, Lap } from '@prisma/client';
import style from '../../styles/leaderboard.module.css';

interface RunnerWithLaps extends Runner {
  laps?: Lap[];
}

interface GroupWithRunnersWithLaps extends Group {
  runners?: RunnerWithLaps[];
}

export async function getServerSideProps(_context: any) {
  let groups = await prisma.group.findMany({
    include: {
      runners: {
        include: {
          laps: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
  groups = JSON.parse(JSON.stringify(groups));
  return { props: { groups } };
}

export default function IndexRunnersPage({ groups }: { groups: GroupWithRunnersWithLaps[] }) {
  const { status } = useSession();
  const loading = status === 'loading';

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  // Make sure groups has a least three elements
  if (groups.length < 3) {
    for (let i = 0; i <= 2; i++) {
      if (!groups[i]) {
        groups[i] = {
          uuid: `unset-${i}`,
          name: 'Niemand',
          runners: []
        };
      }
    }
  }

  return (
    <Layout>
      <div className={style.leaderboard}>
        <div className={style.topThree}>
          {groups &&
            [groups[1], groups[0], groups[2]].map((group: GroupWithRunnersWithLaps, index: number) => (
              <div key={index} className={style.item}>
                <div className={style.name}>{group.name}</div>
                <div className={style.podium}>
                  <div className={style.pos}>{groups.indexOf(group) + 1}</div>
                  <div className={style.laps}>
                    {group.runners?.reduce((acc, runner) => acc + Number(runner.laps?.length) || 0, 0)}{' '}
                    {group.runners?.reduce((acc, runner) => acc + Number(runner.laps?.length) || 0, 0) === 1
                      ? 'Runde'
                      : 'Runden'}
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className={style.rest}>
          {groups &&
            groups.slice(3).map((group: GroupWithRunnersWithLaps, index: number) => (
              <div key={index} className={style.item}>
                <div className={style.pos}>{index + 3}</div>
                <div className={style.name}>{group.name}</div>
                <div className={style.laps}>
                  {group.runners?.reduce((acc, runner) => acc + Number(runner.laps?.length) || 0, 0)}{' '}
                  {group.runners?.reduce((acc, runner) => acc + Number(runner.laps?.length) || 0, 0) === 1
                    ? 'Runde'
                    : 'Runden'}
                </div>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
}
