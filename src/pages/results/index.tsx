import React from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import { prisma } from '../../../prisma';
import { Group, Runner, Lap } from '@prisma/client';
import style from '../../styles/results-dashboard.module.css';

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

export default function GeneralPage({ runners }: { runners: RunnerWithGroupAndLapsCount[] }) {
  const { status } = useSession();
  const loading = status === 'loading';

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  console.log(runners);

  return (
    <Layout>
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-col w-full lg:flex-row">
            <div>
              <h1>{runners.length}</h1>
              <p>Teilnehmer</p>
            </div>
            <div className="divider lg:divider-horizontal" />
            <div>
              <h1>{runners.reduce((acc, runner) => acc + Number(runner._count.laps) || 0, 0)}</h1>
              <p>Runden gesamt</p>
            </div>
            <div className="divider lg:divider-horizontal" />
            <div>
              <h1>{runners.reduce((acc, runner) => acc + Number(runner._count.laps) || 0, 0) / runners.length}</h1>
              <p>Runden pro Teilnehmer</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
