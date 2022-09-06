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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={''} />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto+Slab:wght@500&display=swap"
          rel="stylesheet"
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
