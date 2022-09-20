import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import isAuthenticated from '../../../lib/middleware/tokenBased';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// POST /api/accessToken/create
// No fileds required in body
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAuthenticated(await getToken({ req, secret }), ['superadmin']))) {
    return res.status(403).end();
  }

  if (req.method === 'POST') {
    const token = await getToken({ req, secret });

    if (!token || !token.email) {
      return res.status(401).end();
    }

    const user = await prisma.user.findUnique({
      where: {
        email: token.email
      }
    });

    if (!user) {
      return res.status(403).end();
    }

    try {
      const accessToken = await prisma.accessToken.create({
        data: {
          // expiresAt: new Date(expiresAt).toISOString(),
          createdBy: {
            connect: {
              uuid: user.uuid
            }
          }
        }
      });
      return res.status(200).json({
        data: {
          ...accessToken,
          createdBy: user
        }
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        // The .code property can be accessed in a type-safe manner
        if (e.code === 'P2002') {
          return res.status(400).json({ message: 'Access Token existiert bereits' });
        }
      }
      return res.status(500).end();
    }
  } else {
    return res.status(405).end();
  }
}
