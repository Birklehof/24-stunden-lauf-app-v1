import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Layout from '../../components/layout';
import AccessDenied from '../../components/accessDenied';
import { prisma } from '../../../prisma';
import { User } from '@prisma/client';
import { IoCreateOutline, IoTrashOutline } from 'react-icons/io5';
import { useToasts } from 'react-toast-notifications';
import Link from 'next/link';
import isAuthenticated from '../../lib/middleware/sessionBased';

export default function IndexUserPage() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [users, setUsers] = useState<User[]>([]);
  const { addToast } = useToasts();

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/users');
      if (res.status === 200) {
        const json = await res.json();
        setUsers(json.data);
      } else {
        addToast('Ein Fehler ist aufgeregteren', {
          appearance: 'error',
          autoDismiss: true
        });
      }
    };
    fetchData();
  }, [addToast, session]);

  const handleDelete = async (uuid: string) => {
    const res = await fetch(`/api/users/${uuid}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (res.status === 200) {
      const newContent = users.filter((user) => user.uuid !== uuid);
      setUsers(newContent);
      addToast('Benutzer erfolgreich gelöscht', {
        appearance: 'success',
        autoDismiss: true
      });
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
  };

  // When rendering client side don't display anything until loading is complete
  if (typeof window !== 'undefined' && loading) return null;

  if (!isAuthenticated(session, ['superadmin'])) {
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
          <h2 className="card-title">Benutzer</h2>
          <div className="overflow-x-auto">
            <table className="table table-compact w-full">
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>E-Mail</th>
                  <th>Rolle</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users &&
                  users.map((user, index) => (
                    <tr key={user.uuid}>
                      <th>{index + 1}</th>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        {user.role === 'superadmin' ? 'Super-Admin' : user.role === 'helper' ? 'Helfer' : user.role}
                      </td>
                      <td>
                        <Link href={'users/' + user.uuid}>
                          <a className={'editButton'}>
                            <IoCreateOutline />
                          </a>
                        </Link>
                      </td>
                      <td>
                        <button className={'deleteButton'} onClick={() => handleDelete(user.uuid)}>
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
