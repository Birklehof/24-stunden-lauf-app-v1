import React from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import { prisma } from '../../../prisma';
import { Group, Runner } from '@prisma/client';
import style from '../../styles/results-scoreboard.module.css';

interface RunnerWithLapsCount extends Runner {
  _count: {
    laps: number;
  };
}

interface GroupWithRunnersWithLaps extends Group {
  runners: RunnerWithLapsCount[];
  _count: {
    laps: number;
  };
}

export async function getServerSideProps(_context: any) {
  let groups = await prisma.group.findMany({
    include: {
      runners: {
        include: {
          _count: {
            select: {
              laps: true
            }
          }
        }
      }
    }
  });
  groups = JSON.parse(JSON.stringify(groups));
  return { props: { groups } };
}

export default function GroupsPage({ groups }: { groups: GroupWithRunnersWithLaps[] }) {
  const { status } = useSession();
  const loading = status === 'loading';

  console.log(groups);

  // sum the laps cout for each runner in each group
  groups.forEach((group) => {
    group._count = { laps: group.runners?.reduce((acc, runner) => acc + Number(runner._count.laps) || 0, 0) };
    return group;
  });

  // sort groups by laps count, if equal sort by number of runners
  groups.sort((a, b) => {
    if (a._count.laps > b._count.laps) {
      return -1;
    }
    if (a._count.laps < b._count.laps) {
      return 1;
    }
    if (a.runners?.length < b.runners?.length) {
      return -1;
    }
    if (a.runners?.length > b.runners?.length) {
      return 1;
    }
    return 0;
  });

  console.log(groups);

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  // Make sure groups has a least three elements
  if (groups.length < 3) {
    for (let i = 0; i <= 2; i++) {
      if (!groups[i]) {
        groups[i] = {
          uuid: `unset-${i}`,
          name: 'Niemand',
          _count: {
            laps: 0
          },
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
                <div className={style.name}>
                  {group.name} ({group.runners?.length})
                </div>
                <div className={style.podium}>
                  <div className={style.pos}>{groups.indexOf(group) + 1}</div>
                  <div className={style.laps}>
                    {group._count?.laps} {group._count?.laps === 1 ? 'Runde' : 'Runden'}
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
                  {group._count?.laps} {group._count?.laps === 1 ? 'Runde' : 'Runden'}
                </div>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
}
