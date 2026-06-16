import { useState } from "react";
import { Link } from "wouter";
import { BookOpen, Clock, BarChart2, ChevronRight, Search } from "lucide-react";
import { useListCourses } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

const difficultyColors: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-orange-100 text-orange-700",
  Advanced: "bg-red-100 text-red-700",
};

const categoryColors: Record<string, string> = {
  Programming: "bg-blue-100 text-blue-700",
  Web: "bg-purple-100 text-purple-700",
  "Data Science": "bg-teal-100 text-teal-700",
  "Computer Science": "bg-gray-100 text-gray-700",
};

export default function CoursesPage() {
  const { data: courses, isLoading } = useListCourses({});
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  const categories = ["All", ...Array.from(new Set(courses?.map((c) => c.category) ?? []))];
  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  const filtered = courses?.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || c.category === filterCategory;
    const matchDiff = filterDifficulty === "All" || c.difficulty === filterDifficulty;
    return matchSearch && matchCat && matchDiff;
  }) ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2">Course Catalog</h1>
        <p className="text-muted-foreground">Choose a course and start learning at your own pace.</p>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-xl border transition-colors",
                filterCategory === cat ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => setFilterDifficulty(d)}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-xl border transition-colors",
                filterDifficulty === d ? "bg-primary text-white border-primary" : "bg-white text-muted-foreground border-border hover:border-primary hover:text-primary"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border rounded-2xl p-6 animate-pulse">
              <div className="h-10 w-10 bg-muted rounded-xl mb-4" />
              <div className="h-5 bg-muted rounded w-3/4 mb-2" />
              <div className="h-4 bg-muted rounded w-full mb-1" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No courses found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <div className="bg-white border rounded-2xl p-6 hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${difficultyColors[course.difficulty] ?? "bg-gray-100 text-gray-700"}`}>
                    {course.difficulty}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${categoryColors[course.category] ?? "bg-gray-100 text-gray-700"}`}>
                    {course.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {course.totalLessons ?? 0} lessons</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.estimatedMinutes ?? 0}m</span>
                  </div>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
