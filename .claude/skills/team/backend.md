---
name: backend
description: >
  Backend development context for this project. Load for any task involving
  APIs, database queries, authentication, server-side logic, background jobs,
  webhooks, or data processing. Covers patterns, security rules, and DB conventions.
---

# Backend Skill

Everything needed to build consistent, secure backend logic in this project.

---

## Stack

- **Runtime:** [e.g. Node.js 20 / Python 3.11 / Bun]
- **Framework:** [e.g. Express / FastAPI / Hono / Next.js API routes]
- **Database:** [e.g. PostgreSQL via Supabase / MongoDB / PlanetScale]
- **ORM / Query builder:** [e.g. Prisma / Drizzle / SQLAlchemy / raw SQL]
- **Auth:** [e.g. Supabase Auth / Clerk / NextAuth / custom JWT]
- **Background jobs:** [e.g. BullMQ / Inngest / none]
- **Email:** [e.g. Resend / SendGrid / Nodemailer]

---

## API Design

### Route naming
```
GET    /api/users            ← list
GET    /api/users/:id        ← single item
POST   /api/users            ← create
PUT    /api/users/:id        ← full update
PATCH  /api/users/:id        ← partial update
DELETE /api/users/:id        ← delete
```

Plural nouns. Lowercase. Hyphens for multi-word: `/api/order-items`.

### Response format
Every API response follows this shape:

```typescript
// Success
{ data: T, error: null }

// Error
{ data: null, error: { message: string, code: string } }
```

HTTP status codes:
- `200` — success
- `201` — created
- `400` — bad request (client error, validation failed)
- `401` — not authenticated
- `403` — authenticated but not authorized
- `404` — resource not found
- `500` — server error (never expose internals in message)

### Validation
Always validate incoming data before touching the database.

```typescript
// Using Zod
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  role: z.enum(['admin', 'member']),
});

const parsed = createUserSchema.safeParse(req.body);
if (!parsed.success) {
  return Response.json(
    { data: null, error: { message: 'Invalid input', code: 'VALIDATION_ERROR' } },
    { status: 400 }
  );
}
```

---

## Database

### Naming conventions
- Tables: `snake_case`, plural — `users`, `order_items`, `payment_transactions`
- Columns: `snake_case` — `created_at`, `user_id`, `is_active`
- Primary keys: `id` (UUID preferred over integer)
- Foreign keys: `referenced_table_singular_id` — `user_id`, `order_id`
- Timestamps: every table has `created_at` and `updated_at`

### Standard table columns
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
```

### Query rules
- Never `SELECT *` in production queries — select only needed columns
- Always use parameterized queries — never string-interpolate user input into SQL
- Paginate large result sets — never return unbounded lists
- Add indexes on columns used in `WHERE`, `JOIN`, and `ORDER BY`

---

## Security Rules

These are non-negotiable:

1. **Never trust client input.** Validate everything on the server.
2. **Never expose internal errors.** Log the full error, return a safe message.
3. **Authorization check on every protected route.** Verify the user owns the resource.
4. **No secrets in code.** All keys and credentials via environment variables.
5. **Rate limit sensitive endpoints.** Auth, password reset, email verification.

```typescript
// Authorization pattern — always verify ownership
const item = await db.items.findById(itemId);

if (!item) {
  return Response.json({ error: 'Not found' }, { status: 404 });
}

// CRITICAL: check ownership before returning or modifying
if (item.userId !== session.userId) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## Error Handling

```typescript
// Wrap async route handlers
export async function GET(req: Request) {
  try {
    const data = await someOperation();
    return Response.json({ data, error: null });
  } catch (error) {
    // Log full error internally
    console.error('[GET /api/route] failed:', error);
    // Return safe message to client
    return Response.json(
      { data: null, error: { message: 'Request failed', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
```

---

## Auth Patterns

```typescript
// Always verify session at the top of protected handlers
const session = await getSession(req);

if (!session) {
  return Response.json(
    { data: null, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
    { status: 401 }
  );
}

// Then proceed with session.userId available
```

---

## Environment Variables

```bash
# Required for all environments
DATABASE_URL=
[YOUR_AUTH_SECRET]=

# Required for production only
[LIST PROD-ONLY VARS]

# Optional / dev only
[LIST DEV-ONLY VARS]
```

Add new env vars to:
1. `.env.example` (with placeholder, not real value)
2. This skill file (above list)
3. Your deployment platform's environment settings

---

## Self-Audit (run when asked to check the backend)

> Full protocol in `skills/core/self-audit.md`. This is your domain-specific checklist.

Load `skills/core/self-audit.md` and run the universal checks, then these:

### Security (P1 if failing)
- [ ] Every protected API route checks the session before doing anything?
- [ ] Every protected resource checks ownership (`item.userId === session.userId`)?
- [ ] Every webhook handler verifies the signature?
- [ ] No raw SQL string interpolation — all queries use parameterized values?
- [ ] No secrets, credentials, or PII in logs?

### Correctness
- [ ] All API routes return `{ data, error }` shape consistently?
- [ ] All async handlers wrapped in try/catch — no unhandled promise rejections?
- [ ] All inputs validated with Zod before touching the DB?
- [ ] All error responses return safe messages (no stack traces, no DB errors)?
- [ ] All new DB tables have RLS policies enabled?

### Architecture
- [ ] No `SELECT *` in production queries?
- [ ] All large result sets paginated?
- [ ] All frequently-queried columns indexed?
- [ ] All new env vars added to `.env.example`?
- [ ] All third-party SDKs initialized in `lib/` — not in route handlers?

### Test Health
- [ ] Happy path tested for every route?
- [ ] Auth failure tested for every protected route?
- [ ] Validation failure tested for every route that accepts input?

**When you find issues:**
- P1/P2 → fix immediately, commit with `fix(backend): ...`
- P3 → add slice to `planning/EXECUTION-PLAN.md`, write audit report to `planning/ACTIVE.md`
