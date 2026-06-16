# LearnSpark

An interactive education platform (inspired by code.org) where students can watch video lessons, take quizzes, write code in a sandbox, and get help from an AI tutor.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at `/api`)
- `pnpm --filter @workspace/edu-platform run dev` — run the frontend (proxied at `/`)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `SESSION_SECRET`, `OPENAI_API_KEY`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PROXY_URL`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite 7, Tailwind CSS v4, Wouter routing, TanStack Query
- Auth: Clerk (managed by Replit), `@clerk/react` + `@clerk/express`
- API: Express 5, OpenAPI spec → Orval codegen
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- AI: OpenAI `gpt-4o-mini` via SSE streaming (chat route)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- Build: esbuild (API), Vite (frontend)

## Where things live

- `artifacts/edu-platform/src/` — React frontend
  - `App.tsx` — routing + Clerk provider
  - `components/layout.tsx` — nav + layout shell
  - `pages/` — landing, dashboard, courses, course-detail, lesson, code, chat
- `artifacts/api-server/src/` — Express API
  - `routes/` — courses, lessons, progress, quiz, chat (SSE), health
  - `lib/openai.ts` — OpenAI client singleton
- `lib/db/src/schema/` — Drizzle schema (courses, progress, chat)
- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth)
- `lib/api-client-react/src/generated/` — Generated hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod schemas (do not edit)

## Architecture decisions

- Contract-first API: OpenAPI spec → `pnpm codegen` generates TanStack Query hooks + Zod validators. Always update the spec first, then regenerate.
- Chat uses SSE streaming (not generated hooks). Frontend reads the stream manually with `ReadableStream`. Route: `POST /api/chat/conversations/:id/messages`.
- Clerk proxy middleware lives in `api-server` so Clerk tokens are proxied through the same origin. `VITE_CLERK_PROXY_URL` routes Clerk SDK calls through `/api/clerk`.
- Generated hook names differ from "intuitive" names: `useListCourses`, `useGetMyProgress`, `useListChatConversations` (not `useGetCourses`, `useGetUserProgress`, etc.). Check `lib/api-client-react/src/generated/api.ts` for exact names.

## Product

- **Homepage** — public hero with feature highlights and course preview
- **Dashboard** — personalized stats (lessons completed, XP earned, active courses)
- **Courses Catalog** — filterable grid of 5 courses with difficulty + category badges
- **Course Detail** — lesson list with progress indicators
- **Lesson Page** — embedded YouTube video + multi-question quiz with XP rewards
- **Code Lab** — in-browser Python sandbox with starter programs + coding challenges
- **AI Tutor Chat** — GPT-4o mini streaming chat with conversation history

## Seed Data

5 courses × 5 lessons each = 25 lessons total. Quiz questions for Python course (lessons 1–5) and Web Dev course (lessons 6–10) are seeded. Run seed scripts via `code_execution` with `executeSql` if you need to reseed.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After changing `lib/db` schema, run `pnpm run typecheck:libs` before server typecheck.
- API server routes return `void`; use `res.status(x).json(y); return;` pattern (not `return res.status(x).json(y)`).
- `useListCourses` requires a params object (`{}`), not called with zero args.
- Chat SSE route is NOT in the generated hooks. Use raw `fetch` with `ReadableStream`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `clerk-auth` skill for Clerk setup reference
