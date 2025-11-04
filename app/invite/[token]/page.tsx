import { db } from "@/lib/db";
import { signIn } from "@/lib/auth";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await db.getInviteToken(token);

  if (!invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Invite</h1>
          <p className="text-gray-600 mb-6">This invite link is invalid or has been removed.</p>
          <a href="/" className="text-blue-600 underline">Go home</a>
        </div>
      </div>
    );
  }

  if (invite.redeemed_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">Already Redeemed</h1>
          <p className="text-gray-600 mb-6">This invite has already been used.</p>
          <a href="/auth/signin" className="text-blue-600 underline">Sign in</a>
        </div>
      </div>
    );
  }

  if (new Date(invite.expires_at) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-orange-600 mb-4">Invite Expired</h1>
          <p className="text-gray-600 mb-6">This invite link has expired. Please request a new one.</p>
          <a href="/" className="text-blue-600 underline">Go home</a>
        </div>
      </div>
    );
  }

  const session = await auth();
  const opponent = invite.opponent_id ? await db.getOpponentById(invite.opponent_id) : null;

  if (session?.user) {
    // User is already signed in, link them
    if (opponent && !opponent.user_id) {
      await db.linkOpponentToUser(opponent.id, session.user.id);
    }
    await db.redeemInviteToken(invite.id, session.user.id);
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Join Pickleball Tracker</h1>
        {opponent && (
          <p className="text-gray-600 text-center mb-6">
            Claim profile for <strong>{opponent.name}</strong>
          </p>
        )}

        <div className="space-y-4">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: `/invite/${token}/complete` });
            }}
          >
            <button
              type="submit"
              className="w-full h-14 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <form
            action={async (formData) => {
              "use server";
              const email = formData.get("email") as string;
              await signIn("resend", { email, redirectTo: `/invite/${token}/complete` });
            }}
          >
            <div className="space-y-3">
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                defaultValue={opponent?.email || ""}
                required
                className="w-full h-14 px-4 border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none text-lg"
              />
              <button
                type="submit"
                className="w-full h-14 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 active:bg-green-800 transition-colors"
              >
                Send Magic Link
              </button>
            </div>
          </form>
        </div>

        {opponent?.email && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 Use <strong>{opponent.email}</strong> to claim your existing profile
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
