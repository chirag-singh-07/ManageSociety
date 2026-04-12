# ManageSociety Backend — API & Architecture Docs

This backend is a multi-tenant REST API for managing residential societies.

- Runtime: Node.js + Express
- Language: TypeScript
- Database: MongoDB (Mongoose ODM)
- Auth: JWT (access + refresh with rotation)
- Tenancy: **shared database** with strict `societyId` isolation
- Roles: `user` (resident), `admin` (society admin), `superadmin` (SaaS operator)

---

## 1) Project structure

Key files:
- App entry (Express wiring): `src/app.ts`
- Server (HTTP listen + graceful shutdown): `src/server.ts`
- Env validation: `src/config/env.ts`
- Mongo connection: `src/config/db.ts`
- Logging: `src/config/logger.ts`
- Middlewares: `src/middlewares/*`
- Modules (domains): `src/modules/*`
- Shared helpers: `src/shared/*`
- Tests: `test/*`

---

## 2) Environment variables

Copy `.env.example` to `.env`.

Required:
- `MONGODB_URI` — Mongo connection string
- `JWT_ACCESS_SECRET` — **min 16 chars**
- `JWT_REFRESH_SECRET` — **min 16 chars**

Common:
- `PORT` — default `4000`
- `JWT_ACCESS_TTL` — default `15m`
- `JWT_REFRESH_TTL` — default `30d`
- `ALLOWED_ORIGINS` — comma-separated list for CORS (admin/dev panels)

Superadmin bootstrap:
- `SUPERADMIN_BOOTSTRAP_KEY` — optional; in production, required to create the very first superadmin

S3 uploads (optional for MVP, required to use `/api/files/presign`):
- `S3_ENDPOINT` — for S3-compatible providers (e.g., MinIO, Cloudflare R2). Leave empty for AWS.
- `S3_REGION`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`
- `S3_BUCKET`
- `S3_PUBLIC_BASE_URL` — used to compute `publicUrl` (`<base>/<key>`)

---

## 3) Auth, tenancy, and roles

### JWT payload
Access tokens contain:
- `userId` (string)
- `role`: `user | admin | superadmin`
- `societyId` (string, optional; **present for user/admin**, absent for superadmin)

### Tenant isolation rules (critical)
- For all tenant routes, the API uses `req.tenant.societyId` (from JWT) to filter data.
- The client must **not** send `societyId` in request bodies to read/write tenant data.
- Every tenant-scoped document has a `societyId` field and indexes start with `societyId`.

### Status rules
- Residents created via invite default to `status=pending` and cannot log in until approved by an admin.
- Admin invites create users with `status=active` so they can log in immediately.

---

## 4) Response format & error handling

Success:
```json
{ "ok": true, "...": "..." }
```

Error:
```json
{
  "ok": false,
  "error": { "code": "SOME_CODE", "message": "Human readable", "details": {} },
  "requestId": "abc123"
}
```

Common HTTP statuses:
- `400` invalid input
- `401` missing/invalid token
- `403` role/permission denied or CORS blocked
- `404` resource not found (also used to prevent tenant leakage)
- `409` conflicts (e.g., already bootstrapped, duplicate email)

---

## 5) Collections (high level)

Tenant-scoped:
- `societies`
- `users`
- `inviteCodes`
- `notices`
- `complaints`
- `comments`
- `files`
- `auditLogs` (society scope)

Global:
- `superadmins`
- `refreshTokens` (records include role + optional societyId)
- `auditLogs` (global scope)

---

## 6) Endpoints

Base URL examples:
- Local: `http://localhost:4000`
- Auth header: `Authorization: Bearer <accessToken>`

### 6.1 Health
#### `GET /health`
Liveness check.

Response:
```json
{ "ok": true, "status": "up" }
```

#### `GET /health/ready`
Readiness check (Mongo connected).

Response:
```json
{ "ok": true, "db": "connected" }
```

---

### 6.2 Auth (`/api/auth`)

#### `POST /api/auth/bootstrap/superadmin`
Create the very first superadmin account (one-time).

Headers:
- `x-bootstrap-key: <SUPERADMIN_BOOTSTRAP_KEY>` (required in production)

Body:
```json
{ "email": "owner@company.com", "password": "LongPassword@123" }
```

Response:
```json
{ "ok": true, "superadmin": { "id": "...", "email": "owner@company.com" } }
```

#### `POST /api/auth/register`
Register via invite code (creates a resident or admin depending on invite type).

Body:
```json
{
  "inviteCode": "ABCDEFGH",
  "name": "Rahul",
  "email": "rahul@example.com",
  "password": "Password@123"
}
```

Response:
```json
{
  "ok": true,
  "user": { "id": "...", "societyId": "...", "role": "user", "status": "pending" },
  "next": "WAIT_FOR_ADMIN_APPROVAL"
}
```

#### `POST /api/auth/login`
Login (works for `user/admin` and also `superadmin`).

Body:
```json
{ "email": "admin@example.com", "password": "Password@123" }
```

Response:
```json
{ "ok": true, "accessToken": "...", "refreshToken": "..." }
```

#### `POST /api/auth/refresh`
Refresh token rotation: old refresh token is revoked, a new pair is issued.

Body:
```json
{ "refreshToken": "..." }
```

Response:
```json
{ "ok": true, "accessToken": "...", "refreshToken": "..." }
```

