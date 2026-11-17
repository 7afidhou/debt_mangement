import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { verifyUserPassword, findOrCreateGoogleUser, getUserByEmail } from './db';

const providers: any[] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'admin@store.dz' },
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Please enter both email and password');
      }

      const user = verifyUserPassword(credentials.email, credentials.password);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      return {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        image: user.avatar_url || null,
      };
    },
  }),
];

// Add Google Provider if credentials are set in environment
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google' && user.email) {
        try {
          const dbUser = findOrCreateGoogleUser(
            user.name || 'Google User',
            user.email,
            user.image || null
          );
          user.id = dbUser.id.toString();
          return true;
        } catch (err) {
          console.error('Error linking Google user to SQLite:', err);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'store-debt-manager-fallback-secret-2026',
};
