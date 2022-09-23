import React, { useState } from 'react';
import Layout from '../../components/layout';
import Router from 'next/router';
import AccessDenied from '../../components/accessDenied';
import { useSession } from 'next-auth/react';
import { useToasts } from 'react-toast-notifications';
import isAuthenticated from '../../lib/middleware/sessionBased';

export default function ImportProductsPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [file, setFile]: any = useState();
  const [_createObjectURL, setCreateObjectURL] = useState('');
  const { addToast } = useToasts();

  const uploadToClient = (event: any) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];

      // Check if file is a CSV file
      if (i.name.split('.').at(-1) !== 'csv') {
        addToast('Bitte lade eine CSV-Datei hoch', {
          appearance: 'warning',
          autoDismiss: true
        });
        return;
      }

      setFile(i);
      setCreateObjectURL(URL.createObjectURL(i));
    }
  };

  const uploadToServer = async (_event: any) => {
    const body = new FormData();
    if (file) {
      body.append('file', file);
    } else {
      addToast('Bitte lade eine CSV-Datei hoch', {
        appearance: 'warning',
        autoDismiss: true
      });
      return;
    }
    const res = await fetch('/api/runners/import', {
      method: 'POST',
      body
    });
    if (res.status === 200) {
      addToast('Datei erfolgreich hochgeladen', {
        appearance: 'success',
        autoDismiss: true
      });
      Router.push('/runners');
    } else if (res.status === 400) {
      const json = await res.json();
      if (json.error) {
        addToast(json.error, {
          appearance: 'error',
          autoDismiss: true
        });
      } else {
        addToast('Datei ungültig', {
          appearance: 'error',
          autoDismiss: true
        });
      }
    } else {
      addToast('Ein Fehler ist aufgeregteren', {
        appearance: 'error',
        autoDismiss: true
      });
    }
  };

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  if (
    async () => {
      (await isAuthenticated(session, ['superadmin'])) !== true;
    }
  ) {
    return (
      <Layout>
        <AccessDenied />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Schüler importieren</h2>
          {file ? <p>{file.name}</p> : <p>Keine Datei ausgewählt</p>}
          <label htmlFor="filePicker" className="btn btn-primary">
            Schülerliste auswählen
          </label>
          <input id="filePicker" hidden={true} type="file" name="docsUpload" onChange={uploadToClient} />
          <button disabled={!file} className="btn btn-primary" onClick={uploadToServer}>
            Hochladen
          </button>
        </div>
      </div>
    </Layout>
  );
}
