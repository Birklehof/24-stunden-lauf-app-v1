import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout';
import Router, { useRouter } from 'next/router';
import AccessDenied from '../../components/accessDenied';
import { useSession } from 'next-auth/react';
import { useToasts } from 'react-toast-notifications';

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
      {JSON.stringify(typeof window)}
      {JSON.stringify(loading)}
      <div className={'form'}>
        <h1 className={'formHeading'}>Benutzer bearbeiten</h1>
        <form onSubmit={submitData}>
          <label htmlFor="name">
            <span>
              Name <span className="required">*</span>
            </span>
            <input
              name={'name'}
              className={'input-field'}
              autoFocus
              onChange={(e) => setName(e.target.value)}
              type="text"
              value={name}
              readOnly={role === 'superadmin'}
              required
            />
          </label>
          <label htmlFor="email">
            <span>
              E-Mail <span className="required">*</span>
            </span>
            <input
              name={'email'}
              className={'input-field'}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=""
              type="text"
              value={email}
              readOnly={role === 'superadmin'}
              required
            />
          </label>
          {role !== 'superadmin' ? (
            <label htmlFor="role">
              <span>
                Rolle <span className="required">*</span>
              </span>
              <select
                name={'role'}
                className="select-field"
                onChange={(e) => setRole(e.target.value)}
                value={role}
                required
              >
                <option value="helper">Helfer</option>
              </select>
            </label>
          ) : null}
          {role === 'superadmin' ? (
            <label htmlFor="role">
              <span>Rolle </span>
              <input
                name={'role'}
                className={'input-field'}
                onChange={(e) => setRole(e.target.value)}
                value={'Super-Admin'}
                type={'text'}
                required
                readOnly
              ></input>
            </label>
          ) : null}
          <label>
            <input type="submit" value="Speichern" disabled={!name || !email || !role || role === 'superadmin'} />
          </label>
          <label>
            <a className={'back'} href="#" onClick={() => Router.push('/users')}>
              Abbrechen
            </a>
          </label>
        </form>
      </div>
    </Layout>
  );
}
