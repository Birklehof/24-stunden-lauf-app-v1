import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import isAuthenticated from '../../../lib/middleware/tokenBased';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// POST /api/runners/create
// Required fields in body: firstName, lastName, groupUuid, newGroupName, grade
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAuthenticated(await getToken({ req, secret }), ['helper', 'superadmin']))) {
    return res.status(403).end();
  }

  if (req.method === 'POST') {
    const { firstName, lastName } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        error: 'Fehlende Angaben'
      });
    } else if (typeof firstName !== 'string' || typeof lastName !== 'string') {
      return res.status(400).json({
        error: 'Alle Angaben müssen Zeichenketten sein'
      });
    }

    try {
      let newRunner;
      newRunner = await prisma.runner.create({
        data: {
          firstName,
          lastName
        }
      });
      return res.status(200).json({
        number: newRunner.number
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          return res.status(400).json({ message: 'Läufer existiert bereits' });
        }
      }
      return res.status(500).end();
    }
  } else {
    return res.status(405).end();
  }
}
