import { prisma } from '../../../../prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import isAuthenticated from '../middleware';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

// GET /api/accessTokens
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAuthenticated(await getToken({ req, secret }), ['superadmin']))) {
    return res.status(403).end();
  }

  if (req.method === 'GET') {
    try {
      const accessTokens = await prisma.accessToken.findMany({
        include: {
          createdBy: true
        }
      });
      return res.status(200).json({
        data: accessTokens
      });
    } catch (e) {
      return res.status(500).end();
    }
  } else {
    return res.status(405).end();
  }
}