#### `POST /api/auth/logout`
Revokes the given refresh token.

Body:
```json
{ "refreshToken": "..." }
```

Response:
```json
{ "ok": true }
```

---

### 6.3 Superadmin (`/api/superadmin`) — `role=superadmin`

#### `POST /api/superadmin/societies`
Create a new society (tenant).

Body:
```json
{ "name": "Green View", "trialDays": 14 }
```

Response:
```json
{ "ok": true, "society": { "_id": "...", "name": "Green View", "trialEndsAt": "..." } }
```

#### `GET /api/superadmin/societies`
List societies.

#### `PATCH /api/superadmin/societies/:id`
Update society: status/settings/plan.

Body example:
```json
{ "status": "suspended" }
```

#### `GET /api/superadmin/audit-logs`
Latest global audit logs.

---

### 6.4 Admin (`/api/admin`) — `role=admin` + `societyId` required

#### `GET /api/admin/dashboard`
Basic metrics: active users, open/in-progress complaints.

#### `GET /api/admin/society`
Fetch current society.

#### `PATCH /api/admin/society`
Update society settings (simple object replace).

Body:
```json
{ "settings": { "complaintCategories": ["Water", "Lift"] } }
```

#### Invite codes
##### `POST /api/admin/invite-codes`
Create invite code.

Body:
```json
{ "type": "resident", "expiresInDays": 30, "maxUses": 50 }
```

##### `GET /api/admin/invite-codes`
List invite codes.

##### `POST /api/admin/invite-codes/:id/disable`
Disable invite code.

#### Users/Members
##### `GET /api/admin/users?status=pending`
List users in society (optional status filter).

##### `POST /api/admin/users/:id/status`
Approve/block a user.

Body:
```json
{ "status": "active" }
```

#### Notices
##### `POST /api/admin/notices`
Create notice.

Body:
```json
{
  "title": "Water supply update",
  "body": "Water will be off 2–4pm",
  "attachments": [],
  "audience": "all"
}
```

##### `PATCH /api/admin/notices/:id`
Update notice.

#### Complaints
##### `GET /api/admin/complaints?status=open`
List complaints (optional status filter).

##### `POST /api/admin/complaints/:id/assign`
Assign complaint to an admin userId.

Body:
```json
{ "assignedTo": "<adminUserId>" }
```

##### `POST /api/admin/complaints/:id/status`
Update complaint status (+ optional message).

Body:
```json
{ "status": "resolved", "message": "Fixed by plumber" }
```

---

### 6.5 Tenant endpoints (`/api/*`) — authenticated + `societyId` required

#### `GET /api/me`
Get current user.

#### `PATCH /api/me`
Update profile fields.

Body:
```json
{ "name": "New Name", "phone": "9999999999" }
```

#### Notices
##### `GET /api/notices`
List notices for society.

##### `GET /api/notices/:id`
Get notice (tenant isolated).

#### Complaints
##### `POST /api/complaints`
Create complaint.

Body:
```json
{
  "title": "Lift not working",
  "description": "Lift stuck on 3rd floor",
  "category": "lift",
  "priority": "high",
  "attachments": []
}
```

##### `GET /api/complaints`
List complaints.
- If `role=user`, returns only complaints created by that user.
- If `role=admin`, returns all society complaints.

##### `GET /api/complaints/:id`
Get complaint + comments.
- If `role=user`, only allowed for own complaints.

##### `POST /api/complaints/:id/comments`
Add comment to a complaint.

Body:
```json
{ "message": "Any update?", "attachments": [] }
```

#### Files
##### `POST /api/files/presign`
Get a pre-signed upload URL (S3-compatible).

Body:
```json
{ "mimeType": "image/png", "size": 12345, "fileName": "photo.png" }
```

Response:
```json
{ "ok": true, "fileId": "...", "key": "...", "uploadUrl": "...", "publicUrl": "..." }
```

Upload flow:
1) Call presign to get `uploadUrl`
2) `PUT uploadUrl` with file bytes and `Content-Type`
3) Use `publicUrl`/`fileId` in notice/complaint attachments

---

## 7) How to run locally

1) Start MongoDB (local service or Atlas)
2) Create `.env`
3) Run:
```bash
npm run dev
```

---

## 8) Testing

### Important note (Windows)
`mongodb-memory-server` may fail with `spawn EPERM` on some Windows setups.

Recommended: run tests against a real MongoDB:
- PowerShell:
  - `$env:MONGODB_URI_TEST="mongodb://127.0.0.1:27017/managesociety_test"`
  - `npm test`

Optional: attempt memory server:
- `$env:MONGODB_MEMORY_SERVER="1"`
- `npm test`

---

## 9) Next recommended improvements (when you’re ready)
- OpenAPI/Swagger docs generation
- Notifications + FCM
- Pagination + cursor-based APIs
- Stronger society settings validation schema
- Background jobs (BullMQ + Redis) for fanout events

---

## 10) NoSQL injection protection

The backend includes defense-in-depth protections:
- Request sanitization middleware removes keys that can be used for operator injection:
  - keys starting with `$` (example: `$where`, `$gt`)
  - keys containing `.` (Mongo path traversal)
  - prototype pollution keys (`__proto__`, `constructor`, `prototype`)
- Mongoose `sanitizeFilter` is enabled to reduce risk when building filters.

Important rule: never pass raw client objects directly into MongoDB query filters or update operators.
