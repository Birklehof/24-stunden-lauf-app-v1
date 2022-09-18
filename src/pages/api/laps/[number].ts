import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../prisma';
import isAuthenticated from '../middleware';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAuthenticated(await getToken({ req, secret }), ['helper', 'superadmin']))) {
    return res.status(403).end();
  }

  const number: number = parseInt(req.query.number.toString());

  if (req.method === 'DELETE') {
    await handleDELETE(number, res);
  } else {
    return res.status(405).end();
  }
}

// DELETE /api/laps/:number
async function handleDELETE(number: number, res: NextApiResponse) {
  try {
    const runner = await prisma.runner.findUnique({
      where: { number: number }
    });

    if (!runner) {
      return res.status(400).json({
        error: 'Kein Läufer mit dieser Startnummer'
      });
    }

    const laps = await prisma.lap.deleteMany({
      where: {
        runnerNumber: runner.number
      }
    });

    if (laps.count === 0) {
      return res.status(400).json({
        error: 'Der Läufer hat keine Runden'
      });
    }
    return res.status(200).end();
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
}
