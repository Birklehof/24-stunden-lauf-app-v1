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
          <Link href={'/'}>
            <a className="btn btn-ghost normal-case text-lg lg:btn-sm rounded-full lg:py-0">
              <span style={{ color: '#004f49' }}>24-Stunden-Lauf</span>
            </a>
          </Link>
        </div>
        <div className="navbar-start lg:hidden">
          <div className="dropdown">
            <label tabIndex={0} className="btn btn-outline btn-primary btn-circle">
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
              className="menu menu-compact dropdown-content mt-3 p-2 shadow rounded-box w-64 bg-accent gap-y-2"
            >
              <li>
                <Link href={'/results'}>
                  <a className="btn btn-sm btn-outline btn-primary rounded-full py-0 justify-start">Ergebnisse</a>
                </Link>
              </li>
              <li className="color-primary">
                <Link href={'/results/ranking/runners'}>
                  <a className="btn btn-sm btn-ghost rounded-full py-0 justify-start ml-4">
                    <span style={{ color: '#004f49' }}>Rangliste Läufer</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href={'/results/ranking/grades'}>
                  <a className="btn btn-sm btn-ghost rounded-full py-0 justify-start ml-4">
                    <span style={{ color: '#004f49' }}>Rangliste Klassen</span>
                  </a>
                </Link>
              </li>
              <li>
                <Link href={'/results/ranking/houses'}>
                  <a className="btn btn-sm btn-ghost rounded-full py-0 justify-start ml-4">
                    <span style={{ color: '#004f49' }}>Rangliste Häuser</span>
                  </a>
                </Link>
              </li>
              {role == 'superadmin' && (
                <li>
                  <Link href={'/results/export'}>
                    <a className="btn btn-sm btn-ghost rounded-full py-0 justify-start ml-4">
                      <span style={{ color: '#004f49' }}>Exportieren</span>
                    </a>
                  </Link>
                </li>
              )}
              {(role === 'helper' || role == 'superadmin') && (
                <li>
                  <Link href={'/laps/create'}>
                    <a className="btn btn-sm btn-outline btn-primary rounded-full py-0 justify-start">
                      Runden erfassen
                    </a>
                  </Link>
                </li>
              )}
              {(role == 'helper' || role == 'superadmin') && (
                <>
                  <li>
                    <Link href={'/runners'}>
                      <a className="btn btn-sm btn-outline btn-primary rounded-full py-0 justify-start">Läufer</a>
                    </Link>
                  </li>
                  <li>
                    <Link href={'/runners/create'}>
                      <a className="btn btn-sm btn-ghost rounded-full py-0 justify-start ml-4">
                        <span style={{ color: '#004f49' }}>Hinzufügen</span>
                      </a>
                    </Link>
                  </li>
                  {role == 'superadmin' && (
                    <li>
                      <Link href={'/runners/import'}>
                        <a className="btn btn-sm btn-ghost rounded-full py-0 justify-start ml-4">
                          <span style={{ color: '#004f49' }}>Importieren</span>
                        </a>
                      </Link>
                    </li>
                  )}
                  {role == 'superadmin' && (
                    <li>
                      <Link href={'/runners/export'}>
                        <a className="btn btn-sm btn-ghost rounded-full py-0 justify-start ml-4">
                          <span style={{ color: '#004f49' }}>Exportieren</span>
                        </a>
                      </Link>
                    </li>
                  )}
                </>
              )}
              {role == 'superadmin' && (
                <>
                  <li>
                    <Link href={'/users'}>
                      <a className="btn btn-sm btn-outline btn-primary rounded-full py-0 justify-start">Benutzer</a>
                    </Link>
                  </li>
                  <li>
                    <Link href={'/users/create'}>
                      <a className="btn btn-sm btn-ghost rounded-full py-0 justify-start ml-4">
                        <span style={{ color: '#004f49' }}>Hinzufügen</span>
                      </a>
                    </Link>
                  </li>
                </>
              )}
              {role == 'superadmin' && (
                <li>
                  <Link href={'/accessTokens'}>
                    <a className="btn btn-sm btn-outline btn-primary rounded-full py-0 justify-start">Access Tokens</a>
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal p-0">
            <li tabIndex={0}>
              <a role={'button'} className="btn gap-2 btn-sm btn-outline btn-primary mx-2 rounded-full py-0">
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
              <ul className="p-2 bg-accent gap-y-2">
                <li>
                  <Link href={'/results'}>
                    <a className="btn btn-sm btn-outline btn-primary rounded-full py-0">Übersicht</a>
                  </Link>
                </li>
                <li>
                  <Link href={'/results/ranking/runners'}>
                    <a className="btn btn-sm btn-outline btn-primary rounded-full py-0">Rangliste Läufer</a>
                  </Link>
                </li>
                <li>
                  <Link href={'/results/ranking/grades'}>
                    <a className="btn btn-sm btn-outline btn-primary rounded-full py-0">Rangliste Klassen</a>
                  </Link>
                </li>
                <li>
                  <Link href={'/results/ranking/houses'}>
                    <a className="btn btn-sm btn-outline btn-primary rounded-full py-0">Rangliste Häuser</a>
                  </Link>
                </li>
                {role == 'superadmin' && (
                  <li>
                    <Link href={'/results/export'}>
                      <a className="btn btn-sm btn-outline btn-primary rounded-full py-0">Exportieren</a>
                    </Link>
                  </li>
                )}
              </ul>
            </li>
            {(role === 'helper' || role == 'superadmin') && (
              <li>
                <Link href={'/laps/create'}>
                  <a className="btn btn-sm btn-outline btn-primary mx-2 rounded-full py-0">Runden erfassen</a>
                </Link>
              </li>
            )}
            {(role == 'helper' || role == 'superadmin') && (
              <li tabIndex={0}>
                <a role={'button'} className="btn gap-2 btn-sm btn-outline btn-primary mx-2 rounded-full py-0">
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
                <ul className="p-2 bg-accent gap-y-2">
                  <li>
                    <Link href={'/runners'}>
                      <a className="btn btn-sm btn-outline btn-primary rounded-full py-0">Einsehen</a>
                    </Link>
                  </li>
                  <li>
                    <Link href={'/runners/create'}>
                      <a className="btn btn-sm btn-outline btn-primary rounded-full py-0">Hinzufügen</a>
                    </Link>
                  </li>
                  {role == 'superadmin' && (
                    <li>
                      <Link href={'/runners/import'}>
                        <a className="btn btn-sm btn-outline btn-primary rounded-full py-0">Importieren</a>
                      </Link>
                    </li>
                  )}
                  {role == 'superadmin' && (
                    <li>
                      <Link href={'/runners/export'}>
                        <a className="btn btn-sm btn-outline btn-primary rounded-full py-0">Exportieren</a>
                      </Link>
                    </li>
                  )}
                </ul>
              </li>
            )}
            {role == 'superadmin' && (
              <li tabIndex={0}>
                <a role={'button'} className="btn gap-2 btn-sm btn-outline btn-primary mx-2 rounded-full py-0">
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
                <ul className="p-2 bg-accent gap-y-2">
                  <li>
                    <Link href={'/users'}>
                      <a className="btn btn-sm btn-outline btn-primary rounded-full py-0">Einsehen</a>
                    </Link>
                  </li>
                  <li>
                    <Link href={'/users/create'}>
                      <a className="btn btn-sm btn-outline btn-primary rounded-full py-0">Hinzufügen</a>
                    </Link>
                  </li>
                </ul>
              </li>
            )}
            {role == 'superadmin' && (
              <li>
                <Link href={'/accessTokens'}>
                  <a className="btn btn-sm btn-outline btn-primary mx-2 rounded-full py-0">Access Tokens</a>
                </Link>
              </li>
            )}
          </ul>
        </div>
        <div className="navbar-end">
          {session && (
            <a className="btn btn-ghost normal-case text-lg lg:btn-sm rounded-full lg:py-0" onClick={handleSignOut}>
              <span style={{ color: '#004f49' }}>Abmelden</span>
            </a>
          )}
          {!session && (
            <Link href={'/auth/signin'} target={'_blank'}>
              <a className="btn btn-primary normal-case text-lg lg:btn-sm rounded-full lg:py-0">
                <span>Anmelden</span>
              </a>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
