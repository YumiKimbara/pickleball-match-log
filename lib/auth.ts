import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import PostgresAdapter from "@auth/pg-adapter";
import { Pool } from "pg";
import { db } from "./db";
import { ADMIN_EMAIL } from "./constants";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PostgresAdapter(pool),
  session: {
    strategy: "jwt", // Use JWT strategy even with adapter (for custom fields)
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true, // Allow linking accounts with same email
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: "onboarding@resend.dev", // Resend's test domain
      allowDangerousEmailAccountLinking: true, // Allow linking accounts with same email
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (!user.email) {
          console.error('Sign in failed: No email provided');
          return false;
        }

        console.log('Attempting sign in for:', user.email);

        // Check if user exists
        let dbUser = await db.getUserByEmail(user.email);

        if (!dbUser) {
          console.log('User not found, creating new user:', user.email);
          
          // Check if this email belongs to an opponent
          const opponent = await db.getOpponentByEmail(user.email);

          // Determine role (a13158y@gmail.com is admin, all others are users)
          const role = user.email === ADMIN_EMAIL ? 'admin' : 'user';
          console.log('Assigning role:', role);

          // Create user
          dbUser = await db.createUser(user.email, user.name || null, role);
          console.log('User created successfully:', dbUser.id);

          // Link to opponent if exists
          if (opponent && !opponent.user_id) {
            await db.linkOpponentToUser(opponent.id, dbUser.id);
            console.log('Linked to opponent:', opponent.id);
          }
        } else {
          console.log('User found in DB:', dbUser.id);
          
          // User exists - check if role needs to be updated
          const expectedRole = user.email === ADMIN_EMAIL ? 'admin' : 'user';
          if (dbUser.role !== expectedRole) {
            console.log('Updating role from', dbUser.role, 'to', expectedRole);
            await db.updateUserRoleByEmail(user.email, expectedRole);
          }
        }

        console.log('Sign in successful for:', user.email);
        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        // Still return true to allow sign in, but log the error
        return true;
      }
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        const dbUser = await db.getUserByEmail(user.email!);
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.elo = dbUser.elo;
        }
      }

      // Handle session updates
      if (trigger === "update" && session) {
        token = { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as number;
        session.user.role = token.role as 'admin' | 'user';
        session.user.elo = token.elo as number;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If url is relative, prepend baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If url is on same origin, return it
      else if (new URL(url).origin === baseUrl) return url;
      // Otherwise return baseUrl
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request', // Optional: Show "Check your email" page
  },
  debug: process.env.NODE_ENV === 'development', // Enable debug logs in development
});
