import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout';
import { useSession } from 'next-auth/react';
import AccessDenied from '../../components/accessDenied';
import { useToasts } from 'react-toast-notifications';
import { prisma } from '../../../prisma';
import { Group } from '@prisma/client';
import Link from 'next/link';

export async function getServerSideProps(_context: any) {
  const groups = await prisma.group.findMany();
  return { props: { groups } };
}

export default function CreateRunnerPage({ init_groups }: { init_groups: Group[] }) {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const [groups, setGroups] = useState(init_groups);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [groupUuid, setGroupUuid] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [grade, setGrade] = useState('');
  const [newNumber, setNewNumber] = useState(0);
  const { addToast } = useToasts();

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setGroupUuid('');
    setNewGroupName('');
    setGrade('');
    setNewNumber(0);
    document.getElementById('firstName')?.focus();
  };

  const getGroups = async () => {
    const res = await fetch('/api/groups');
    if (res.status === 200) {
      const json = await res.json();
      setGroups(json.data);
    } else {
      addToast('Ein Fehler ist aufgeregteren', {
        appearance: 'error',
        autoDismiss: true
      });
    }
  };

  useEffect(() => {
    getGroups();
  });

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const body = {
        firstName: firstName,
        lastName: lastName,
        groupUuid: groupUuid,
        newGroupName: newGroupName,
        grade: grade
      };
      const res = await fetch(`/api/runners/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.status === 200) {
        const json = await res.json();
        addToast('Läufer erfolgreich erstellt', {
          appearance: 'success',
          autoDismiss: true
        });
        await getGroups();
        setNewNumber(json.number);
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
          appearance: 'success',
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
      {newNumber ? (
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Der Läufer bekommt die Startnummer</h2>
            <h1 className="w-full text-center my-4 text-6xl font-['Roboto_Slab'] tracking-widest">{newNumber}</h1>
            <div className="card-actions justify-end">
              <button className="btn btn-primary" onClick={resetForm}>
                Okay
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card w-11/12 max-w-sm bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Läufer hinzufügen</h2>
            <form onSubmit={submitData}>
              <label className="label">
                <span className="label-text">Vorname*</span>
              </label>
              <input
                name={'firstName'}
                className="input input-bordered w-full max-w-xs"
                autoFocus
                onChange={(e) => setFirstName(e.target.value)}
                type={'text'}
                value={firstName}
                required
              />
              <label className="label">
                <span className="label-text">Nachname*</span>
              </label>
              <input
                name={'lastName'}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setLastName(e.target.value)}
                type={'text'}
                value={lastName}
                required
              />
              <label className="label">
                <span className="label-text">Gruppe</span>
              </label>
              <select
                name={'groupUuid'}
                className="select select-bordered w-full max-w-xs"
                onChange={(e) => setGroupUuid(e.target.value)}
                value={groupUuid}
              >
                <option value="">Keine Gruppe</option>
                {groups &&
                  groups.map((group) => (
                    <option key={group.uuid} value={group.uuid}>
                      {group.name}
                    </option>
                  ))}
                <option value="new">Neue Gruppe</option>
              </select>
              {groupUuid === 'new' && (
                <>
                  <label className="label">
                    <span className="label-text">Gruppenname</span>
                  </label>
                  <input
                    name={'newGroupName'}
                    className="input input-bordered w-full max-w-xs"
                    onChange={(e) => setNewGroupName(e.target.value)}
                    type={'text'}
                    value={newGroupName}
                    required
                  />
                </>
              )}
              <label className="label">
                <span className="label-text">Klasse</span>
              </label>
              <input
                name={'grade'}
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setGrade(e.target.value)}
                type={'text'}
                value={grade}
              />
              <div className="mt-4">
                <div className="flex gap-y-2 w-full justify-evenly flex-col sm:flex-row">
                  <input
                    className="btn btn-primary"
                    type={'submit'}
                    value={'Hinzufügen'}
                    disabled={!firstName || !lastName || (groupUuid === 'new' && !newGroupName)}
                  />
                  <Link href={'/users'}>
                    <a className={'btn btn-outline btn-error'}>Abbrechen</a>
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
