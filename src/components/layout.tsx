import Header from './header';
import layoutStyle from './layout.module.css';
import { useEffect } from 'react';

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  useEffect(() => {
    // There is what I suppose to be a bug in the next-auth library which creates multiple instances of the layout component. This is a workaround to prevent this bug.
    const layoutComponents = document.getElementsByClassName(layoutStyle.layout);
    if (layoutComponents.length > 1) {
      document.location.href = '/';
    }
  }, []);

  return (
    <div className={layoutStyle.layout}>
      <Header />
      <main className={layoutStyle.main}>{children}</main>
    </div>
  );
}
