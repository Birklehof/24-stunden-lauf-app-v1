import React from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../../components/layout';
import { prisma } from '../../../../prisma';
import { Runner } from '@prisma/client';

const houseNames = process.env.HOUSES?.split(',') || [''];
const timezoneHoursOffset = parseInt(process.env.TIMEZONE_HOURS_OFFSET || '0');

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
  let currentDate = new Date();
  currentDate.setHours(currentDate.getHours() + timezoneHoursOffset);
  const formattedCurrentDate = currentDate.toLocaleDateString('de') + ' ' + currentDate.toLocaleTimeString('de');
  return { props: { runners, formattedCurrentDate } };
}

export default function GroupsPage({
  runners,
  formattedCurrentDate
}: {
  runners: RunnerWithLapCount[];
  formattedCurrentDate: string;
}) {
  const { status } = useSession();
  const loading = status === 'loading';

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
      <div className="w-11/12 max-w-lg flex flex-col gap-4">
        {houses &&
          houses.map((house, index: number) => (
            <div id={`collapse-${index}`} key={index} tabIndex={0} className="collapse">
              <div className="collapse-title bg-white shadow-md rounded-full w-full mb-2 flex flex-row justify-between items-center p-1">
                <a className="btn btn-circle btn-outline btn-primary">{index + 1}</a>
                {house.name} ({house._count.runners}){' '}
                <div className="font-bold px-4">
                  {house._count.laps}{' '}
                  <span className="hidden sm:inline">{house._count.laps === 1 ? 'Runde' : 'Runden'}</span>
                </div>
              </div>
              <div tabIndex={0} className="collapse-content">
                <div className="card bg-white shadow-md">
                  <div className="card-body p-0">
                    {runners && (
                      <div style={{ maxHeight: '50vh' }} className={`overflow-x-auto overflow-y-auto`}>
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
              </div>
            </div>
          ))}
      </div>
      <p className="mt-4 mb-4">Stand: {formattedCurrentDate}</p>
    </Layout>
  );
}
