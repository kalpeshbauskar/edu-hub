import { Router } from "express";
import { db } from "@workspace/db";
import { chatConversationsTable, chatMessagesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { CreateChatConversationBody, SendChatMessageBody } from "@workspace/api-zod";
import { openai } from "../lib/openai";

const router = Router();

const requireAuth = (req: any, res: any, next: any): void => {
  const auth = getAuth(req);
  const userId = auth?.sessionClaims?.userId || auth?.userId;
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }
  req.userId = userId;
  next();
};

router.get("/conversations", requireAuth, async (req: any, res) => {
  const conversations = await db.select()
    .from(chatConversationsTable)
    .where(eq(chatConversationsTable.userId, req.userId));
  res.json(conversations);
});

router.post("/conversations", requireAuth, async (req: any, res) => {
  const parsed = CreateChatConversationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }
  const [conv] = await db.insert(chatConversationsTable)
    .values({ userId: req.userId, title: parsed.data.title })
    .returning();
  res.status(201).json(conv);
});

router.get("/conversations/:id", requireAuth, async (req: any, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [conv] = await db.select().from(chatConversationsTable)
    .where(and(eq(chatConversationsTable.id, id), eq(chatConversationsTable.userId, req.userId)));
  if (!conv) { res.status(404).json({ error: "Conversation not found" }); return; }
  const messages = await db.select().from(chatMessagesTable)
    .where(eq(chatMessagesTable.conversationId, id));
  res.json({ ...conv, messages });
});

router.delete("/conversations/:id", requireAuth, async (req: any, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [conv] = await db.select().from(chatConversationsTable)
    .where(and(eq(chatConversationsTable.id, id), eq(chatConversationsTable.userId, req.userId)));
  if (!conv) { res.status(404).json({ error: "Not found" }); return; }
  await db.delete(chatConversationsTable).where(eq(chatConversationsTable.id, id));
  res.status(204).end();
});

router.post("/conversations/:id/messages", requireAuth, async (req: any, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const parsed = SendChatMessageBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [conv] = await db.select().from(chatConversationsTable)
    .where(and(eq(chatConversationsTable.id, id), eq(chatConversationsTable.userId, req.userId)));
  if (!conv) { res.status(404).json({ error: "Conversation not found" }); return; }

  await db.insert(chatMessagesTable).values({
    conversationId: id,
    role: "user",
    content: parsed.data.content,
  });

  const history = await db.select().from(chatMessagesTable)
    .where(eq(chatMessagesTable.conversationId, id));

  const chatMessages = history.map(m => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
  }));

  chatMessages.unshift({
    role: "system",
    content: "You are a friendly AI tutor helping students learn coding, math, and science. Keep answers clear, encouraging, and educational. If a student seems stuck, break the problem into smaller steps.",
  });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
      stream: true,
      max_tokens: 1024,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    await db.insert(chatMessagesTable).values({
      conversationId: id,
      role: "assistant",
      content: fullResponse,
    });

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (_err) {
    res.write(`data: ${JSON.stringify({ error: "AI service error" })}\n\n`);
    res.end();
  }
});

export default router;
