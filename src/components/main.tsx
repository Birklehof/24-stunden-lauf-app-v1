import styles from './main.module.css';

interface Props {
  children: React.ReactNode;
}

export default function Main({ children }: Props) {
  return <div className={styles.main}>{children}</div>;
}
