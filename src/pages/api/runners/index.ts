import { prisma } from '../../../../prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import middleware from '../middleware';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// GET /api/groups
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await middleware(await getToken({ req, secret }), ['guest', 'helper', 'superadmin']))) {
    return res.status(403).end();
  }

  if (req.method === 'GET') {
    try {
      const runners = await prisma.runner.findMany(
        {
          include: {
            group: true,
            laps: true
          },
          orderBy: {
            laps: {
              _count: 'desc'
            }
          }
        }
      );
      return res.status(200).json({
        data: runners
      });
    } catch (e) {
      console.log(e);
      return res.status(500).end();
    }
  } else {
    return res.status(405).end();
  }
}
