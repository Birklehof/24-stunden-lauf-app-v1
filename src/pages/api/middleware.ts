import { JWT } from 'next-auth/jwt';

// This function checks if a given token has the required role, it's used in the above api routes
export default async function middleware(token: JWT | null, allowedRoles: string[]) {
  if (!token) {
    return false;
  }
  const { userRole } = token;
  if (!userRole) {
    return false;
  }
  return allowedRoles.includes(userRole);
}
