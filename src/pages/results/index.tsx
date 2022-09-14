import React from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import { prisma } from '../../../prisma';
import { Group, Lap, Runner } from '@prisma/client';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
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
  _count: {
    laps: number;
  };
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

  const hoursSinceFirstLap = Math.floor((Date.now() - new Date(runners[0].laps[0].runAt).getTime()) / 1000 / 60 / 60);
  const totalLapsInEachHourSinceFirstLap = Array.from({ length: hoursSinceFirstLap }, (_, i) => {
    const hour = i + 1;
    const lapsInHour = runners.reduce((acc, runner) => {
      const lapsInHour = runner.laps.filter((lap) => {
        const lapHour = Math.floor(
          (new Date(lap.runAt).getTime() - new Date(runners[0].laps[0].runAt).getTime()) / 1000 / 60 / 60
        );
        return lapHour <= hour;
      });
      return acc + lapsInHour.length;
    }, 0);
    return lapsInHour;
  });
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

  const addAlpha = (color: string, alpha: number) => {
    return color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
  };

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  return (
    <Layout>
      <div className="card w-11/12 max-w-4xl bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Übersicht</h2>
          <div className="stats stats-vertical lg:stats-horizontal mb-2">
            <div className="stat place-items-center">
              <div className="stat-title">Teilnehmer</div>
              <div className="stat-value">{runners.length}</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Runden gesamt</div>
              <div className="stat-value">
                {runners.reduce((acc, runner) => acc + Number(runner.laps.length) || 0, 0)}
              </div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Runden pro Teilnehmer</div>
              <div className="stat-value">Ø {Math.round(averageLapsPerRunner)}</div>
            </div>
          </div>
          <div className="stats stats-vertical lg:stats-horizontal">
            <div className="stat place-items-center">
              <div className="stat-title">Gesamtstrecke</div>
              <div className="stat-value">{Math.round(runners.length * averageLapsPerRunner * 0.6)} km</div>
              <div className="stat-desc">600m pro Runde</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Strecke pro Teilnehmer</div>
              <div className="stat-value">Ø {Math.round(averageLapsPerRunner * 0.6 * 10) / 10} km</div>
            </div>
          </div>
          <br />
          <div>
            <h3 className="card-title">Gesamtrundenzahl seit Start</h3>
            <Line
              data={{
                labels: Array.from({ length: hoursSinceFirstLap }, (_, i) => i),
                datasets: [
                  {
                    label: 'Runden',
                    data: totalLapsInEachHourSinceFirstLap,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    tension: 0.5
                  }
                ]
              }}
              // logaritmic scale
            />
          </div>
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
                    borderWidth: 2,
                    tension: 0.3
                  },
                  {
                    label: 'Durchschnittliche Runden pro Teilnehmer',
                    data: Array.from({ length: 24 }, () => Math.round(averageLapsPerRunner)),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
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
              <Doughnut
                datasetIdKey="id"
                data={{
                  labels: groups,
                  datasets: [
                    {
                      label: 'Runden pro Gruppe',
                      data: lapsPerGroup,
                      backgroundColor: backgroundColorForGrades.map((color) => addAlpha(color, 0.2)),
                      borderColor: backgroundColorForGrades,
                      borderWidth: 2
                    }
                  ]
                }}
              />
            </div>
            <br />
            <div className="max-w-md ml-auto mr-auto">
              <h3 className="card-title">Durchschnittliche Runden pro Gruppe</h3>
              <Bar
                datasetIdKey="id"
                data={{
                  labels: groups,
                  datasets: [
                    {
                      label: 'Ø Runden pro Gruppe',
                      data: averageLapsPerGroup,
                      borderColor: backgroundColorForGroups,
                      backgroundColor: backgroundColorForGroups.map((color) => addAlpha(color, 0.2)),
                      borderWidth: 2
                    }
                  ]
                }}
                options={{
                  scales: {
                    x: {
                      display: false
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
                }}
              />
            </div>
          </div>
          <br />
          <div className="flex flex-col w-full lg:flex-row justify-around">
            <div className="max-w-md ml-auto mr-auto">
              <h3 className="card-title">Runden pro Klasse</h3>
              <Doughnut
                datasetIdKey="id"
                data={{
                  labels: grades,
                  datasets: [
                    {
                      label: 'Runden pro Klasse',
                      data: lapsPerGrade,
                      backgroundColor: backgroundColorForGrades.map((color) => addAlpha(color, 0.2)),
                      borderColor: backgroundColorForGrades,
                      borderWidth: 2
                    }
                  ]
                }}
              />
            </div>
            <br />
            <div className="max-w-md ml-auto mr-auto">
              <h3 className="card-title">Durchschnittliche Runden pro Klasse</h3>
              <Bar
                datasetIdKey="id"
                data={{
                  labels: grades,
                  datasets: [
                    {
                      label: 'Ø Runden pro Klasse',
                      data: averageLapsPerGrade,
                      borderColor: backgroundColorForGrades,
                      backgroundColor: backgroundColorForGrades.map((color) => addAlpha(color, 0.2)),
                      borderWidth: 2
                    }
                  ]
                }}
                options={{
                  scales: {
                    x: {
                      display: false
                    }
                  },
                  plugins: {
                    legend: {
                      display: false
                    }
                  }
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
