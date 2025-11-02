import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import QRCodeComponent from "./QRCodeComponent";
import Link from "next/link";

export default async function OpponentQRPage({ params }: { params: { id: string } }) {
  const session = await requireAuth();
  const opponentId = parseInt(params.id);

  const opponent = await db.getOpponentById(opponentId);
  if (!opponent) notFound();

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
