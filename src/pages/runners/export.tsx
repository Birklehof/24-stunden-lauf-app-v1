import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import AccessDenied from '../../components/accessDenied';
import { CSVLink } from 'react-csv';
import { useToasts } from 'react-toast-notifications';
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
      number: 'asc'
    }
  });
  runners = JSON.parse(JSON.stringify(runners));
  return { props: { runners } };
}

export default function ExportRunnersPage({ runners }: { runners: Runner[] }) {
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
    { label: 'Klasse', key: 'grade' },
    { label: 'Haus', key: 'house' },
    { label: 'Startnummer', key: 'number' }
  ];
  const csvReport: csvReport = {
    data: data,
    headers: headers,
    filename: 'Birklehof_24h-Lauf_Teilnehmer_' + formattedDate + '.csv'
  };
  const { addToast } = useToasts();

  const handleExport = async () => {
    await generateCSV(runners);
  };

  const generateCSV = async (runners: Runner[]) => {
    if (runners.length > 0) {
      // Click the download button to download the CSV file
      document.getElementById('download-csv')?.click();

      addToast(`Läufer als CSV-Datei heruntergeladen`, {
        appearance: 'success',
        autoDismiss: true
      });
    } else {
      addToast('Keine Läufer', {
        appearance: 'info',
        autoDismiss: true
      });
    }
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
          <input type={'button'} onClick={handleExport} value={'Herunterladen'} className="btn btn-primary" />
          {data?.length > 0 ? (
            <CSVLink id={'download-csv'} {...csvReport} className="btn btn-primary">
              Erneut herunterladen
            </CSVLink>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
