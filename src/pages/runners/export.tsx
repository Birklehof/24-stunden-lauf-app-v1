import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import AccessDenied from '../../components/accessDenied';
import { CSVLink } from 'react-csv';
import { Runner } from '@prisma/client';
import { prisma } from '../../../prisma';

interface Header {
  label: string;
  key: string;
}

interface csvReport {
  headers: Header[];
  data: Runner[];
  filename: string;
}

interface RunnerWithShowedUp extends Runner {
  showedUp: boolean;
}

export async function getServerSideProps(_context: any) {
  let runners = await prisma.runner.findMany({
    orderBy: {
      number: 'asc'
    }
  });
  runners = runners.map((runner) => {
    return {
      ...runner,
      showedUp: false
    };
  });
  runners = JSON.parse(JSON.stringify(runners));
  return { props: { runners } };
}

export default function ExportRunnersPage({ runners }: { runners: RunnerWithShowedUp[] }) {
  const { data: session, status } = useSession();
  const [data, setData]: any = useState(runners);
  const loading = status === 'loading';
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${
    currentDate.getMonth() + 1
  }-${currentDate.getDate()}_${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}`;
  const headers: Header[] = [
    { label: 'Vorname', key: 'firstName' },
    { label: 'Nachname', key: 'lastName' },
    { label: 'Startnummer', key: 'number' },
    { label: 'Anwesend', key: 'showedUp' }
  ];
  const csvReport: csvReport = {
    data: data,
    headers: headers,
    filename: 'Birklehof_24h-Lauf_Teilnehmer_' + formattedDate + '.csv'
  };

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  // If the user is not authenticated or does not have the correct role, display access denied message
  if (!session || session.userRole !== 'superadmin') {
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
          <h2 className="card-title">Teilnehmerliste herunterladen</h2>
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
