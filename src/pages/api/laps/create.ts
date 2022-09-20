import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import isAuthenticated from '../../../lib/middleware/tokenBased';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;
const minTimePerLap = parseInt(process.env.MIN_TIME_PER_LAP || '120000');

// POST /api/laps/create
// Required fields in body: number
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAuthenticated(await getToken({ req, secret }), ['helper', 'superadmin']))) {
    return res.status(403).end();
  }

  if (req.method === 'POST') {
    const { number } = req.body;

    if (!number) {
      return res.status(400).json({
        error: 'Starnummer fehlt'
      });
    } else if (isNaN(+number)) {
      return res.status(400).json({
        error: 'Läufer Nummer muss eine Zahl sein'
      });
    }

    try {
      const runner = await prisma.runner.findUnique({
        where: {
          number: +number
        }
      });

      if (!runner) {
        return res.status(400).json({
          error: 'Kein Läufer mit dieser Startnummer'
        });
      }

      const lastRound = await prisma.lap.findFirst({
        where: {
          runnerNumber: runner.number
        },
        orderBy: {
          runAt: 'desc'
        }
      });

      if (lastRound && new Date().getTime() - lastRound.runAt.getTime() < minTimePerLap) {
        const timeLeft = minTimePerLap - (new Date().getTime() - lastRound.runAt.getTime());
        const minutes = Math.floor(timeLeft / 1000 / 60);
        const seconds = Math.floor((timeLeft - minutes * 1000 * 60) / 1000);
        const secondsTwoDigits = seconds < 10 ? `0${seconds}` : seconds;
        return res.status(400).json({
          error:
            'Die letze Runde ist noch nicht lange genug her (' +
            minutes +
            ':' +
            secondsTwoDigits +
            ' Minuten verbleibend)'
        });
      }

      await prisma.lap.create({
        data: {
          runner: {
            connect: {
              number: +number
            }
          }
        }
      });
      return res.status(200).end();
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2002') {
          return res.status(400).json({ message: 'Runde existiert bereits' });
        }
      }
      return res.status(500).end();
    }
  } else {
    return res.status(405).end();
  }
}
