import { Router } from "express";
import { db } from "@workspace/db";
import { lessonsTable, quizQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, id));
  if (!lesson) { res.status(404).json({ error: "Lesson not found" }); return; }

  const quizQuestions = await db.select().from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.lessonId, id));

  const questionsForClient = quizQuestions.map(({ correctOption: _co, ...q }) => q);

  res.json({ ...lesson, quizQuestions: questionsForClient });
});

export default router;
