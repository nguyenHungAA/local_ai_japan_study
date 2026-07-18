# MongoDB Initial Database Design

## Project Context

This project is currently a local Japanese AI chat app with a FastAPI backend, a React/Tauri frontend, and a local OpenAI-compatible model endpoint. MongoDB is connected in `backend/database.py`, but the app does not yet persist chat data.

The frontend already suggests these near-term features:

- New chat
- Search chats
- Chat history
- Library
- Projects
- Apps

For the first database version, the safest design is to persist conversations and messages well, then leave clean extension points for projects, saved library items, and app integrations.

## Design Goals

- Keep the first implementation simple enough to ship quickly.
- Avoid unbounded documents that grow forever.
- Support chat history listing, opening a conversation, and searching messages.
- Preserve streaming response metadata without storing every tiny stream chunk.
- Keep future multi-user support possible without rewriting the data model.

## Database

Recommended database name:

```text
local_ai_japanese
```

The name is explicit, project-specific, and safe for local development or Atlas.

## Collections

### conversations

Stores one chat thread.

```javascript
{
  _id: ObjectId,
  title: "Explain JLPT N3 grammar",
  user_id: null,
  project_id: null,
  model: {
    provider: "lm-studio",
    name: "qwen2.5-vl-7b",
    base_url: "http://localhost:1234/v1"
  },
  language: "ja",
  status: "active",
  pinned: false,
  archived: false,
  message_count: 8,
  last_message_preview: "Grammar explanation preview...",
  last_message_at: ISODate("2026-07-18T14:10:00Z"),
  created_at: ISODate("2026-07-18T14:00:00Z"),
  updated_at: ISODate("2026-07-18T14:10:00Z")
}
```

Recommended fields:

- `title`: Short generated or user-edited title for sidebar history.
- `user_id`: `null` for now; can become an ObjectId when authentication exists.
- `project_id`: `null` for normal chats; references `projects._id` later.
- `model`: Snapshot of the model used for the conversation.
- `language`: Default app language or conversation language.
- `status`: `active`, `archived`, or `deleted`.
- `message_count`: Denormalized count for fast sidebar display.
- `last_message_preview`: Short preview for chat history.
- `last_message_at`: Sort key for recent chats.

Why this should be separate from messages:

Chat history needs to load many conversations quickly without loading every message body. Keeping conversation metadata separate makes the sidebar fast and avoids large documents.

### messages

Stores each user or assistant message as its own document.

```javascript
{
  _id: ObjectId,
  conversation_id: ObjectId("..."),
  client_id: "1f0e65bd-2d7e-43db-902c-2b198e1a0606",
  response_id: "chatcmpl-...",
  role: "assistant",
  content: "Japanese grammar explanation text...",
  status: "complete",
  sequence: 2,
  token_usage: {
    prompt_tokens: null,
    completion_tokens: null,
    total_tokens: null
  },
  error: null,
  created_at: ISODate("2026-07-18T14:00:20Z"),
  updated_at: ISODate("2026-07-18T14:00:45Z")
}
```

Recommended fields:

- `conversation_id`: Parent conversation.
- `client_id`: Matches the frontend's `assistantClientId`; useful for idempotency and UI reconciliation.
- `response_id`: Model response ID from the streaming API when available.
- `role`: `user`, `assistant`, or later `system`.
- `content`: Final message text. Do not store stream chunks unless debugging requires it.
- `status`: `pending`, `streaming`, `complete`, or `failed`.
- `sequence`: Monotonic order inside the conversation.
- `token_usage`: Optional now, useful later.
- `error`: Store failure details only for failed assistant messages.

Why one message per document:

MongoDB has a 16 MB document limit. Embedding all messages inside one conversation document is tempting at the start, but long chats can eventually hit the limit and make updates more expensive. Separate message documents are better for a chat app.

### projects

Optional for initial chat persistence, but the sidebar already has a Projects item. Create this only when the UI starts using it.

```javascript
{
  _id: ObjectId,
  name: "JLPT N3 Study",
  description: "Grammar, vocabulary, and reading practice",
  user_id: null,
  archived: false,
  created_at: ISODate("2026-07-18T13:30:00Z"),
  updated_at: ISODate("2026-07-18T13:30:00Z")
}
```

### library_items

Optional for saved prompts, favorite answers, study notes, or reusable Japanese learning material.

```javascript
{
  _id: ObjectId,
  source_type: "message",
  source_id: ObjectId("..."),
  title: "you ni vs tame ni",
  content: "Saved explanation...",
  tags: ["grammar", "jlpt-n3"],
  language: "ja",
  user_id: null,
  created_at: ISODate("2026-07-18T15:00:00Z"),
  updated_at: ISODate("2026-07-18T15:00:00Z")
}
```

### app_integrations

Optional placeholder for the Apps sidebar item. Do not build this until there is an actual integration feature.

```javascript
{
  _id: ObjectId,
  name: "local-model",
  type: "model_provider",
  enabled: true,
  config: {
    base_url: "http://localhost:1234/v1",
    model: "qwen2.5-vl-7b"
  },
  created_at: ISODate("2026-07-18T12:00:00Z"),
  updated_at: ISODate("2026-07-18T12:00:00Z")
}
```

## Indexes

Create these immediately:

