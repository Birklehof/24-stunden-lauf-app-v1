import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../prisma';
import isAuthenticated from '../../../lib/middleware/tokenBased';
import { getToken } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (!(await isAuthenticated(await getToken({ req, secret }), ['superadmin']))) {
    return res.status(403).end();
  }

  const uuid: string = req.query.uuid.toString();

  if (req.method === 'DELETE') {
    await handleDELETE(uuid, res);
  } else {
    return res.status(405).end();
  }
}

// DELETE /api/laps/:number
async function handleDELETE(uuid: string, res: NextApiResponse) {
  try {
    const accessToken = await prisma.accessToken.findUnique({
      where: { uuid }
    });

    if (!accessToken) {
      return res.status(404).end();
    }

    await prisma.accessToken.delete({
      where: { uuid }
    });

    return res.status(200).end();
  } catch (e) {
    console.log(e);
    return res.status(500).end();
  }
}
