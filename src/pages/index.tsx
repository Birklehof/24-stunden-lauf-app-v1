import React, { useEffect } from 'react';
import Router from 'next/router';
import { useSession } from 'next-auth/react';
import { useToasts } from 'react-toast-notifications';
import FullscreenLoadingSpinner from '../components/fullscreenLoadingSpinner';
import Layout from '../components/layout';

export default function IndexPage() {
  const { data: session } = useSession();
  const { addToast } = useToasts();

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
          await Router.push('/laps/create');
        } else if (role === 'superadmin') {
          addToast('Willkommen zurück' + (session?.user?.name ? ' ' + session?.user?.name : '') + '!', {
            appearance: 'info',
            autoDismiss: true
          });
          await Router.push('/users');
        } else {
          await Router.push('/dashboard');
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
      Router.push('/dashboard');
    }
  }, [addToast, session]);

  return (
    <Layout>
      <FullscreenLoadingSpinner />
    </Layout>
  );
}
