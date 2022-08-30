import { getToken } from 'next-auth/jwt';
import type { NextApiRequest, NextApiResponse } from 'next';

const secret = process.env.NEXTAUTH_SECRET;

// GET /api/auth/role
export default async function getRole (req: NextApiRequest, res: NextApiResponse) {
  const token = await getToken({ req, secret });
  if (token) {
    return res.send(JSON.stringify(token.userRole, null, 2));
  } else {
    return res.send(JSON.stringify('guest', null, 2));
  }
};
