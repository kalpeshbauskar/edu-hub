import { Router } from "express";
import { db } from "@workspace/db";
import { coursesTable, lessonsTable, quizQuestionsTable, userProgressTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { CreateCourseBody } from "@workspace/api-zod";

const router = Router();

router.get("/", async (req, res) => {
  const { category, difficulty } = req.query as Record<string, string | undefined>;
  const conditions = [];
  if (category) conditions.push(eq(coursesTable.category, category));
  if (difficulty) conditions.push(eq(coursesTable.difficulty, difficulty));

  const courses = conditions.length > 0
    ? await db.select().from(coursesTable).where(sql`${conditions.reduce((a, b) => sql`${a} AND ${b}`)}`)
    : await db.select().from(coursesTable);

  res.json(courses);
});

router.post("/", async (req, res) => {
  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const [course] = await db.insert(coursesTable).values(parsed.data).returning();
  res.status(201).json(course);
});

router.get("/stats", async (req, res) => {
  const courses = await db.select().from(coursesTable);
  const categoryCounts: Record<string, number> = {};
  const difficultyCounts: Record<string, number> = {};
  for (const c of courses) {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    difficultyCounts[c.difficulty] = (difficultyCounts[c.difficulty] || 0) + 1;
  }
  const studentsResult = await db.selectDistinct({ userId: userProgressTable.userId }).from(userProgressTable);
  res.json({
    totalCourses: courses.length,
    totalStudents: studentsResult.length,
    categoryCounts,
    difficultyCounts,
  });
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, id));
  if (!course) { res.status(404).json({ error: "Course not found" }); return; }

  const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, id));
  res.json({ ...course, lessons });
});

export default router;
