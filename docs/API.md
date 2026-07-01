# API Reference

Base URL: `/api`
All responses use a consistent envelope:

```json
{ "success": true, "message": "OK", "data": { } }
```

Errors:

```json
{ "success": false, "message": "Human-readable error", "details": [ ] }
```

Authentication: send the access token as `Authorization: Bearer <accessToken>`.
The refresh token is stored in an httpOnly cookie (`abilix_rt`) and can also be passed in the body.

---

## Auth — `/api/auth`

| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/register` | — | `firstName, lastName?, email, password, companyName?` | Create account, returns user + tokens |
| POST | `/login` | — | `email, password, remember?` | Email/password login |
| POST | `/google` | — | `idToken` | Google sign-in (verifies Google ID token) |
| POST | `/refresh` | cookie/body | `refreshToken?` | Rotate tokens, returns new access token |
| POST | `/logout` | — | `refreshToken?` | Revoke refresh token |
| POST | `/forgot-password` | — | `email` | Email a reset link |
| POST | `/reset-password` | — | `token, password` | Set a new password |
| POST | `/verify-email` | — | `token` | Verify email address |
| GET | `/me` | ✔ | — | Current user profile |
| PATCH | `/me` | ✔ | `firstName?, lastName?, phone?, avatarUrl?` | Update profile |
| POST | `/change-password` | ✔ | `currentPassword, newPassword` | Change password |

---

## Dashboard — `/api/dashboard`

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/` | `dashboard.view` | Full dashboard payload (stats, charts, activity, upcoming) |
| GET | `/stats` | `dashboard.view` | Summary counters only |

---

## AI — `/api/ai`

| Method | Path | Permission | Body | Description |
|---|---|---|---|---|
| GET | `/status` | auth | — | Whether an AI provider key is configured |
| POST | `/generate` | `ai.content` | `feature, prompt, tone?, language?, action?, brandVoice?, maxTokens?` | Generate marketing copy |
| GET | `/history` | `ai.content` | — | Paginated prompt history |

`feature` examples: `blog`, `instagram_caption`, `linkedin`, `ad_copy`, `meta_description`, `reels_script`, `seo_faqs`.
`action`: `generate` \| `rewrite` \| `expand` \| `summarize` \| `translate`. `language`: `en` \| `ml`.

---

## Resource endpoints (REST CRUD)

Each supports: `GET /` (paginated, `?page&pageSize&search&sort&order&status`), `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`.

| Resource | Path | Write permission |
|---|---|---|
| Campaigns | `/api/campaigns` | `campaigns.manage` |
| Leads | `/api/leads` | `leads.manage` |
| Posts | `/api/posts` | `posts.manage` |
| Tasks | `/api/tasks` | `dashboard.view` |
| Content Library | `/api/content` | `ai.content` |
| SEO Projects | `/api/seo-projects` | `seo.manage` |
| Email Campaigns | `/api/email-campaigns` | `email.manage` |
| WhatsApp Campaigns | `/api/whatsapp-campaigns` | `whatsapp.manage` |
| Blog Articles | `/api/blog` | `seo.manage` |
| Automations | `/api/automations` | `campaigns.manage` |
| Google Business | `/api/google-business` | `posts.manage` |
| Reports | `/api/reports` | `reports.manage` |

---

## Media — `/api/media`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List uploaded media (paginated) |
| POST | `/` | Upload a file (`multipart/form-data`, field `file`, optional `altText`) |
| DELETE | `/:id` | Delete a media record |

Allowed types: JPEG, PNG, WebP, GIF, SVG, MP4, WebM, PDF. Max size from `MAX_UPLOAD_MB` (default 10 MB).

---

## Notifications — `/api/notifications`

| Method | Path | Description |
|---|---|---|
| GET | `/` | List current user's notifications |
| GET | `/unread-count` | Unread count |
| POST | `/:id/read` | Mark one read |
| POST | `/read-all` | Mark all read |
| DELETE | `/:id` | Delete |

---

## Settings — `/api/settings`

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/company` | auth | Company profile |
| PUT | `/company` | `settings.manage` | Update company profile |
| GET | `/brand-kit` | auth | Brand kit |
| PUT | `/brand-kit` | `settings.manage` | Upsert brand kit |
| GET | `/` | auth | Key/value settings map |
| PUT | `/` | `settings.manage` | Update key/value settings |

---

## Admin — `/api/admin`

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/users` | `users.manage` | List users (paginated, `?search`) |
| POST | `/users` | `users.manage` | Create user |
| PATCH | `/users/:id` | `users.manage` | Update user (name, role, status) |
| DELETE | `/users/:id` | `users.manage` | Delete user |
| GET | `/roles` | `roles.manage` | Roles with user counts |
| GET | `/permissions` | `roles.manage` | All permissions |
| GET | `/roles/:id/permissions` | `roles.manage` | Permission ids for a role |
| PUT | `/roles/:id/permissions` | `roles.manage` | Replace a role's permissions |
| GET | `/activity` | `audit.view` | Activity log (paginated) |
| GET | `/storage` | `settings.manage` | Storage usage (file count, bytes) |

---

## Analytics — `/api/analytics`

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/` | `analytics.view` | Timeseries, funnel, sources, campaigns |
| GET | `/top-content` | `analytics.view` | Recent top posts |

---

## Health

`GET /api/health` → `{ success, status: "ok", service, time }` (no auth).

---

## Roles & permissions

Roles: `super_admin`, `admin`, `marketing_manager`, `content_writer`, `graphic_designer`, `video_editor`, `seo_executive`, `sales_executive`, `client`, `viewer`.

`super_admin` bypasses permission checks. All other roles are gated by the `role_permissions` table (see `database/seed.sql`).
