import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { useToasts } from 'react-toast-notifications';
import FullscreenLoadingSpinner from '../components/fullscreenLoadingSpinner';
import Layout from '../components/layout';

export default function IndexPage() {
  const { data: session } = useSession();
  const { addToast } = useToasts();
  const router = useRouter();

  useEffect(() => {
    const redirect = async () => {
      const res = await fetch('/api/auth/role');
      if (res.status === 200) {
        const role = await res.json();
        if (role === 'helper') {
          addToast('Willkommen zurück' + (session?.user?.name ? session?.user?.name + ' ' : '') + '!', {
            appearance: 'info',
            autoDismiss: true
          });
          await router.push('/laps/create');
        } else if (role === 'superadmin') {
          addToast('Willkommen zurück' + (session?.user?.name ? ' ' + session?.user?.name : '') + '!', {
            appearance: 'info',
            autoDismiss: true
          });
          await router.push('/users');
        } else {
          await router.push('/results');
        }
      } else {
        addToast('Fehler bei der Authentifizierung', {
          appearance: 'error',
          autoDismiss: true
        });
      }
    };

    if (session) {
      redirect();
    } else {
      router.push('/results');
    }
  }, [addToast, session]);

  return (
    <Layout>
      <FullscreenLoadingSpinner />
    </Layout>
  );
}
