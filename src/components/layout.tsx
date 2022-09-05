import Header from './header';
import style from './layout.module.css';
import { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  useEffect(() => {
    // There is what I suppose to be a bug in the next-auth library which creates multiple instances of the layout component. This is a workaround to prevent this bug.
    const layoutComponents = document.getElementsByClassName(style.layout);
    if (layoutComponents.length > 1) {
      document.location.href = '/';
    }
  }, []);

  return (
    <div className={style.layout}>
      <Header />
      <main className={style.main}>{children}</main>
    </div>
  );
}
