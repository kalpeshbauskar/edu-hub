---
name: Generated API hook names
description: The Orval-generated hook names for this project's API differ from intuitive guesses — always verify against the generated file.
---

Correct hook names (from `lib/api-client-react/src/generated/api.ts`):

- `useListCourses({})` — NOT `useGetCourses()` (also requires an empty params object `{}`)
- `useGetMyProgress()` — NOT `useGetUserProgress()`
- `useListChatConversations()` — NOT `useGetChatConversations()`
- `useGetCourse(id)` — correct
- `useGetLesson(id)` — correct
- `useUpsertProgress()` — correct
- `useSubmitQuiz()` — correct
- `useCreateChatConversation()` — correct
- `useGetChatConversation(id, { query: { enabled } })` — correct
- `useDeleteChatConversation()` — correct

**Why:** Orval derives hook names from the OpenAPI `operationId` field, which may differ from the resource name. The pattern is `use<OperationId>` not `use<HttpVerb><ResourceName>`.

**How to apply:** Before using any generated hook, grep `lib/api-client-react/src/generated/api.ts` for `export function use` to get the exact name. Do not guess.

Chat SSE route (`POST /api/chat/conversations/:id/messages`) is NOT in generated hooks — use raw `fetch` with `ReadableStream`.
