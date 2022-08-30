import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import './styles.css';
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
        <title>Materialausgabe</title>
        <meta charSet={'utf-8'} />
        <meta name={'description'} content={'A small application for the school shop of the Birklehof.'} />
        <meta name={'keywords'} content={'birklehof, school, shop'} />
        <meta name={'author'} content={'Paul Maier'} />
        <meta name={'viewport'} content={'width=device-width, initial-scale=1.0'} />
        <link
          rel={'shortcut icon'}
          sizes={'180x180'}
          href={'https://www.birklehof.de/wp-content/themes/birklehof-v2/favicon/apple-touch-icon.png'}
        />
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
