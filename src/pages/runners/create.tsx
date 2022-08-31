import React, { useState } from 'react';
import Layout from '../../components/layout';
import { useSession } from 'next-auth/react';
import AccessDenied from '../../components/accessDenied';
import { useToasts } from 'react-toast-notifications';
import { prisma } from '../../../prisma';
import style from '../../styles/number.module.css';
import { Group } from '@prisma/client';
import Link from "next/link";

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
  }

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
        <div className={'form'}>
          <p>Der Läufer bekommt die Startnummer</p>
          <h1 className={style.newNumber}>{newNumber}</h1>
          <input type="button" value="Okay" onClick={resetForm} />
        </div>
      ) : (
        <div className={'form'}>
          <h1 className={'formHeading'}>Läufer hinzufügen</h1>
          <form onSubmit={submitData}>
            <label htmlFor={'firstName'}>
              <span>
                Vorname <span className={'required'}>*</span>
              </span>
              <input
                id={'firstName'}
                name={'firstName'}
                className={'input-field'}
                autoFocus
                onChange={(e) => setFirstName(e.target.value)}
                type={'text'}
                value={firstName}
                required
              />
            </label>
            <label htmlFor={'lastName'}>
              <span>
                Nachname <span className={'required'}>*</span>
              </span>
              <input
                name={'lastName'}
                className={'input-field'}
                onChange={(e) => setLastName(e.target.value)}
                type={'text'}
                value={lastName}
                required
              />
            </label>
            <label htmlFor={'groupUuid'}>
              <span>Gruppe</span>
              <select
                name={'groupUuid'}
                className={'select-field'}
                onChange={(e) => setGroupUuid(e.target.value)}
                value={groupUuid}
              >
                <option value="">Keine Gruppe</option>
                {groups && groups.map((group) => (
                  <option key={group.uuid} value={group.uuid}>
                    {group.name}
                  </option>
                ))}
                <option value="new">Neue Gruppe</option>
              </select>
            </label>
            {groupUuid === 'new' && (
              <label htmlFor={'newGroupName'}>
                <span>
                  Gruppenname <span className={'required'}>*</span>
                </span>
                <input
                  name={'newGroupName'}
                  className={'input-field'}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  type={'text'}
                  value={newGroupName}
                  required
                />
              </label>
            )}
            <label htmlFor={'grade'}>
              <span>Klasse</span>
              <input
                name={'grade'}
                className={'input-field'}
                onChange={(e) => setGrade(e.target.value)}
                type={'text'}
                value={grade}
              />
            </label>
            <input type="submit" value="Hinzufügen" disabled={!firstName || !lastName} />
            <Link href={'runners'}>
              <a className={'back'}>
                Abbrechen
              </a>
            </Link>
          </form>
        </div>
      )}
    </Layout>
  );
}
