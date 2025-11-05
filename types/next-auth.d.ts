declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: 'admin' | 'user';
      elo: number;
    };
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
