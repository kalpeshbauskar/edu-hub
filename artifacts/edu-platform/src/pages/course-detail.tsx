import { Link, useParams } from "wouter";
import { BookOpen, Clock, Play, CheckCircle, ChevronLeft, BarChart2, Lock } from "lucide-react";
import { useGetCourse, useGetMyProgress } from "@workspace/api-client-react";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id ?? "0");
  const { data: course, isLoading } = useGetCourse(courseId);
  const { data: progress } = useGetMyProgress();

  const completedLessonIds = new Set(
    progress?.filter((p) => p.completed && p.courseId === courseId).map((p) => p.lessonId)
  );

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/2 mb-4" />
        <div className="h-4 bg-muted rounded w-3/4 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-muted-foreground">
        <p className="font-medium text-lg">Course not found</p>
        <Link href="/courses" className="text-primary hover:underline mt-2 inline-block">Back to courses</Link>
      </div>
    );
  }

  const totalLessons = (course as any).lessons?.length ?? course.totalLessons ?? 0;
  const completedCount = completedLessonIds.size;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href="/courses" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" />
        Back to courses
      </Link>

      {/* Course header */}
      <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-8 w-8" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{course.title}</h1>
            <p className="text-primary-foreground/80 mb-4">{course.description}</p>
            <div className="flex items-center gap-4 text-sm text-primary-foreground/70 flex-wrap">
              <span className="flex items-center gap-1"><BarChart2 className="h-4 w-4" />{course.difficulty}</span>
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" />{totalLessons} lessons</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{course.estimatedMinutes}m total</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {completedCount > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Your progress</span>
              <span>{completedCount}/{totalLessons} lessons • {progressPct}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Lesson list */}
      <div>
        <h2 className="text-xl font-bold mb-4">Course Lessons</h2>
        <div className="space-y-3">
          {((course as any).lessons ?? []).map((lesson: any, idx: number) => {
            const isCompleted = completedLessonIds.has(lesson.id);
            return (
              <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                <div className="flex items-center gap-4 bg-white border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm transition-colors ${isCompleted ? "bg-green-100 text-green-600" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"}`}>
                    {isCompleted ? <CheckCircle className="h-5 w-5" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{lesson.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{lesson.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />{lesson.durationMinutes}m
                    </span>
                    {isCompleted ? (
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">Done</span>
                    ) : (
                      <Play className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
