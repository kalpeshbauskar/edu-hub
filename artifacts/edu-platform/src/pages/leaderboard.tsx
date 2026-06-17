import { Trophy, Medal, Zap, BookOpen, Crown } from "lucide-react";
import { useGetLeaderboard, getGetLeaderboardQueryKey } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const REFETCH_INTERVAL_MS = 30_000;

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
}

function LeaderboardRow({
  entry,
  isHighlighted,
  isSeparated,
}: {
  entry: { rank: number; displayName: string; totalXp: number; lessonsCompleted: number; isCurrentUser: boolean };
  isHighlighted: boolean;
  isSeparated?: boolean;
}) {
  return (
    <>
      {isSeparated && (
        <div className="flex items-center gap-2 py-1 px-4">
          <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
          <span className="text-xs text-muted-foreground">···</span>
          <div className="flex-1 border-t border-dashed border-muted-foreground/30" />
        </div>
      )}
      <div
        className={cn(
          "flex items-center gap-4 px-4 py-3 rounded-xl transition-colors",
          isHighlighted
            ? "bg-primary/10 border border-primary/30"
            : entry.rank <= 3
            ? "bg-muted/40"
            : "hover:bg-muted/30"
        )}
      >
        <div className="w-7 flex items-center justify-center flex-shrink-0">
          <RankBadge rank={entry.rank} />
        </div>

        <div
          className={cn(
            "w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0",
            isHighlighted
              ? "bg-primary text-white"
              : entry.rank === 1
              ? "bg-yellow-100 text-yellow-700"
              : entry.rank === 2
              ? "bg-gray-100 text-gray-600"
              : entry.rank === 3
              ? "bg-amber-100 text-amber-700"
              : "bg-muted text-muted-foreground"
          )}
        >
          {entry.displayName.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <p className={cn("font-semibold text-sm", isHighlighted && "text-primary")}>
            {entry.displayName}
            {entry.isCurrentUser && (
              <span className="ml-2 text-xs font-medium bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                you
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            {entry.lessonsCompleted} lesson{entry.lessonsCompleted !== 1 ? "s" : ""} completed
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Zap className="h-4 w-4 text-yellow-500" />
          <span className={cn("font-extrabold text-sm", isHighlighted ? "text-primary" : "text-foreground")}>
            {entry.totalXp.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">XP</span>
        </div>
      </div>
    </>
  );
}

export default function LeaderboardPage() {
  const { data, isLoading } = useGetLeaderboard(
    {},
    { query: { queryKey: getGetLeaderboardQueryKey({}), refetchInterval: REFETCH_INTERVAL_MS } }
  );

  const entries = data?.entries ?? [];
  const currentUserEntry = data?.currentUserEntry ?? null;
  const currentUserInTop = entries.some((e) => e.isCurrentUser);
  const showCurrentUserBelow = currentUserEntry && !currentUserInTop;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <div className="inline-flex p-3 bg-yellow-100 rounded-2xl mb-4">
          <Trophy className="h-8 w-8 text-yellow-600" />
        </div>
        <h1 className="text-3xl font-extrabold">Leaderboard</h1>
        <p className="text-muted-foreground mt-1">Top learners ranked by total XP earned</p>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">
            <Trophy className="h-10 w-10 mx-auto mb-3 opacity-20 animate-pulse" />
            <p>Loading rankings…</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No rankings yet</p>
            <p className="text-sm mt-1">Complete lessons to earn XP and appear here!</p>
          </div>
        ) : (
          <div className="p-3 space-y-1">
            {entries.map((entry) => (
              <LeaderboardRow
                key={entry.userId}
                entry={entry}
                isHighlighted={entry.isCurrentUser}
              />
            ))}
            {showCurrentUserBelow && (
              <LeaderboardRow
                entry={currentUserEntry}
                isHighlighted
                isSeparated
              />
            )}
          </div>
        )}
      </div>

      {currentUserEntry && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          You are ranked <span className="font-bold text-foreground">#{currentUserEntry.rank}</span> overall
          {" "}with <span className="font-bold text-yellow-600">{currentUserEntry.totalXp.toLocaleString()} XP</span>
        </div>
      )}
    </div>
  );
}
