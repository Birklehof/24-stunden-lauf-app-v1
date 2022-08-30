import React, { useState } from 'react';
import Layout from '../../components/layout';
import Router from 'next/router';
import { useSession } from 'next-auth/react';
import AccessDenied from '../../components/accessDenied';
import { useToasts } from 'react-toast-notifications';
import style from '../../styles/number.module.css';

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
      <div className={'form'}>
        <h1 className={'formHeading'}>Runden zählen</h1>
        <form onSubmit={submitData}>
          <input
            name={'number'}
            className={style.inputNumber}
            autoFocus
            onChange={(e) => setNumber(+e.target.value)}
            type={'number'}
            value={Number(number).toString()}
            min={0}
            required
            onWheel={(e) => {
              e.preventDefault();
              setNumber(number + (e.deltaY > 0 ? 1 : -1));
            }}
          />
          <input type="submit" value="Runde hinzufügen" />
          <a className={'back'} href="#" onClick={() => Router.push('/')}>
            Abbrechen
          </a>
        </form>
      </div>
    </Layout>
  );
}
