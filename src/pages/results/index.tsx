import React from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import { prisma } from '../../../prisma';
import { Group, Lap, Runner } from '@prisma/client';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, PointElement, LineElement, ArcElement);

interface RunnerWithGroupAndLaps extends Runner {
  group?: Group;
  laps: Lap[];
}

export async function getServerSideProps(_context: any) {
  let runners = await prisma.runner.findMany({
    include: {
      group: true,
      laps: true,
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

export default function GeneralPage({ runners }: { runners: RunnerWithGroupAndLaps[] }) {
  const { status } = useSession();
  const loading = status === 'loading';

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const lapsPerHour = hours.map((hour) => {
    return runners.reduce((acc, runner) => {
      return acc + runner.laps.filter((lap) => new Date(lap.runAt).getHours() === hour).length;
    }, 0);
  });
  const averageLapsPerRunner =
    runners.reduce((acc, runner) => {
      return acc + runner.laps.length;
    }, 0) / runners.length;
  let groups = runners.reduce((acc, runner) => {
    if (runner.group && !acc.includes(runner.group.name)) {
      acc.push(runner.group.name);
    }
    return acc;
  }, [] as string[]);
  groups.push('Keine Gruppe');
  const lapsPerGroup = groups.map((group) => {
    return runners.reduce((acc, runner) => {
      if (runner.group && runner.group.name === group) {
        return acc + runner.laps.length;
      }
      if (!runner.group && group === 'Keine Gruppe') {
        return acc + runner.laps.length;
      }
      return acc;
    }, 0);
  });
  const backgroundColorForGroups = groups.map((_, i) => {
    return `hsl(${(i * 360) / groups.length}, 100%, 50%)`;
  });
  let averageLapsPerGroup = groups.map((group) => {
    return runners.reduce((acc, runner) => {
      if (runner.group && runner.group.name === group) {
        return acc + runner.laps.length;
      }
      if (!runner.group && group === 'Keine Gruppe') {
        return acc + runner.laps.length;
      }
      return acc;
    }, 0);
  });
  averageLapsPerGroup = averageLapsPerGroup.map((laps, index) => {
    return Math.round(
      laps /
        runners.filter(
          (runner) => (!runner.group?.name && groups[index] === 'Keine Gruppe') || runner.group?.name === groups[index]
        ).length
    );
  });
  let grades = runners.reduce((acc, runner) => {
    if (runner.grade && !acc.includes(runner.grade)) {
      acc.push(runner.grade);
    }
    return acc;
  }, [] as string[]);
  grades.push('Keine Klasse');
  const lapsPerGrade = grades.map((grade) => {
    return runners.reduce((acc, runner) => {
      if (runner.grade && runner.grade === grade) {
        return acc + runner.laps.length;
      }
      if (!runner.grade && grade === 'Keine Klasse') {
        return acc + runner.laps.length;
      }
      return acc;
    }, 0);
  });
  const backgroundColorForGrades = grades.map((_, i) => {
    return `hsl(${(i * 360) / grades.length}, 100%, 50%)`;
  });
  let averageLapsPerGrade = grades.map((grade) => {
    return runners.reduce((acc, runner) => {
      if (runner.grade && runner.grade === grade) {
        return acc + runner.laps.length;
      }
      if (!runner.grade && grade === 'Keine Klasse') {
        return acc + runner.laps.length;
      }
      return acc;
    }, 0);
  });
  averageLapsPerGrade = averageLapsPerGrade.map((laps, index) => {
    return Math.round(
      laps /
        runners.filter(
          (runner) => (!runner.grade && grades[index] === 'Keine Klasse') || runner.grade === grades[index]
        ).length
    );
  });

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  return (
    <Layout>
      <div className="card w-11/12 max-w-4xl bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Übersicht</h2>
          <div className="flex flex-col w-full lg:flex-row text-center justify-evenly">
            <div>
              <h1 className="text-5xl">{runners.length}</h1>
              <p>Teilnehmer</p>
            </div>
            <div className="divider lg:divider-horizontal" />
            <div>
              <h1 className="text-5xl">{runners.reduce((acc, runner) => acc + Number(runner.laps.length) || 0, 0)}</h1>
              <p>Runden gesamt</p>
            </div>
            <div className="divider lg:divider-horizontal" />
            <div>
              <h1 className="text-5xl">Ø {Math.round(averageLapsPerRunner)}</h1>
              <p>Runden pro Teilnehmer</p>
            </div>
          </div>
          <br />
          <div>
            <h3 className="card-title">Runden über den Tagesverlauf</h3>
            <Line
              datasetIdKey="id"
              data={{
                labels: hours.map((hour) => `${hour}:00`),
                datasets: [
                  {
                    label: 'Runden über den Tagesverlauf',
                    data: lapsPerHour,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    fill: false,
                    tension: 0.3
                  },
                  {
                    label: 'Durchschnittliche Runden pro Teilnehmer',
                    data: Array.from({ length: 24 }, () => Math.round(averageLapsPerRunner)),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    fill: false,
                    tension: 0.1
                  }
                ]
              }}
            />
          </div>
          <br />
          <div className="flex flex-col w-full lg:flex-row justify-around">
            <div className="max-w-md ml-auto mr-auto">
              <h3 className="card-title">Runden pro Gruppe</h3>
              <Pie
                datasetIdKey="id"
                data={{
                  labels: groups,
                  datasets: [
                    {
                      label: 'Runden pro Gruppe',
                      data: lapsPerGroup,
                      backgroundColor: backgroundColorForGroups,
                      hoverOffset: 4
                    }
                  ]
                }}
              />
            </div>
            <br />
            <div className="max-w-md ml-auto mr-auto">
              <h3 className="card-title">Durchschnittliche Runden pro Gruppe</h3>
              <Pie
                datasetIdKey="id"
                data={{
                  labels: groups,
                  datasets: [
                    {
                      label: 'Ø Runden pro Gruppe',
                      data: averageLapsPerGroup,
                      backgroundColor: backgroundColorForGroups,
                      hoverOffset: 4
                    }
                  ]
                }}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-col w-full lg:flex-row justify-around">
            <div className="max-w-md ml-auto mr-auto">
              <h3 className="card-title">Runden pro Klasse</h3>
              <Pie
                datasetIdKey="id"
                data={{
                  labels: grades,
                  datasets: [
                    {
                      label: 'Runden pro Klasse',
                      data: lapsPerGrade,
                      backgroundColor: backgroundColorForGrades,
                      hoverOffset: 4
                    }
                  ]
                }}
              />
            </div>
            <br />
            <div className="max-w-md ml-auto mr-auto">
              <h3 className="card-title">Durchschnittliche Runden pro Klasse</h3>
              <Pie
                datasetIdKey="id"
                data={{
                  labels: grades,
                  datasets: [
                    {
                      label: 'Ø Runden pro Klasse',
                      data: averageLapsPerGrade,
                      backgroundColor: backgroundColorForGrades,
                      hoverOffset: 4
                    }
                  ]
                }}
              />
            </div>
          </div>
          <br />
        </div>
      </div>
    </Layout>
  );
}
