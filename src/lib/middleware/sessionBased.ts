import { Session } from 'next-auth';

// This function checks if a given session has the required role, it's used in the above websites
export default async function isAuthenticated(session: Session | null, allowedRoles: string[]) {
  if (!session) {
    console.log('No session');

    return false;
  }
  const { userRole } = session;
  console.log(userRole);
  console.log(JSON.stringify(allowedRoles?.includes(userRole)));
  return allowedRoles?.includes(userRole);
}
