import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { rateLimit, RateLimits } from "@/lib/rate-limit";
import QRCodeComponent from "./QRCodeComponent";
import Link from "next/link";

export default async function OpponentQRPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;
  const opponentId = parseInt(id);

  const opponent = await db.getOpponentById(opponentId);
  if (!opponent) notFound();

  // Check ownership
  if (opponent.created_by_user_id !== session.user.id && session.user.role !== 'admin') {
    redirect('/dashboard/opponents');
  }

  // Rate limit invite creation
  const rateLimitResult = rateLimit({
    identifier: `invite:${session.user.id}`,
    ...RateLimits.INVITE_CREATE,
  });

  if (!rateLimitResult.success) {
    const resetIn = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000 / 60);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Rate Limit Exceeded</h1>
          <p className="text-gray-600 mb-4">
            You've created too many invite links. Please wait {resetIn} minutes before creating more.
          </p>
          <Link href="/dashboard/opponents" className="text-blue-600 underline">
            ← Back to Opponents
          </Link>
        </div>
      </div>
    );
  }

  // Create invite token
  const invite = await db.createInviteToken(opponentId, session.user.id);
  const inviteUrl = `${process.env.NEXTAUTH_URL}/invite/${invite.token}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
        <div className="mb-6">
          <Link href="/dashboard/opponents" className="text-sm text-blue-600 hover:underline">
            ← Back to Opponents
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">Invite {opponent.name}</h1>
        <p className="text-gray-600 mb-6">Scan to claim profile & join</p>

        <div className="bg-white p-6 rounded-xl border-2 border-gray-200 inline-block mb-4">
          <QRCodeComponent value={inviteUrl} />
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Valid for 7 days
        </p>

        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Or share this link:</p>
          <a
            href={inviteUrl}
            className="text-xs text-blue-600 underline break-all"
          >
            {inviteUrl}
          </a>
        </div>
      </div>
    </div>
  );
}
