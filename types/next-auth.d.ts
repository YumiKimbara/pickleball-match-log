import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      role: 'admin' | 'user';
      elo: number;
    } & DefaultSession["user"];
  }

  interface User {
    role?: 'admin' | 'user';
    elo?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    role: 'admin' | 'user';
    elo: number;
  }
}
