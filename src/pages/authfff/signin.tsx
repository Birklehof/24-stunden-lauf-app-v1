import Layout from '../../components/layout';
import { getProviders, signIn, useSession } from 'next-auth/react';
import { IoLogoGoogle, IoLogoApple, IoLogoGithub, IoArrowRedoOutline } from 'react-icons/io5';
import { Provider } from 'next-auth/providers';
import { useState } from 'react';
import { useRouter } from 'next/router';

// Overwrites the default signing-page by next-auth
export default function SignIn({ providers }: { providers: Provider[] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [accessToken, setAccessToken] = useState('');
  if (session) {
    document.location.href = '/';
  }

  const signInWithToken = async () => {
    const res = await fetch(`/api/auth/accessToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: accessToken })
    });
    if (res.status === 200) {
      router.push('/');
    }
  };

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
                onClick={signInWithToken}
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
                Object.values(providers).map((provider) => (
                  <>
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
                  </>
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
