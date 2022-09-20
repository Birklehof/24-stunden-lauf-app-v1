import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import isAuthenticated from '../../../lib/middleware/tokenBased';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// POST /api/users/create
// Required fields in body: name, email, role
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAuthenticated(await getToken({ req, secret }), ['superadmin']))) {
    return res.status(403).end();
  }

  if (req.method === 'POST') {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({
        error: 'Fehlende Angaben'
      });
    } else if (typeof name !== 'string') {
      return res.status(400).json({
        error: 'Name muss ein String sein'
      });
    } else if (typeof email !== 'string') {
      return res.status(400).json({
        error: 'E-Mail muss ein String sein'
      });
    } else if (typeof role !== 'string') {
      return res.status(400).json({
        error: 'Rolle muss ein String sein'
      });
    } else if (role !== 'superadmin' && role !== 'helper') {
      return res.status(400).json({
        error: 'Ungültige Rolle'
      });
    }

    try {
      await prisma.user.create({
        data: {
          name: name,
          email: email,
          role: role
        }
      });
      return res.status(200).end();
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2002') {
          return res.status(400).json({ error: 'Benutzer existiert bereits' });
        }
      }
      return res.status(500).end();
    }
  } else {
    return res.status(405).end();
  }
}
