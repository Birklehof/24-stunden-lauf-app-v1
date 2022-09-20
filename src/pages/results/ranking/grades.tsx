import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../../components/layout';
import { prisma } from '../../../../prisma';
import { Runner } from '@prisma/client';
import rankingStyle from '../../../styles/ranking.module.css';

const gradeNames = process.env.GRADES?.split(',') || [''];
const timezoneHoursOffset = parseInt(process.env.TIMEZONE_HOURS_OFFSET || '0');

interface RunnerWithLapCount extends Runner {
  _count: {
    laps: number;
  };
}

export async function getStaticProps(_context: any) {
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
  return { props: { runners, formattedCurrentDate }, revalidate: 60 };
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
  const [expandGrade, setExpandGrade] = useState<number | null>(null);

  const grades = gradeNames.map((name) => {
    return {
      name,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`,
      _count: {
        laps: runners.filter((runner) => runner.grade === name).reduce((sum, runner) => sum + runner._count.laps, 0),
        runners: runners.filter((runner) => runner.grade === name).length
      },
      averageLaps:
        runners.filter((runner) => runner.grade === name).reduce((sum, runner) => sum + runner._count.laps, 0) /
        runners.filter((runner) => runner.grade === name).length
    };
  });

  grades.sort((a, b) => {
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
      <div className={rankingStyle.leaderboard}>
        <div className="w-11/12 max-w-4xl flex flex-col gap-4">
          {grades &&
            grades.map((grade, index: number) => (
              <div key={index}>
                <div
                  className="bg-white shadow-md rounded-full flex flex-row items-center justify-between p-1 cursor-pointer"
                  onClick={() => {
                    if (expandGrade === index) {
                      setExpandGrade(null);
                    } else {
                      setExpandGrade(index);
                    }
                  }}
                >
                  <a className="btn btn-circle btn-outline btn-primary">{index + 1}</a>
                  <div>
                    {grade.name} ({grade._count.runners})
                  </div>
                  <div className="btn btn-ghost rounded-full">
                    {grade._count.laps} {grade._count.laps === 1 ? 'Runde' : 'Runden'}
                  </div>
                </div>
                <div
                  className={`card w-full bg-base-100 shadow-md mt-2 transition-transform	${
                    expandGrade === index ? 'scale-y-100 h-full' : 'scale-y-0 h-0'
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
                            .filter((runner) => runner.grade === grade.name)
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
      <p className="mt-4 mb-4">Stand: {formattedCurrentDate}</p>
    </Layout>
  );
}
