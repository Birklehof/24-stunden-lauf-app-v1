import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import isAuthenticated from '../../../lib/middleware/tokenBased';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAuthenticated(await getToken({ req, secret }), ['superadmin']))) {
    return res.status(403).end();
  }

  const uuid: string = req.query.uuid.toString();

  if (req.method === 'GET') {
    await handleGET(uuid, res);
  } else if (req.method === 'PATCH') {
    await handlePATCH(uuid, res, req);
  } else if (req.method === 'DELETE') {
    await handleDELETE(uuid, res);
  } else {
    return res.status(405).end();
  }
}

// GET /api/users/:uuid
async function handleGET(uuid: string, res: NextApiResponse) {
  try {
    const user = await prisma.user.findUnique({
      where: { uuid: uuid }
    });

    if (!user) {
      return res.status(404).end();
    }

    return res.status(200).json({ data: user });
  } catch (e) {
    return res.status(500).end();
  }
}

// PATCH /api/users/:uuid
async function handlePATCH(uuid: string, res: NextApiResponse, req: NextApiRequest) {
  try {
    const user = await prisma.user.findUnique({
      where: { uuid: uuid }
    });

    if (!user) {
      return res.status(404).end();
    }

    try {
      const { name, email, role } = await req.body;

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
      } else if (role !== 'helper' && role !== 'superadmin') {
        return res.status(400).json({
          error: 'Ungültige Rolle'
        });
      }

      await prisma.user.update({
        where: { uuid: uuid },
        data: {
          name,
          email,
          role
        }
      });
      return res.status(200).end();
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          res.status(400).json({ message: 'Benutzer existiert bereits' });
        }
      }
      return res.status(500).end();
    }
  } catch (e) {
    return res.status(500).end();
  }
}

// DELETE /api/users/:uuid
async function handleDELETE(uuid: string, res: NextApiResponse) {
  try {
    const user = await prisma.user.findUnique({
      where: { uuid: uuid }
    });

    if (!user) {
      return res.status(404).end();
    }

    await prisma.user.delete({
      where: { uuid: uuid }
    });
    return res.status(200).end();
  } catch (e) {
    return res.status(500).end();
  }
}
