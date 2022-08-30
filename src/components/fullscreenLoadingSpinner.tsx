import styles from './fullscreenLoadingSpinner.module.css';

export default function FullscreenLoadingSpinner() {
  return (
    <div className={styles.background}>
      <span className={styles.loader}></span>
    </div>
  );
}
