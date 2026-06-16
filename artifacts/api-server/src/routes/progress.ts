import { Router } from "express";
import { db } from "@workspace/db";
import { userProgressTable, lessonsTable, coursesTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { UpsertProgressBody } from "@workspace/api-zod";

const router = Router();

const requireAuth = (req: any, res: any, next: any): void => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/", requireAuth, async (req: any, res) => {
  const rows = await db.select().from(userProgressTable)
    .where(eq(userProgressTable.userId, req.userId));
  res.json(rows);
});

router.post("/", requireAuth, async (req: any, res) => {
  const parsed = UpsertProgressBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { courseId, lessonId, completed, score, xp } = parsed.data;
  const completedAt = completed ? new Date() : null;

  const existing = await db.select().from(userProgressTable)
    .where(and(
      eq(userProgressTable.userId, req.userId),
      eq(userProgressTable.lessonId, lessonId),
    ));

  let row;
  if (existing.length > 0) {
    [row] = await db.update(userProgressTable)
      .set({ completed, score: score ?? null, xp, completedAt })
      .where(eq(userProgressTable.id, existing[0].id))
      .returning();
  } else {
    [row] = await db.insert(userProgressTable)
      .values({ userId: req.userId, courseId, lessonId, completed, score: score ?? null, xp, completedAt })
      .returning();
  }
  res.json(row);
});

router.get("/dashboard", requireAuth, async (req: any, res) => {
  const allProgress = await db.select().from(userProgressTable)
    .where(eq(userProgressTable.userId, req.userId));

  const totalXp = allProgress.reduce((sum, p) => sum + p.xp, 0);
  const totalCompleted = allProgress.filter(p => p.completed).length;

  const completedDates = allProgress
    .filter(p => p.completedAt)
    .map(p => p.completedAt!.toISOString().split("T")[0])
    .sort((a, b) => b.localeCompare(a));

  let currentStreak = 0;
  if (completedDates.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    const uniqueDates = [...new Set(completedDates)];
    let checkDate = today;
    for (const d of uniqueDates) {
      if (d === checkDate) {
        currentStreak++;
        const prev = new Date(checkDate);
        prev.setDate(prev.getDate() - 1);
        checkDate = prev.toISOString().split("T")[0];
      } else break;
    }
  }

  const courseIds = [...new Set(allProgress.map(p => p.courseId))];
  const completedCourseIds = new Set(
    allProgress.filter(p => p.completed).map(p => p.courseId)
  );
  const coursesInProgress = courseIds.filter(id => !completedCourseIds.has(id)).length;

  const recent = await db.select({
    lessonTitle: lessonsTable.title,
    courseTitle: coursesTable.title,
    completedAt: userProgressTable.completedAt,
    xpEarned: userProgressTable.xp,
  })
    .from(userProgressTable)
    .innerJoin(lessonsTable, eq(userProgressTable.lessonId, lessonsTable.id))
    .innerJoin(coursesTable, eq(userProgressTable.courseId, coursesTable.id))
    .where(and(eq(userProgressTable.userId, req.userId), eq(userProgressTable.completed, true)))
    .orderBy(desc(userProgressTable.completedAt))
    .limit(5);

  res.json({
    totalXp,
    totalCompleted,
    currentStreak,
    coursesInProgress,
    recentActivity: recent.map(r => ({
      lessonTitle: r.lessonTitle,
      courseTitle: r.courseTitle,
      completedAt: r.completedAt!.toISOString(),
      xpEarned: r.xpEarned,
    })),
  });
});

export default router;
