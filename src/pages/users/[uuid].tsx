import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout';
import Router, { useRouter } from 'next/router';
import AccessDenied from '../../components/accessDenied';
import { useSession } from 'next-auth/react';
import { useToasts } from 'react-toast-notifications';
import Link from 'next/link';

export default function UpdateUserPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter();
  const { uuid } = router.query;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const { addToast } = useToasts();

  // Fetch the user with the uuid
  useEffect(() => {
    if (uuid) {
      const fetchData = async () => {
        const res = await fetch(`/api/users/${uuid}`);
        if (res.status === 200) {
          const json = await res.json();
          setName(json.data.name);
          setEmail(json.data.email);
          setRole(json.data.role);
        } else if (res.status === 404) {
          addToast('Benutzer nicht gefunden', {
            appearance: 'error',
            autoDismiss: true
          });
          Router.push('/users');
        } else {
          addToast('Ein Fehler ist aufgeregteren', {
            appearance: 'error',
            autoDismiss: true
          });
          Router.push('/users');
        }
      };
      fetchData();
    }
  }, [addToast, uuid]);

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const body = { name: name, email: email, role: role };
      const res = await fetch(`/api/users/${uuid}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.status === 200) {
        addToast('Benutzer erfolgreich aktualisiert', {
          appearance: 'success',
          autoDismiss: true
        });
        Router.push('/users');
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
      } else if (res.status === 404) {
        addToast('Benutzer nicht gefunden', {
          appearance: 'error',
          autoDismiss: true
        });
      } else {
        addToast('Ein Fehler ist aufgeregteren', {
          appearance: 'error',
          autoDismiss: true
        });
      }
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
          <h2 className="card-title">Benutzer bearbeiten</h2>
          <form onSubmit={submitData}>
            <label className="label">
              <span className="label-text">Name*</span>
            </label>
            <input
              name={'name'}
              className="input input-bordered w-full max-w-xs"
              autoFocus
              onChange={(e) => setName(e.target.value)}
              type={'text'}
              readOnly={role === 'superadmin'}
              value={name}
              required
            />
            <label className="label">
              <span className="label-text">E-Mail*</span>
            </label>
            <input
              name={'email'}
              className="input input-bordered w-full max-w-xs"
              onChange={(e) => setEmail(e.target.value)}
              type={'text'}
              readOnly={role === 'superadmin'}
              value={email}
              required
            />
            <label className="label">
              <span className="label-text">Rolle *</span>
            </label>
            <select
              name={'role'}
              className="select select-bordered w-full max-w-xs"
              onChange={(e) => setRole(e.target.value)}
              value={role}
              required
            >
              <option value={'superadmin'}>Super-Admin</option>
              <option value={'helper'}>Helfer</option>
            </select>
            <div className="mt-4">
              <div className="flex gap-y-2 w-full justify-evenly flex-col sm:flex-row">
                <input
                  className="btn btn-primary"
                  type={'submit'}
                  value={'Speichern'}
                  disabled={!name || !email || !role}
                />
                <Link href={'/users'}>
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
