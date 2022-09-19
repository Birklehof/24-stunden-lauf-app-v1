import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../../components/layout';
import { prisma } from '../../../../prisma';
import { Runner } from '@prisma/client';
import style from '../../../styles/results-scoreboard.module.css';

const houseNames = process.env.HOUSES?.split(',') || [''];

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
    }
  });
  runners = JSON.parse(JSON.stringify(runners));
  return { props: { runners } };
}

export default function GroupsPage({ runners }: { runners: RunnerWithLapCount[] }) {
  const { status } = useSession();
  const loading = status === 'loading';
  const [expandHouse, setExpandHouse] = useState<number | null>(null);

  const houses = houseNames.map((name) => {
    return {
      name,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      _count: {
        laps: runners.filter((runner) => runner.house === name).reduce((sum, runner) => sum + runner._count.laps, 0),
        runners: runners.filter((runner) => runner.house === name).length
      },
      averageLaps:
        runners.filter((runner) => runner.house === name).reduce((sum, runner) => sum + runner._count.laps, 0) /
        runners.filter((runner) => runner.house === name).length
    };
  });

  // sort houses by laps count, if equal sort by number of runners
  houses.sort((a, b) => {
    if (a._count.laps > b._count.laps) {
      return -1;
    }
    if (a._count.laps < b._count.laps) {
      return 1;
    }
    if (a._count.runners < b._count.runners) {
      return -1;
    }
    if (a._count.runners > b._count.runners) {
      return 1;
    }
    return 0;
  });

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  return (
    <Layout>
      <div className={style.leaderboard}>
        <div className="w-11/12 max-w-4xl flex flex-col gap-4">
          {houses &&
            houses.map((house, index: number) => (
              <div key={index}>
                <div
                  className="bg-white shadow-md rounded-full flex flex-row items-center justify-between p-1 cursor-pointer"
                  onClick={() => {
                    if (expandHouse === index) {
                      setExpandHouse(null);
                    } else {
                      setExpandHouse(index);
                    }
                  }}
                >
                  <a className="btn btn-circle btn-outline btn-primary">{index + 1}</a>
                  <div>
                    {house.name} ({house._count.runners})
                  </div>
                  <div className="btn btn-ghost rounded-full">
                    {house._count.laps} {house._count.laps === 1 ? 'Runde' : 'Runden'}
                  </div>
                </div>
                <div
                  className={`card w-full bg-base-100 shadow-md mt-2 transition-transform	${
                    expandHouse === index ? 'scale-y-100 h-full' : 'scale-y-0 h-0'
                  }`}
                >
                  {runners && (
                    <div className="overflow-x-auto">
                      <table className="table table-compact w-full">
                        <thead>
                          <tr>
                            <th> Nr.</th>
                            <th>Name</th>
                            <th>Runden</th>
                          </tr>
                        </thead>
                        <tbody>
                          {runners
                            .filter((runner) => runner.house === house.name)
                            .sort((a, b) => {
                              if (a._count.laps > b._count.laps) {
                                return -1;
                              }
                              if (a._count.laps < b._count.laps) {
                                return 1;
                              }
                              return 0;
                            })
                            .map((runner, index: number) => (
                              <tr key={index}>
                                <td>{runner.number}</td>
                                <td>
                                  {runner.firstName} {runner.lastName}
                                </td>
                                <td>{runner._count.laps}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </Layout>
  );
}
