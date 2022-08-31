import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import AccessDenied from '../../components/accessDenied';
import { prisma } from '../../../prisma';
import { Group, Runner, Lap } from '@prisma/client';
import { IoTrashOutline } from 'react-icons/io5';
import { useToasts } from 'react-toast-notifications';
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

  return (
    <Layout>
      <div className={style.leaderboard}>

      </div>
      {/*<div className={'form table-form'}>
        <h1 className={'formHeading'}>Gruppen</h1>
        <div className={'tableWrapper'}>
          <table className={'ranked'}>
            <thead>
            <tr>
              <th>Name</th>
              <th>Läufer</th>
              <th>Runden gesamt</th>
            </tr>
            </thead>
            <tbody>
            {groups && groups.map(group => (
              <tr key={group.id}>
                <td>{group.name}</td>
                <td>
                  <details>
                    <summary>{group.runners.length} Läufer</summary>
                    {group.runners.map(runner => (
                      <div key={runner.id}>
                        {runner.firstName} {runner.lastName} {(
                          <>
                            (<small>{runner.laps?.length} Runden</small>)
                          </>
                        )}
                      </div>
                    ))}
                  </details>
                </td>
                <td>
                  {group.runners.reduce((acc, runner) => acc + runner.laps?.length || 0, 0)}
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>*/}
    </Layout>
  );
}