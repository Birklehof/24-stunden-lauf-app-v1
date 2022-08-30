import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import middleware from '../middleware';
import { getToken } from 'next-auth/jwt';
import { signOut } from 'next-auth/react';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await middleware(await getToken({ req, secret }), ['superadmin']))) {
    return res.status(403).end();
  }

  const userUuid: string = req.query.uuid.toString();

  if (req.method === 'GET') {
    await handleGET(userUuid, res);
  } else if (req.method === 'PATCH') {
    await handlePATCH(userUuid, res, req);
  }
  if (req.method === 'DELETE') {
    await handleDELETE(userUuid, res);
  } else {
    return res.status(405).end();
  }
}

// GET /api/users/:uuid
async function handleGET(userUuid: string, res: NextApiResponse) {
  try {
    const user = await prisma.user.findUnique({
      where: { uuid: userUuid }
    });
    if (!user) {
      return res.status(404).end();
    } else {
      return res.status(200).json({ data: user });
    }
  } catch (e) {
    return res.status(500).end();
  }
}

// PATCH /api/users/:uuid
async function handlePATCH(userUuid: string, res: NextApiResponse, req: NextApiRequest) {
  try {
    const user = await prisma.user.findUnique({
      where: { uuid: userUuid }
    });
    if (!user) {
      return res.status(404).end();
    } else if (user.role == 'superadmin') {
      return res.status(403).end();
    } else {
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
        } else if (role !== 'helper') {
          return res.status(400).json({
            error: 'Ungültige Rolle'
          });
        }

        await prisma.user.update({
          where: { uuid: userUuid },
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
    }
  } catch (e) {
    return res.status(500).end();
  }
}

// DELETE /api/users/:uuid
async function handleDELETE(userUuid: string, res: NextApiResponse) {
  try {
    const user = await prisma.user.findUnique({
      where: { uuid: userUuid }
    });

    if (!user) {
      return res.status(404).end();
    } else if (user.role === 'superadmin') {
      return res.status(403).end();
    }
    await prisma.user.delete({
      where: { uuid: userUuid }
    });
    return res.status(200).end();
  } catch (e) {
    return res.status(500).end();
  }
}
