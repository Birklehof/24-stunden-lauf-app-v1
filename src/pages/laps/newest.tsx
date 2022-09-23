import { Lap } from '@prisma/client';
import useSWR from 'swr';
import loaderSytle from '../../styles/loader.module.css';

interface LapWithRunner extends Lap {
  runner: {
    firstName: string;
    lastName: string;
    house: string;
    grade: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function NewestLapsPage() {
  const { data, error } = useSWR('/api/laps/newest', fetcher, { refreshInterval: 500 });

  if (error) return <div>Failed to load ... </div>;

  return (
    <>
      <div className="flex flex-col gap-2 w-full bg-[#fafafa] items-center overflow-hidden h-screen">
        <div className="w-11/12 max-w-xs mt-10">
          <div>
            <h2 className="font-bold text-2xl mb-2">Neueste Runden </h2>
            <div className={loaderSytle.loader}></div>
            {data?.data &&
              data.data.map((lap: LapWithRunner, index: number) => {
                return (
                  <div key={index} className="stats shadow w-full text-center mb-2">
                    <div className="stat">
                      <div className="stat-title">Startnummer</div>
                      <div className="stat-value">{lap.runnerNumber}</div>
                      <div className="stat-desc">
                        {lap.runner.firstName} {lap.runner.lastName}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
}
