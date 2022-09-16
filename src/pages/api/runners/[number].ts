import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import middleware from '../middleware';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await middleware(await getToken({ req, secret }), ['superadmin']))) {
    return res.status(403).end();
  }

  const number: number = parseInt(req.query.number.toString());

  if (req.method === 'DELETE') {
    await handleDELETE(number, res);
  } else {
    return res.status(405).end();
  }
}

// DELETE /api/runner/:number
async function handleDELETE(number: number, res: NextApiResponse) {
  try {
    const runner = await prisma.runner.findUnique({
      where: { number: number }
    });

    if (!runner) {
      return res.status(404).end();
    }

    await prisma.lap.deleteMany({
      where: {
        runnerNumber: runner.number
      }
    });

    await prisma.runner.delete({
      where: { number: runner.number }
    });
    return res.status(200).end();
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
}
