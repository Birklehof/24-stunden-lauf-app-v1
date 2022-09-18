import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import AccessDenied from '../../components/accessDenied';
import { prisma } from '../../../prisma';
import { AccessToken } from '@prisma/client';
import { IoTrashOutline } from 'react-icons/io5';
import { useToasts } from 'react-toast-notifications';

interface AccessTokenWithCreatedBy extends AccessToken {
  createdBy: {
    name: string;
  };
}

export async function getServerSideProps(_context: any) {
  let accessTokens = await prisma.accessToken.findMany({
    include: {
      createdBy: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  accessTokens = JSON.parse(JSON.stringify(accessTokens));
  return { props: { accessTokens } };
}

export default function IndexAccessTokensPage({ initAccessTokens }: { initAccessTokens: AccessTokenWithCreatedBy[] }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [accessTokens, setAccessTokens] = useState(initAccessTokens);
  const { addToast } = useToasts();

  // Fetch access tokens from protected route
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/accessTokens');
      if (res.status === 200) {
        const json = await res.json();
        setAccessTokens(json.data);
      } else {
        addToast('Ein Fehler ist aufgeregteren', {
          appearance: 'error',
          autoDismiss: true
        });
      }
    };
    fetchData();
  }, [addToast, session]);

  const handleCreate = async () => {
    const res = await fetch('/api/accessTokens/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (res.status === 200) {
      const json = await res.json();
      setAccessTokens([json.data, ...accessTokens]);
      addToast('Access Token erfolgreich erstellt', {
        appearance: 'success',
        autoDismiss: true
      });
    } else if (res.status === 403) {
      addToast('Fehlende Berechtigung', {
        appearance: 'error',
        autoDismiss: true
      });
    } else {
      addToast('Ein Fehler ist aufgeregteren', {
        appearance: 'error',
        autoDismiss: true
      });
    }
  };

  const handleDelete = async (uuid: string) => {
    const res = await fetch(`/api/accessTokens/${uuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (res.status === 200) {
      const newContent = accessTokens.filter((accessToken) => accessToken.uuid !== uuid);
      setAccessTokens(newContent);
      addToast('Access Token erfolgreich gelöscht', {
        appearance: 'success',
        autoDismiss: true
      });
    } else if (res.status === 403) {
      addToast('Fehlende Berechtigung', {
        appearance: 'error',
        autoDismiss: true
      });
    } else if (res.status === 404) {
      addToast('Access Token nicht gefunden', {
        appearance: 'error',
        autoDismiss: true
      });
    } else {
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
      <div className="card w-11/12 max-w-4xl h-full bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Access Tokens</h2>
          <div className="overflow-x-auto">
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th>Token</th>
                  <th>Erstellt von</th>
                  <th>Erstellt</th>
                  <th>Zuletzt genutzt</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={6}>
                    <p onClick={handleCreate} className="text-center text-primary cursor-pointer">
                      {accessTokens?.length === 0 ? 'Erstes' : 'Weiteres'} Access Tokens hinzufügen
                    </p>
                  </td>
                </tr>
                {accessTokens &&
                  accessTokens.map((accessToken, index) => (
                    <tr key={accessToken.uuid}>
                      <td>{accessToken.token}</td>
                      <td>{accessToken.createdBy?.name}</td>
                      <td>
                        {new Date(accessToken.createdAt).toLocaleDateString('de')}{' '}
                        {new Date(accessToken.createdAt).toLocaleTimeString('de')}
                      </td>
                      <td>
                        {new Date(accessToken.lastUsedAt).toLocaleDateString('de')}{' '}
                        {new Date(accessToken.lastUsedAt).toLocaleTimeString('de')}
                      </td>
                      <td>
                        <button className={'deleteButton'} onClick={() => handleDelete(accessToken.uuid)}>
                          <IoTrashOutline />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
