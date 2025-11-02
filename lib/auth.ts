import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import { db } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: "noreply@yourdomain.com", // Update this when you have a domain
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false;

      // Check if user exists
      let dbUser = await db.getUserByEmail(user.email);

      if (!dbUser) {
        // Check if this email belongs to an opponent
        const opponent = await db.getOpponentByEmail(user.email);

        // Determine role
        const role = user.email === process.env.ADMIN_EMAIL ? 'admin' : 'user';

        // Create user
        dbUser = await db.createUser(user.email, user.name || null, role);

        // Link to opponent if exists
        if (opponent && !opponent.user_id) {
          await db.linkOpponentToUser(opponent.id, dbUser.id);
        }
      }

      return true;
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
  },
  pages: {
    signIn: '/auth/signin',
  },
});
