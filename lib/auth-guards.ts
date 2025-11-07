import { auth } from "./auth";
import { redirect } from "next/navigation";
import { ADMIN_EMAIL } from "./constants";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== 'admin') {
    redirect("/dashboard");
  }
  return session;
}

export async function getOptionalAuth() {
  return await auth();
}

// Utility to check if email is admin
export function isAdminEmail(email: string): boolean {
  return email === ADMIN_EMAIL;
}

// Utility to check if user object is admin
export function isAdmin(user: { role: 'admin' | 'user' } | null | undefined): boolean {
  return user?.role === 'admin';
}
