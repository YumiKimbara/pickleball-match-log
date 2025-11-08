import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

async function confirmLinking(formData: FormData) {
  "use server";
  const token = formData.get("token") as string;
  const session = await requireAuth();
  const invite = await db.getInviteToken(token);

  if (!invite || invite.redeemed_at || new Date(invite.expires_at) < new Date()) {
    redirect("/dashboard");
  }

  const opponent = invite.opponent_id ? await db.getOpponentById(invite.opponent_id) : null;

  if (opponent && !opponent.user_id) {
    // Link the opponent to the user
    await db.linkOpponentToUser(opponent.id, session.user.id);
    
    // Sync the user's email to the opponent record (only if it doesn't conflict)
    if (session.user.email && opponent.email !== session.user.email) {
      try {
        // Check if another opponent already has this email
        const existingOpponent = await db.getOpponentByEmail(session.user.email);
        if (!existingOpponent || existingOpponent.id === opponent.id) {
          await db.updateOpponentEmail(opponent.id, session.user.email);
        }
        // If email already exists for a different opponent, skip update (keep existing email)
      } catch (error) {
        console.error('Failed to sync opponent email:', error);
        // Continue even if email sync fails - the important part is the user link
      }
    }
  }

  await db.redeemInviteToken(invite.id, session.user.id);
  redirect("/dashboard");
}

export default async function InviteCompletePage({ params }: { params: Promise<{ token: string }> }) {
  const session = await requireAuth();
  const { token } = await params;
  const invite = await db.getInviteToken(token);

  if (!invite || invite.redeemed_at || new Date(invite.expires_at) < new Date()) {
    redirect("/dashboard");
  }

  const opponent = invite.opponent_id ? await db.getOpponentById(invite.opponent_id) : null;

  // Check if already linked
  if (opponent?.user_id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Already Linked</h1>
          <p className="text-gray-600 mb-4">
            This opponent profile is already linked to another user account.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900">
              <strong>💡 This means:</strong> Someone has already claimed this profile. Each profile can only be linked to one account.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-900 font-semibold mb-1">Is this an error?</p>
            <p className="text-sm text-yellow-800">
              Contact admin at <a href="mailto:a13158y@gmail.com" className="underline">a13158y@gmail.com</a> for help resolving duplicate accounts.
            </p>
          </div>
          
          <Link href="/dashboard" className="inline-block h-12 px-8 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Check if opponent email is already owned by a different user
  if (opponent?.email) {
    const existingUser = await db.getUserByEmail(opponent.email);
    if (existingUser && existingUser.id !== session.user.id) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Cannot Link Profile</h1>
            <p className="text-gray-600 mb-4">
              The email <strong>{opponent.email}</strong> is already registered to another user account.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>💡 What this means:</strong> This opponent profile belongs to someone else. You cannot link it to your account (<strong>{session.user.email}</strong>).
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-900 font-semibold mb-2">🤔 This could mean:</p>
              <ul className="text-xs text-yellow-800 text-left space-y-1">
                <li>• You're trying to claim someone else's profile</li>
                <li>• You may have multiple accounts with different emails</li>
                <li>• Someone created a profile with your email by mistake</li>
              </ul>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 font-semibold mb-1">📧 Need help?</p>
              <p className="text-sm text-gray-600">
                Contact admin at <a href="mailto:a13158y@gmail.com" className="underline text-blue-600">a13158y@gmail.com</a> to resolve this issue.
              </p>
            </div>
            
            <Link href="/dashboard" className="inline-block h-12 px-8 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Go to Dashboard
            </Link>
          </div>
        </div>
      );
    }
  }

  // Check if current user's email conflicts with another opponent
  if (session.user.email) {
    const conflictingOpponent = await db.getOpponentByEmail(session.user.email);
    if (conflictingOpponent && opponent && conflictingOpponent.id !== opponent.id) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Email Conflict</h1>
            <p className="text-gray-600 mb-4">
              Your email <strong>{session.user.email}</strong> is already used by another opponent profile.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-900">
                <strong>💡 What this means:</strong> Another opponent profile already has your email. Each email can only be linked to one profile.
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-900 font-semibold mb-2">🤔 Possible solutions:</p>
              <ul className="text-xs text-yellow-800 text-left space-y-1">
                <li>• You may already have an opponent profile linked</li>
                <li>• Someone created a profile with your email</li>
                <li>• Contact admin to merge duplicate profiles</li>
              </ul>
            </div>

            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 font-semibold mb-1">📧 Need help?</p>
              <p className="text-sm text-gray-600">
                Contact admin at <a href="mailto:a13158y@gmail.com" className="underline text-blue-600">a13158y@gmail.com</a> to resolve this issue.
              </p>
            </div>
            
            <Link href="/dashboard" className="inline-block h-12 px-8 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Go to Dashboard
            </Link>
          </div>
        </div>
      );
    }
  }

  // Show confirmation screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center mb-2">Confirm Account Linking</h1>
        <p className="text-gray-600 text-center mb-8">Please review before proceeding</p>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-blue-900 mb-3">You're about to link:</h2>
          
          <div className="space-y-3">
            {/* Your Account */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Your account</p>
                <p className="text-lg font-semibold text-gray-900">{session.user.email}</p>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center py-2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>

            {/* Opponent Profile */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Opponent profile</p>
                <p className="text-lg font-semibold text-gray-900">{opponent?.name}</p>
                {opponent?.email && <p className="text-sm text-gray-600">{opponent.email}</p>}
                <p className="text-sm text-gray-600">ELO: {Math.round(Number(opponent?.elo || 1500))}</p>
              </div>
            </div>
          </div>
        </div>

        {/* What will happen */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">This will:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Connect your account to this opponent profile</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Transfer all past match history to your account</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Make you appear as this opponent in others' match logs</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Keep your existing ELO rating ({Math.round(Number(opponent?.elo || 1500))})</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Link href="/dashboard" className="flex-1 h-12 px-6 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center">
            Cancel
          </Link>
          <form action={confirmLinking} className="flex-1">
            <input type="hidden" name="token" value={token} />
            <button type="submit" className="w-full h-12 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Confirm and Link
            </button>
          </form>
        </div>

        <p className="text-xs text-center text-gray-500 mt-4">This action cannot be undone</p>
      </div>
    </div>
  );
}
