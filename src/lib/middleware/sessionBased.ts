import { Session } from 'next-auth';

// This function checks if a given session has the required role, it's used in the above websites
export default async function isAuthenticated(session: Session | null, allowedRoles: string[]) {
  if (!session) {
    return false;
  }
  const { userRole } = session;
  return allowedRoles?.includes(userRole);
}
