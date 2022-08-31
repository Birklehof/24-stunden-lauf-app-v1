import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import AccessDenied from '../../components/accessDenied';
import { prisma } from '../../../prisma';
import { Group, Runner, Lap } from '@prisma/client';
import { IoTrashOutline } from 'react-icons/io5';
import { useToasts } from 'react-toast-notifications';
import style from "../../styles/leaderboard.module.css";

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

  return (
    <Layout>
      <div className={style.leaderboard}>
        <div className={style.topThree}>
          {runners && [runners[1], runners[0], runners[2]].map((runner: RunnerWithGroupAndLaps) => (
            <div className={style.item}>
              <div className={style.name}>{runner.firstName} {runner.lastName} ({runner.number})</div>
              <div className={style.podium}>
                <div className={style.pos}>
                  {runners.indexOf(runner) + 1}
                </div>
                <div className={style.laps}>{runner.laps?.length} Runden</div>
              </div>
            </div>
          ))}
        </div>
        <div className={style.rest}>
          {runners && runners.slice(3).map(runner => (
            <div>
              <div>{runner.firstName} {runner.lastName}</div>
              <div>{runner.laps.length}</div>
            </div>
          ))}
        </div>
      </div>
      {/*<div className={'form table-form'}>
        <h1 className={'formHeading'}>Läufer</h1>
        <div className={'tableWrapper'}>
          <table className={'ranked'}>
            <thead>
              <tr>
                <th>Startnummer</th>
                <th>Vorname</th>
                <th>Nachname</th>
                <th>Klasse</th>
                <th>Gruppe</th>
                <th>Runden</th>
              </tr>
            </thead>
            <tbody>
              {runners &&
                runners.map((runner) => (
                  <tr key={runner.number}>
                    <td>{runner.number}</td>
                    <td>{runner.firstName}</td>
                    <td>{runner.lastName}</td>
                    <td>{runner.grade}</td>
                    <td>{runner.group?.name}</td>
                    <td>{runner.laps?.length}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>*/}
    </Layout>
  );
}
