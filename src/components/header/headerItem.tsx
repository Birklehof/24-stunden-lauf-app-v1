import React, { useState } from 'react';
import styles from './headerItem.module.css';
import { useRouter } from 'next/router';
import Link from 'next/link';

interface HeaderItemProps {
  text: string;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  action?: (e: any) => Promise<void>;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  menu?: boolean;
}

export default function HeaderItem({ href, target = '_self', action, text, icon, children, menu }: HeaderItemProps) {
  const router = useRouter();
  const pathnameWithoutLastElement = router.pathname.substring(0, router.pathname.lastIndexOf('/'));
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {href && !children && (
        <Link target={target} href={href}>
          <div className={`${styles.headerLink} ${router.pathname === href ? styles.active : ''}`}>
            {icon}{' '}
            <a>
              {text}
            </a>
          </div>
        </Link>
      )}
      {href && children && (
        <div className={styles.dropdown}>
          <Link target={target} href={href}>
            <div
              className={`${styles.headerLink} ${
                router.pathname === href || pathnameWithoutLastElement === href ? styles.active : ''
              }`}
            >
              {icon}{' '}
              <a>
                {text}
              </a>
            </div>
          </Link>
          <div className={styles.dropdownContent}>
            <div className={styles.dropdownContentInner}>{children}</div>
          </div>
        </div>
      )}
      {action && (
        <button className={styles.headerButton} onClick={action}>
          {icon} <p>{text}</p>
        </button>
      )}
      {menu && children && (
        <div className={styles.dropdown}>
          <button
            className={styles.headerButton}
            onClick={() => {
              setShowMenu(!showMenu);
            }}
          >
            {icon} <p>{text}</p>
          </button>
          <div className={styles.dropdownContent} style={{ display: showMenu ? 'block' : 'none' }}>
            <div className={styles.dropdownContentInner}>{children}</div>
          </div>
        </div>
      )}
    </>
  );
}
