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
    const resetInSeconds = Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000);
    const resetInMinutes = Math.ceil(resetInSeconds / 60);
    const timeMessage = resetInSeconds < 60 
      ? `${resetInSeconds} second${resetInSeconds !== 1 ? 's' : ''}`
      : `${resetInMinutes} minute${resetInMinutes !== 1 ? 's' : ''}`;
      
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 mb-2">Rate Limit Exceeded</h1>
          <p className="text-gray-600 mb-4">
            Too many invite requests. Please wait <strong>{timeMessage}</strong> before trying again.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-yellow-800">
              <strong>ℹ️ Rate Limit:</strong> 1 invite per minute to prevent abuse
            </p>
          </div>
          <Link href="/dashboard/opponents" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
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
