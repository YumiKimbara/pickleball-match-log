import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function InviteCompletePage({ params }: { params: Promise<{ token: string }> }) {
  const session = await requireAuth();
  const { token } = await params;
  const invite = await db.getInviteToken(token);

  if (!invite || invite.redeemed_at || new Date(invite.expires_at) < new Date()) {
    redirect("/dashboard");
  }

  const opponent = invite.opponent_id ? await db.getOpponentById(invite.opponent_id) : null;

  if (opponent && !opponent.user_id) {
    await db.linkOpponentToUser(opponent.id, session.user.id);
  }

  await db.redeemInviteToken(invite.id, session.user.id);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome!</h1>
        <p className="text-gray-600 mb-6">
          {opponent ? `Your profile for ${opponent.name} has been linked.` : 'Your account is ready.'}
        </p>
        <a
          href="/dashboard"
          className="inline-block h-12 px-8 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
