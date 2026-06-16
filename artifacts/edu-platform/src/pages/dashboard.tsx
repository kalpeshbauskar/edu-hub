import { Link } from "wouter";
import { useUser } from "@clerk/react";
import { BookOpen, Trophy, Zap, ChevronRight, Play, Star } from "lucide-react";
import { useGetMyProgress, useListCourses } from "@workspace/api-client-react";

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-muted rounded-full h-2">
      <div
        className="bg-primary rounded-full h-2 transition-all"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useUser();
  const { data: progress } = useGetMyProgress();
  const { data: courses } = useListCourses({});

  const completedLessons = progress?.filter((p) => p.completed).length ?? 0;
  const totalXp = progress?.reduce((sum, p) => sum + (p.xp ?? 0), 0) ?? 0;
  const activeCourses = new Set(progress?.map((p) => p.courseId)).size;

  const recentProgress = progress?.slice(0, 3) ?? [];

  const getCourseTitle = (courseId: number) =>
    courses?.find((c) => c.id === courseId)?.title ?? `Course #${courseId}`;

  const stats = [
    { icon: BookOpen, label: "Lessons done", value: completedLessons, color: "text-blue-600 bg-blue-100" },
    { icon: Zap, label: "Total XP", value: totalXp, color: "text-yellow-600 bg-yellow-100" },
    { icon: Trophy, label: "Active courses", value: activeCourses, color: "text-purple-600 bg-purple-100" },
    { icon: Star, label: "Streak days", value: 1, color: "text-orange-600 bg-orange-100" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Welcome */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-foreground">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's your learning overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white border rounded-2xl p-5">
            <div className={`inline-flex p-2.5 rounded-xl mb-3 ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-extrabold">{value}</div>
            <div className="text-muted-foreground text-sm">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2">
          <div className="bg-white border rounded-2xl p-6">
            <h2 className="font-bold text-lg mb-4">Recent Activity</h2>
            {recentProgress.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No activity yet</p>
                <p className="text-sm mt-1">Start a course to see your progress here</p>
                <Link href="/courses" className="inline-flex items-center gap-1 text-primary font-semibold text-sm mt-4 hover:underline">
                  Browse courses <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProgress.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${p.completed ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"}`}>
                      {p.completed ? <Trophy className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{getCourseTitle(p.courseId)}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.completed ? "Completed" : "In progress"} · {p.xp ?? 0} XP earned
                      </p>
                    </div>
                    {p.score != null && (
                      <span className="text-sm font-bold text-primary">{p.score}%</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Continue Learning</h3>
            <p className="text-primary-foreground/80 text-sm mb-4">Pick up where you left off or start something new.</p>
            <Link href="/courses" className="inline-flex items-center gap-2 bg-white text-primary font-semibold px-4 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors">
              <BookOpen className="h-4 w-4" />
              Browse courses
            </Link>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Ask AI Tutor</h3>
            <p className="text-white/80 text-sm mb-4">Stuck on a concept? Your AI tutor is always ready to help.</p>
            <Link href="/chat" className="inline-flex items-center gap-2 bg-white text-purple-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors">
              Start chatting
            </Link>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-lg mb-2">Code Lab</h3>
            <p className="text-white/80 text-sm mb-4">Practice coding in an interactive sandbox environment.</p>
            <Link href="/code" className="inline-flex items-center gap-2 bg-white text-orange-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-white/90 transition-colors">
              Open editor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
