import NextAuth from 'next-auth';
import { prisma } from '../../../../prisma';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
  pages: {
    signIn: '/auth/signin'
  },
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    CredentialsProvider({
      name: 'Access Token',
      credentials: {
        token: { label: 'Access token', type: 'text', placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }
      },
      authorize: async (credentials) => {
        console.log(credentials);

        const token = credentials?.token;

        if (!token) {
          return null;
        }

        const accessToken = await prisma.accessToken.findFirst({
          where: { token: token }
        });

        if (!accessToken) {
          return null;
        }

        await prisma.accessToken.update({
          where: { token: token },
          data: {
            lastUsedAt: new Date().toISOString()
          }
        });

        return {
          isToken: true,
          token: accessToken.token
        };
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    })
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_ID,
    //   clientSecret: process.env.GOOGLE_SECRET
    // })
  ],
  theme: {
    colorScheme: 'light'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.isToken) {
        token.userRole = 'helper';
        token.isToken = true;
        token.token = user.token;
        return token;
      }

      if (token.isToken) {
        return token;
      }

      if (!token.email) {
        throw new Error('Email is required to sign in');
      }

      const userFromDatabase = await prisma.user.findUnique({
        where: {
          email: token.email
        }
      });

      if (!userFromDatabase || !userFromDatabase.role) {
        token.userRole = 'guest';
        return token;
      }

      token.userRole = userFromDatabase.role;
      return token;
    },
    async session({ session, token }) {
      session.userRole = token.userRole;
      return session;
    }
  }
});
