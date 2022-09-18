import React, { useState } from 'react';
import Layout from '../../components/layout';
import { useSession } from 'next-auth/react';
import AccessDenied from '../../components/accessDenied';
import { useToasts } from 'react-toast-notifications';
import Link from 'next/link';

export default function DeleteLapPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [number, setNumber] = useState(0);
  const { addToast } = useToasts();

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const body = { number };
      const res = await fetch(`/api/laps/${number}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.status === 200) {
        addToast('Runde erfolgreich gelöscht', {
          appearance: 'warning',
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
  if (!session || (session.userRole !== 'helper' && session.userRole !== 'superadmin')) {
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
          <h2 className="card-title">Runde löschen</h2>
          <div className="alert alert-warning shadow-lg mb-2">
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current flex-shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>
                Dieses Formular dient dem <span className="font-bold">Löschen</span> von Runden
              </span>
            </div>
          </div>
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
                <input className="btn btn-warning" type={'submit'} value={'Löschen'} disabled={number === 0} />
                <Link href={'/laps/create'}>
                  <a className={'btn btn-outline btn-error'}>Zurück</a>
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
