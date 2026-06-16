import { Link } from "wouter";
import { BookOpen, Code2, MessageCircle, Trophy, ChevronRight, Zap, Users, Star } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Structured Courses",
    description: "Video-based lessons organized into progressive courses across Python, JavaScript, Web Dev, and more.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Code2,
    title: "Live Code Editor",
    description: "Practice right in your browser with our interactive coding sandbox — no installs needed.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: MessageCircle,
    title: "AI Tutor (24/7)",
    description: "Stuck on a concept? Ask your AI tutor powered by GPT-4o — get instant, personalized explanations.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Trophy,
    title: "Track Your Progress",
    description: "Earn XP, complete lessons, and watch your skills grow with real-time progress tracking.",
    color: "bg-yellow-100 text-yellow-600",
  },
];

const courses = [
  { title: "Python for Beginners", category: "Programming", level: "Beginner", lessons: 5 },
  { title: "Web Dev Basics", category: "Web", level: "Beginner", lessons: 5 },
  { title: "Data Science", category: "Data", level: "Intermediate", lessons: 5 },
  { title: "JS Essentials", category: "Web", level: "Intermediate", lessons: 5 },
];

const stats = [
  { icon: Users, value: "10K+", label: "Students" },
  { icon: BookOpen, value: "20+", label: "Courses" },
  { icon: Star, value: "4.9", label: "Rating" },
  { icon: Zap, value: "100%", label: "Free to start" },
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary/5 via-white to-secondary/10 pt-20 pb-28 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            <Zap className="h-4 w-4" />
            Learn to code with AI-powered tutoring
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-foreground leading-tight tracking-tight mb-6">
            Your journey to<br />
            <span className="text-primary">coding mastery</span> starts here
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Interactive video lessons, hands-on coding exercises, and an AI tutor that explains concepts in plain English — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25 text-lg"
            >
              Start learning for free
              <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 border border-border bg-white text-foreground font-semibold px-8 py-3.5 rounded-xl hover:bg-muted transition-colors text-lg"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl pointer-events-none" />
      </section>

      {/* Stats */}
      <section className="bg-primary py-12 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center text-white">
              <Icon className="h-6 w-6 mx-auto mb-2 opacity-80" />
              <div className="text-3xl font-extrabold">{value}</div>
              <div className="text-primary-foreground/70 text-sm font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-foreground mb-4">Everything you need to level up</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">One platform. All the tools you need to go from zero to developer.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div key={title} className="bg-white border rounded-2xl p-6 hover:shadow-lg transition-shadow">
                <div className={`inline-flex p-3 rounded-xl mb-4 ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses preview */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-foreground mb-4">Popular courses</h2>
            <p className="text-lg text-muted-foreground">Beginner-friendly to advanced. Start wherever you are.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {courses.map((c) => (
              <div key={c.title} className="bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{c.category} · {c.lessons} lessons</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${c.level === "Beginner" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                  {c.level}
                </span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/sign-up" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-8 py-3 rounded-xl hover:bg-primary/90 transition-colors">
              View all courses <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-4">Ready to start your coding journey?</h2>
          <p className="text-lg text-muted-foreground mb-8">Join thousands of learners already building their future on LearnSpark.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-10 py-4 rounded-xl hover:bg-primary/90 transition-colors text-lg shadow-lg shadow-primary/25">
            Create free account <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
