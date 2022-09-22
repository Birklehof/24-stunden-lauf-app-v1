import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import '../styles/global.css';
import 'react-csv';
import { ToastProvider } from 'react-toast-notifications';
import Head from 'next/head';

// Use of the <SessionProvider> is mandatory to allow components that call
// `useSession()` anywhere in your application to access the `session` object.
export default function App({ Component, pageProps }: AppProps) {
  const AppComponent = Component as any;

  return (
    <>
      <Head>
        <title>24-Stunden-Lauf</title>
      </Head>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        {/*
 // @ts-ignore */}
        <ToastProvider>
          <AppComponent {...pageProps} />
        </ToastProvider>
      </SessionProvider>
    </>
  );
}
