import Layout from '../../components/layout';
import { getProviders, signIn, useSession } from 'next-auth/react';
import { IoLogoGoogle, IoLogoApple, IoLogoGithub, IoArrowRedoOutline } from 'react-icons/io5';
import { Provider } from 'next-auth/providers';
import Link from 'next/link';

// Overwrites the default signing-page by next-auth
export default function SignIn({ providers }: { providers: Provider[] }) {
  const { data: session } = useSession();
  if (session) {
    document.location.href = '/';
  }

  return (
    <Layout>
      <div className="card w-11/12 max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Anmelden</h2>
          <div className="flex flex-col w-full border-opacity-50">
            <div className="w-full flex flex-col gap-2">
              {providers &&
                Object.values(providers).map((provider) => (
                  <button
                    key={provider.name}
                    className="btn gap-2 btn-block btn-secondary"
                    onClick={() => signIn(provider.id)}
                  >
                    <>
                      {provider.id === 'google' && <IoLogoGoogle />}
                      {provider.id === 'apple' && <IoLogoApple />}
                      {provider.id === 'github' && <IoLogoGithub />}
                    </>{' '}
                    Sign in with {provider.name}
                  </button>
                ))}
            </div>
            <div className="divider">ODER</div>
            <Link href={'/results'}>
              <button className="btn btn-primary">Weiter ohne Anmeldung</button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers }
  };
}
