import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useToasts } from 'react-toast-notifications';
import Link from 'next/link';

export default function Header() {
  const router = useRouter();
  const { data: session } = useSession();
  const [role, setRole] = useState('');
  const { addToast } = useToasts();

  useEffect(() => {
    const fetchRole = async () => {
      const res = await fetch('/api/auth/role');
      if (res.status === 200) {
        const json = await res.json();
        setRole(json);
      } else {
        addToast('Fehler bei der Authentifizierung', {
          appearance: 'error',
          autoDismiss: true
        });
      }
    };
    fetchRole();
  }, [addToast, session]);

  const handleSignOut = async (_e: any) => {
    await signOut();
    document.location.href = '/';
  };

  return (
    <>
      <div className="navbar bg-secondary z-[100]">
        <div className="navbar-start hidden lg:flex">
          <Link href={'https://www.birklehof.de'} target={'_blank'}>
            <a className="btn btn-ghost normal-case text-xl">Birklehof</a>
          </Link>
        </div>
        <div className="navbar-start lg:hidden">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <Link href={'/results'}>
                  <a>Ergebnisse</a>
                </Link>
              </li>
              <li>
                <Link href={'/results/rankingRunners'}>
                  <a>{' > '} Rangliste Läufer</a>
                </Link>
              </li>
              <li>
                <Link href={'/results/rankingGroups'}>
                  <a>{' > '} Rangliste Gruppen</a>
                </Link>
              </li>
              {(role === 'helper' || role == 'superadmin') && (
                <li>
                  <Link href={'/laps/create'}>
                    <a>Runden erfassen</a>
                  </Link>
                </li>
              )}
              {(role == 'helper' || role == 'superadmin') && (
                <>
                  <li>
                    <Link href={'/runners'}>
                      <a>Läufer</a>
                    </Link>
                  </li>
                  <li>
                    <Link href={'/runners/create'}>
                      <a>{' > '} Hinzufügen</a>
                    </Link>
                  </li>
                </>
              )}
              {role == 'superadmin' && (
                <>
                  <li>
                    <Link href={'/users'}>
                      <a>Benutzer</a>
                    </Link>
                  </li>
                  <li>
                    <Link href={'/users/create'}>
                      <a>{' > '} Hinzufügen</a>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal p-0">
            <li tabIndex={0}>
              <Link href={'/results'}>
                <a>
                  Ergebnisse
                  <svg
                    className="fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                  >
                    <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                  </svg>
                </a>
              </Link>
              <ul className="p-2 bg-accent">
                <li>
                  <Link href={'/results'}>
                    <a>Übersicht</a>
                  </Link>
                </li>
                <li>
                  <Link href={'/results/rankingRunners'}>
                    <a>Rangliste Läufer</a>
                  </Link>
                </li>
                <li>
                  <Link href={'/results/rankingGroups'}>
                    <a>Rangliste Gruppen</a>
                  </Link>
                </li>
              </ul>
            </li>
            {(role === 'helper' || role == 'superadmin') && (
              <li>
                <Link href={'/laps/create'}>
                  <a>Runden erfassen</a>
                </Link>
              </li>
            )}
            {(role == 'helper' || role == 'superadmin') && (
              <li tabIndex={0}>
                <Link href={'/runners'}>
                  <a>
                    Läufer
                    <svg
                      className="fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                    </svg>
                  </a>
                </Link>
                <ul className="p-2 bg-accent">
                  <li>
                    <Link href={'/runners'}>
                      <a>Einsehen</a>
                    </Link>
                  </li>
                  <li>
                    <Link href={'/runners/create'}>
                      <a>Hinzufügen</a>
                    </Link>
                  </li>
                </ul>
              </li>
            )}
            {role == 'superadmin' && (
              <li tabIndex={0}>
                <Link href={'/users'}>
                  <a>
                    Benutzer
                    <svg
                      className="fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
                    </svg>
                  </a>
                </Link>
                <ul className="p-2 bg-accent">
                  <li>
                    <Link href={'/users'}>
                      <a>Einsehen</a>
                    </Link>
                  </li>
                  <li>
                    <Link href={'/users/create'}>
                      <a>Hinzufügen</a>
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
        <div className="navbar-end">
          {session && (
            <a className="btn btn-ghost normal-case text-xl" onClick={handleSignOut}>
              Abmelden
            </a>
          )}
          {!session && (
            <Link href={'/auth/signin'} target={'_blank'}>
              <a className="btn btn-primary normal-case text-xl">Anmelden</a>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
