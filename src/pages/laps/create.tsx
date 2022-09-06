import React, { useState } from 'react';
import Layout from '../../components/layout';
import { useSession } from 'next-auth/react';
import AccessDenied from '../../components/accessDenied';
import { useToasts } from 'react-toast-notifications';
import Link from 'next/link';

export default function CreateSalePage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [number, setNumber] = useState(0);
  const { addToast } = useToasts();

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const body = { number };
      const res = await fetch(`/api/laps/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.status === 200) {
        addToast('Runde erfolgreich hinzugefügt', {
          appearance: 'success',
          autoDismiss: true
        });
      } else if (res.status === 400) {
        const json = await res.json();
        if (json.error) {
          addToast(json.error, {
            appearance: 'error',
            autoDismiss: true
          });
        } else {
          addToast('Ein Fehler ist aufgeregteren', {
            appearance: 'error',
            autoDismiss: true
          });
        }
      } else if (res.status === 403) {
        addToast('Fehlende Berechtigung', {
          appearance: 'error',
          autoDismiss: true
        });
      } else {
        const json = await res.json();
        addToast(json.error.toString(), {
          appearance: 'error',
          autoDismiss: true
        });
      }
      setNumber(0);
    } catch (error) {
      addToast('Ein Fehler ist aufgeregteren', {
        appearance: 'error',
        autoDismiss: true
      });
    }
  };

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  // If the user is not authenticated or does not have the correct role, display access denied message
  if (!session || session.userRole !== 'superadmin') {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="card w-11/12 max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Runde erfassen</h2>
          <form onSubmit={submitData}>
            <input
              name={'number'}
              className="box-border input input-bordered w-full max-w-xs text-center text-6xl p-12 font-['Roboto_Slab'] tracking-widest"
              autoFocus
              onChange={(e) => {
                e.preventDefault();
                if (!isNaN(+e.target.value)) {
                  setNumber(+e.target.value);
                }
              }}
              type={'text'}
              value={Number(number).toString()}
              min={0}
              required
              onWheel={(e) => {
                e.preventDefault();
                setNumber(number + (e.deltaY > 0 ? 1 : -1));
              }}
            />
            <div className="mt-4">
              <div className="flex gap-y-2 w-full justify-evenly flex-col sm:flex-row">
                <input className="btn btn-primary" type={'submit'} value={'Erfassen'} disabled={number === 0} />
                <Link href={'/results'}>
                  <a className={'btn btn-outline btn-error'}>Abbrechen</a>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