```javascript
db.conversations.createIndex({ user_id: 1, archived: 1, last_message_at: -1 })
db.conversations.createIndex({ status: 1, updated_at: -1 })
db.messages.createIndex({ conversation_id: 1, sequence: 1 }, { unique: true })
db.messages.createIndex({ conversation_id: 1, created_at: 1 })
db.messages.createIndex({ client_id: 1 }, { unique: true, sparse: true })
db.messages.createIndex({ response_id: 1 }, { sparse: true })
```

Add this when search is implemented:

```javascript
db.messages.createIndex({
  content: "text"
}, {
  default_language: "none",
  name: "message_content_text"
})
```

Use `default_language: "none"` because the app is Japanese-focused and MongoDB's built-in text analyzer is limited for Japanese. This is acceptable for basic search, but Atlas Search or a dedicated Japanese tokenizer would be better later.

Add these when optional collections become active:

```javascript
db.projects.createIndex({ user_id: 1, archived: 1, updated_at: -1 })
db.library_items.createIndex({ user_id: 1, updated_at: -1 })
db.library_items.createIndex({ tags: 1 })
```

## Validation Rules

Recommended minimal schema validation for `messages`:

```javascript
db.createCollection("messages", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["conversation_id", "role", "content", "status", "sequence", "created_at", "updated_at"],
      properties: {
        conversation_id: { bsonType: "objectId" },
        client_id: { bsonType: ["string", "null"] },
        response_id: { bsonType: ["string", "null"] },
        role: { enum: ["user", "assistant", "system"] },
        content: { bsonType: "string" },
        status: { enum: ["pending", "streaming", "complete", "failed"] },
        sequence: { bsonType: "int" },
        error: { bsonType: ["object", "null"] },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
})
```

Recommended minimal schema validation for `conversations`:

```javascript
db.createCollection("conversations", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["title", "status", "message_count", "created_at", "updated_at"],
      properties: {
        title: { bsonType: "string" },
        user_id: { bsonType: ["objectId", "null"] },
        project_id: { bsonType: ["objectId", "null"] },
        status: { enum: ["active", "archived", "deleted"] },
        pinned: { bsonType: "bool" },
        archived: { bsonType: "bool" },
        message_count: { bsonType: "int" },
        last_message_preview: { bsonType: ["string", "null"] },
        last_message_at: { bsonType: ["date", "null"] },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" }
      }
    }
  }
})
```

## Backend API Shape

The current `POST /` endpoint accepts only `{ prompt }` and streams the assistant answer. To persist chat history, change it toward this shape:

```json
{
  "conversation_id": null,
  "client_id": "frontend-generated-uuid",
  "prompt": "Explain this grammar point"
}
```

Expected behavior:

1. If `conversation_id` is missing, create a new conversation.
2. Insert the user message.
3. Insert an assistant message with `status: "streaming"`.
4. Stream content to the frontend while accumulating the final text in memory.
5. Update the assistant message to `status: "complete"` with the final content.
6. Update the conversation's `message_count`, `last_message_preview`, `last_message_at`, and `updated_at`.

Recommended initial endpoints:

```text
POST   /conversations
GET    /conversations
GET    /conversations/{conversation_id}/messages
POST   /conversations/{conversation_id}/messages
PATCH  /conversations/{conversation_id}
DELETE /conversations/{conversation_id}
GET    /search?q=...
```

## Review

### What Looks Good

- MongoDB is a good fit for chat messages because the data is document-shaped and can evolve as features are added.
- The project already has `assistantClientId` on the frontend, which is useful for deduplication and matching streamed assistant output to a UI row.
- Keeping `conversations` and `messages` separate avoids large conversation documents and keeps history lists fast.
- The proposed schema leaves room for projects and saved library items without making the first persistence step too heavy.

### Risks To Fix Early

- `backend/database.py` creates the Mongo client at import time. If `MONGODB_URI` is missing or invalid, importing the module can fail before the app has a chance to report a clean startup error.
- The current `POST /` endpoint has no `conversation_id`, so every prompt is stateless from the backend's perspective.
- Streaming responses are not persisted. If the app closes during a stream, the conversation is lost.
- Search needs Japanese-aware planning. MongoDB text indexes are okay for simple substring-like discovery, but they are not excellent Japanese search.
- There is no user/session identity yet. That is fine for a local app, but every collection should still include nullable `user_id` so the model can grow cleanly.

### Recommended First Implementation

Build only these pieces first:

1. `conversations` collection.
2. `messages` collection.
3. Index creation in `database.init_db()`.
4. `GET /conversations` for sidebar history.
5. `GET /conversations/{id}/messages` for opening a chat.
6. Update the chat endpoint to accept optional `conversation_id` and persist both user and assistant messages.

Delay `projects`, `library_items`, and `app_integrations` until the UI needs them.

## Implementation Notes

- Use timezone-aware UTC datetimes in Python.
- Store ObjectIds as strings in API responses.
- Do not expose raw MongoDB documents directly from FastAPI.
- Use `$set` for normal updates and `$inc` for `message_count`.
- Generate conversation titles from the first user prompt, capped to roughly 60 characters.
- Consider soft-delete first with `status: "deleted"` instead of physical deletion.
- Keep stream chunks out of MongoDB unless a debug mode is explicitly enabled.

## Initial Decision

Use two required collections now:

- `conversations`
- `messages`

Keep three optional collections as planned extensions:

- `projects`
- `library_items`
- `app_integrations`

This gives the project a clean persistence foundation without over-designing features that are still only hinted at in the UI.
