import { requireAuth } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import MatchLogger from "./MatchLogger";

export default async function NewMatchPage() {
  const session = await requireAuth();
  const opponents = await db.getOpponentsByCreator(session.user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <MatchLogger user={session.user} opponents={opponents} />
    </div>
  );
}
