import Layout from '../../components/layout';
import { getProviders, signIn, useSession } from 'next-auth/react';
import { IoLogoGoogle, IoLogoApple, IoLogoGithub } from 'react-icons/io5';
import { Provider } from 'next-auth/providers';
import { useState } from 'react';

// Overwrites the default signing-page by next-auth
export default function SignInPage({ providers }: { providers: Provider[] }) {
  const { data: session } = useSession();
  const [accessToken, setAccessToken] = useState('');

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
              <input
                type="text"
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="input input-bordered w-full max-w-xs"
                onChange={(e) => setAccessToken(e.target.value)}
                value={accessToken}
              />
              <button
                onClick={() => signIn('credentials', { token: accessToken })}
                disabled={
                  !new RegExp('^[a-zA-Z0-9]{8}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{4}-[a-zA-Z0-9]{12}$').test(
                    accessToken
                  )
                }
                className="btn btn-primary"
              >
                Sign in with Token
              </button>
            </div>
            <div className="divider">ODER</div>
            <div className="w-full flex flex-col gap-2">
              {providers &&
                Object.values(providers)
                  .filter((provider) => provider.type === 'oauth')
                  .map((provider) => (
                    <button
                      key={provider.name}
                      className="btn gap-2 btn-block btn-secondary"
                      onClick={() => signIn(provider.id)}
                    >
                      <>
                        {provider.id === 'google' && <IoLogoGoogle />}
                        {provider.id === 'github' && <IoLogoGithub />}
                      </>{' '}
                      Sign in with {provider.name}
                    </button>
                  ))}
            </div>
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
