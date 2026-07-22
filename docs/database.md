### endpoint

Stores application model enpoint

```javascript
{
    _id: ObjectId,
    name: "qwen2.5-vl-7b",
    provider: "lm-studio",
    url: "http://localhost:1234/v1"
}

```

### uploaded_file

Stores users uploaded file

```javascript
{
    _id: ObjectId,
    file_type: "png/jpg",
    content: "..."
}

```

### conversations

Stores one chat thread.

```javascript
{
  _id: ObjectId,
  title: "Explain JLPT N3 grammar",
  user_id: null,
  default_model: {
    endpoint_id: ObjectId("...")
  },
  status: "active",
  pinned: false,
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
  role: "assistant",
  content: "Japanese grammar explanation text...",
  response_id: "chatcmpl-...",
  status: "complete",
  sequence: 2,

  attachments: [
    {
        type: "image",
        file_id: ObjectId("..."),
        mime_type: "image/png" 
    }
  ]

  generation: {
    provider: "lm-studio",
    model: "qwen2.5-vl-7b",
    response_id: "chatcmpl-...",
    finish_reason: "stop",

    token_usage: {
      prompt_tokens: null,
      completion_tokens: null,
      total_tokens: null
    }
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