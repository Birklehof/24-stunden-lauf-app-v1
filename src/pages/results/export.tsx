import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import AccessDenied from '../../components/accessDenied';
import { CSVLink } from 'react-csv';
import { Runner } from '@prisma/client';
import { prisma } from '../../../prisma';
import isAuthenticated from '../../lib/middleware/sessionBased';

interface Header {
  label: string;
  key: string;
}

interface csvReport {
  headers: Header[];
  data: Runner[];
  filename: string;
}

interface RunnerWithDistance extends Runner {
  distance: number;
}

const metersPerLap = parseInt(process.env.METERS_PER_LAP || '660');

export async function getServerSideProps(_context: any) {
  let runners = await prisma.runner.findMany({
    include: {
      _count: {
        select: {
          laps: true
        }
      }
    },
    orderBy: {
      lastName: 'asc'
    }
  });
  runners = runners.map((runner) => {
    return {
      ...runner,
      distance: (runner._count.laps * metersPerLap) / 1000
    };
  });
  runners = JSON.parse(JSON.stringify(runners));
  return { props: { runners } };
}

export default function ExportRunnersPage({ runners }: { runners: RunnerWithDistance[] }) {
  const { data: session, status } = useSession();
  const [data, setData]: any = useState(runners);
  const loading = status === 'loading';
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}_${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}`;
  const headers: Header[] = [
    { label: 'Startnummer', key: 'number' },
    { label: 'Vorname', key: 'firstName' },
    { label: 'Nachname', key: 'lastName' },
    { label: 'Klasse', key: 'grade' },
    { label: 'Haus', key: 'house' },
    { label: 'Runden', key: '_count.laps' },
    { label: 'Strecke [km]', key: 'distance' }
  ];
  const csvReport: csvReport = {
    data: data,
    headers: headers,
    filename: 'Birklehof_24-Stunden-Lauf_Ergebnisse_' + formattedDate + '.csv'
  };

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  if (!isAuthenticated(session, ['superadmin'])) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Ergebnisse herunterladen</h2>
          {data?.length > 0 ? (
            <CSVLink id={'download-csv'} {...csvReport} className="btn btn-primary">
              Herunterladen
            </CSVLink>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
