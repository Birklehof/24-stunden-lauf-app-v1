import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  IoAddOutline,
  IoAlbumsOutline,
  IoPersonAddOutline,
  IoChevronDownOutline,
  IoMenuOutline,
  IoLinkOutline,
  IoLogOutOutline,
  IoStopwatchOutline, IoTrophyOutline, IoPeopleOutline, IoLogInOutline
} from 'react-icons/io5';
import styles from './header.module.css';
import { useToasts } from 'react-toast-notifications';
import HeaderItem from './header/headerItem';

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

  const handleSignOut = async (_e:any) => {
    await signOut();
    document.location.href = '/';
  };

  const nav = (
    <>
      <HeaderItem href={'https://www.birklehof.de/'} target={'_blank'} text={'Birklehof'} icon={<IoLinkOutline />} />
      {router.pathname !== '/auth/signin' && (
        <>
          <HeaderItem text={'Dashboard'} href={'/dashboard'} icon={<IoChevronDownOutline />}>
            <HeaderItem href={'/dashboard'} text={'Läufer'} icon={<IoTrophyOutline />} />
            <HeaderItem href={'/dashboard/groups'} text={'Gruppen'} icon={<IoPeopleOutline />} />
          </HeaderItem>
          {(role === 'helper' || role == 'superadmin') && (
            <HeaderItem href={'/laps/create'} text={'Runden zählen'} icon={<IoStopwatchOutline />} />
          )}
          {(role == 'helper' || role == 'superadmin') && (
            <HeaderItem text={'Läufer'} href={'/runners'} icon={<IoChevronDownOutline />}>
              <HeaderItem href={'/runners'} text={'Einsehen'} icon={<IoAlbumsOutline />} />
              <HeaderItem href={'/runners/create'} text={'Hinzufügen'} icon={<IoAddOutline />} />
            </HeaderItem>
          )}
          {role == 'superadmin' && (
            <HeaderItem text={'Benutzer'} href={'/users'} icon={<IoChevronDownOutline />}>
              <HeaderItem href={'/users'} text={'Einsehen'} icon={<IoAlbumsOutline />} />
              <HeaderItem href={'/users/create'} text={'Hinzufügen'} icon={<IoPersonAddOutline />} />
            </HeaderItem>
          )}
          {session && <HeaderItem text={'Abmelden'} action={handleSignOut} icon={<IoLogOutOutline />} />}
          {!session && <HeaderItem href={'/auth/signin'} text={'Anmelden'} icon={<IoLogInOutline />} />}
        </>
      )}
    </>
  );

  return (
    <>
      <div className={styles.topNav}>{nav}</div>
      <div className={styles.topNavMobile}>
        <HeaderItem text={'Menu'} menu={true} icon={<IoMenuOutline />}>
          {nav}
        </HeaderItem>
      </div>
    </>
  );
}
