import styles from './accessDenied.module.css';
import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className={styles.background}>
      <div className={styles.textContainer}>
        <h1 className={styles.h1}>Zugriff verweigert</h1>
        <Link href={'/auth/signin'}>
          <a className={styles.link}>Zurück zur Anmeldung</a>
        </Link>
      </div>
    </div>
  );
}
