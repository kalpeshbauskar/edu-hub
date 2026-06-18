import { Router } from "express";
import { db } from "@workspace/db";
import { quizQuestionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { SubmitQuizBody } from "@workspace/api-zod";

const router = Router();

router.post("/submit", async (req, res) => {
  const parsed = SubmitQuizBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { lessonId, answers } = parsed.data;
  const questions = await db.select().from(quizQuestionsTable)
    .where(eq(quizQuestionsTable.lessonId, lessonId));

  const correctAnswers: number[] = [];
  let score = 0;

  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && question.correctOption === answer.selectedOption) {
      score++;
      correctAnswers.push(answer.questionId);
    }
  }

  const total = questions.length;
  const passed = total > 0 ? score / total >= 0.6 : false;
  const xpEarned = passed ? score * 10 : score * 5;

  res.json({ score, total, passed, xpEarned, correctAnswers });
});

export default router;
