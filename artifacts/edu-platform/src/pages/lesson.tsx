import { useState } from "react";
import { Link, useParams } from "wouter";
import { ChevronLeft, CheckCircle, XCircle, Trophy, ChevronRight, Loader2 } from "lucide-react";
import { useGetLesson, useUpsertProgress, useSubmitQuiz, getGetLeaderboardQueryKey, getGetMyProgressQueryKey } from "@workspace/api-client-react";
import { useUser } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const lessonId = parseInt(id ?? "0");
  const { user } = useUser();
  const { data: lesson, isLoading } = useGetLesson(lessonId);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number; results: Array<{ questionId: number; correct: boolean }> } | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  const queryClient = useQueryClient();
  const upsertProgress = useUpsertProgress();
  const submitQuiz = useSubmitQuiz();

  const questions = (lesson as any)?.quizQuestions ?? [];
  const total = questions.length;

  const handleAnswer = (optionIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion]: optionIdx }));
  };

  const handleSubmit = async () => {
    const answersArr = questions.map((_: any, i: number) => ({
      questionId: questions[i].id,
      selectedOption: answers[i] ?? -1,
    }));

    try {
      const res = await submitQuiz.mutateAsync({ data: { lessonId, answers: answersArr } });
      setResult(res);
      setSubmitted(true);

      // Save progress
      if (lesson) {
        await upsertProgress.mutateAsync({
          data: {
            courseId: lesson.courseId,
            lessonId: lesson.id,
            completed: res.score >= 60,
            score: Math.round(res.score),
            xp: Math.round(res.score),
          },
        });
        queryClient.invalidateQueries({ queryKey: getGetLeaderboardQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMyProgressQueryKey() });
      }
    } catch {
      // fallback: calculate locally
      let correct = 0;
      const localResults = questions.map((q: any, i: number) => {
        const isCorrect = answers[i] === q.correctOption;
        if (isCorrect) correct++;
        return { questionId: q.id, correct: isCorrect };
      });
      const score = total > 0 ? (correct / total) * 100 : 0;
      setResult({ score, results: localResults });
      setSubmitted(true);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-muted-foreground">Lesson not found.</p>
        <Link href="/courses" className="text-primary hover:underline mt-2 inline-block">Back to courses</Link>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link href={`/courses/${lesson.courseId}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4" />
        Back to course
      </Link>

      {/* Lesson header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{lesson.title}</h1>
        <p className="text-muted-foreground">{lesson.description}</p>
      </div>

      {/* Video */}
      {lesson.videoUrl && (
        <div className="mb-8 rounded-2xl overflow-hidden bg-black aspect-video w-full shadow-lg">
          <iframe
            src={lesson.videoUrl}
            title={lesson.title}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}

      {/* Quiz section */}
      {total > 0 && (
        <div className="bg-white border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Knowledge Check</h2>
            <span className="text-sm text-muted-foreground">{total} questions</span>
          </div>

          {!quizStarted && !submitted ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
              <p className="font-semibold text-lg mb-2">Ready to test your knowledge?</p>
              <p className="text-muted-foreground text-sm mb-6">Complete this quiz to earn XP and mark the lesson as done.</p>
              <button
                onClick={() => setQuizStarted(true)}
                className="bg-primary text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Start Quiz
              </button>
            </div>
          ) : submitted && result ? (
            <div className="text-center py-8">
              <div className={`inline-flex p-4 rounded-full mb-4 ${result.score >= 60 ? "bg-green-100" : "bg-red-100"}`}>
                {result.score >= 60 ? (
                  <Trophy className="h-10 w-10 text-green-600" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-500" />
                )}
              </div>
              <p className="text-3xl font-extrabold mb-1">{Math.round(result.score)}%</p>
              <p className="text-muted-foreground mb-2">
                {result.results.filter((r) => r.correct).length} of {total} correct
              </p>
              {result.score >= 60 ? (
                <p className="text-green-600 font-semibold mb-6">🎉 Great job! Lesson completed and XP earned.</p>
              ) : (
                <p className="text-red-500 font-semibold mb-6">Keep practicing! Review the video and try again.</p>
              )}
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQuestion(0); setResult(null); setQuizStarted(true); }}
                  className="border border-primary text-primary font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/5 transition-colors"
                >
                  Retry Quiz
                </button>
                <Link href={`/courses/${lesson.courseId}`}>
                  <button className="bg-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors">
                    Back to Course
                  </button>
                </Link>
              </div>
            </div>
          ) : q ? (
            <div>
              {/* Progress bar */}
              <div className="flex gap-1 mb-6">
                {questions.map((_: any, i: number) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all ${i < currentQuestion ? "bg-primary" : i === currentQuestion ? "bg-primary/50" : "bg-muted"}`}
                  />
                ))}
              </div>

              <p className="text-xs text-muted-foreground font-medium mb-2">Question {currentQuestion + 1} of {total}</p>
              <h3 className="text-lg font-semibold mb-5">{q.question}</h3>

              <div className="space-y-3 mb-8">
                {q.options?.map((opt: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      answers[currentQuestion] === i
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-white hover:border-primary/50 hover:bg-muted/30"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full border text-xs mr-3 font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentQuestion((p) => Math.max(0, p - 1))}
                  disabled={currentQuestion === 0}
                  className="px-4 py-2 text-sm font-medium border rounded-xl disabled:opacity-40 hover:bg-muted transition-colors"
                >
                  Previous
                </button>
                {currentQuestion < total - 1 ? (
                  <button
                    onClick={() => setCurrentQuestion((p) => p + 1)}
                    disabled={answers[currentQuestion] === undefined}
                    className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-xl disabled:opacity-40 hover:bg-primary/90 transition-colors"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={Object.keys(answers).length < total || submitQuiz.isPending}
                    className="px-5 py-2 text-sm font-medium bg-primary text-white rounded-xl disabled:opacity-40 hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    {submitQuiz.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                    Submit Quiz
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
