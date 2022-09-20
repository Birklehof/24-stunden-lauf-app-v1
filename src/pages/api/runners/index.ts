import { prisma } from '../../../../prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import isAuthenticated from '../../../lib/middleware/tokenBased';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// GET /api/groups
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAuthenticated(await getToken({ req, secret }), ['guest', 'helper', 'superadmin']))) {
    return res.status(403).end();
  }

  if (req.method === 'GET') {
    try {
      let runners = await prisma.runner.findMany({
        include: {
          _count: {
            select: {
              laps: true
            }
          }
        },
        orderBy: {
          number: 'asc'
        }
      });
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
