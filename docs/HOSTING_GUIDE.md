# Abilix AI Marketing Studio — Complete Hostinger Hosting Guide

Everything you need to take this project from GitHub to a live site on **Hostinger Node.js Hosting** with **Hostinger MySQL**. No Docker, PM2, Redis, Nginx or Apache configuration required.

---

## 1. Full tech stack

### Frontend
| Piece | Version / Notes |
|---|---|
| React | 19 |
| Vite | 5 (build tool + dev server) |
| TypeScript | 5 |
| Tailwind CSS | 3 (dark/light mode via `class`) |
| React Router | 6 |
| React Query (`@tanstack/react-query`) | 5 (server-state/caching) |
| Axios | 1 (HTTP client, token refresh interceptor) |
| Framer Motion | 11 (animations) |
| Recharts | 2 (charts/graphs) |
| Lucide React | icons |
| Zod | validation |

Build output: static files in `client/dist` (served by the Node server in production).

### Backend
| Piece | Version / Notes |
|---|---|
| Node.js | 18+ LTS |
| Express | 4 |
| TypeScript | 5 (compiled to `server/dist`) |
| mysql2 | connection pooling, parameterized queries, transactions |
| jsonwebtoken | JWT access + refresh tokens |
| bcryptjs | password hashing |
| helmet | security headers + CSP |
| cors | CORS allow-list |
| compression | gzip responses |
| morgan | request logging |
| express-rate-limit | rate limiting |
| multer | file uploads (type + size restricted) |
| nodemailer | SMTP email (verification, password reset) |
| zod | request validation |
| cookie-parser | httpOnly refresh cookie |

### Database
- **MySQL 8** (Hostinger). Fully normalized: 41 tables, foreign keys, indexes, 2 views.
- Schema + seed in `database/` (`schema.sql`, `seed.sql`, `installation.sql`).

### AI (optional, provider-agnostic)
- OpenAI-compatible (`OPENAI_API_KEY`) **or** Anthropic (`ANTHROPIC_API_KEY` + `AI_PROVIDER=anthropic`).
- Powers the AI Content / Image / Video studios. App runs fine without a key (those features show a "not configured" message).

### Runtime model on Hostinger
One Node process. It serves:
- REST API at `/api/*`
- uploaded media at `/uploads/*`
- the built React SPA for every other route.

Start command: `npm start` → `node server/dist/index.js`.

---

## 2. Prerequisites

- A Hostinger plan that includes **Node.js hosting** and **MySQL databases** (Business / Cloud plans, or VPS).
- A **GitHub** account with this project pushed to a repository.
- A domain or subdomain pointed at the Hostinger site.

---

## 3. Complete environment variables

Set these in **hPanel → Node.js app → Environment variables** (never commit `.env`).

### Required
| Variable | Example | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Enables prod security + SPA serving |
| `JWT_SECRET` | `9f3c…64+ random chars` | Signs access tokens — make it long & random |
| `JWT_REFRESH_SECRET` | `a17b…64+ random chars` | Signs refresh tokens — different from above |
| `DB_HOST` | `localhost` | Hostinger MySQL host (often `localhost`) |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `u123_abilix` | Your Hostinger DB name |
| `DB_USER` | `u123_abilix` | Your Hostinger DB user |
| `DB_PASSWORD` | `••••••••` | Your Hostinger DB password |
| `APP_URL` | `https://yourdomain.com` | Public URL of the app |
| `CLIENT_URL` | `https://yourdomain.com` | Used in email links |
| `CORS_ORIGIN` | `https://yourdomain.com` | Comma-separate for multiple origins |

> **Do NOT set `PORT`.** Hostinger assigns it automatically; the app reads `process.env.PORT` (falls back to 3000 locally).

### Token lifetimes (optional — sensible defaults)
| Variable | Default |
|---|---|
| `JWT_ACCESS_EXPIRES` | `15m` |
| `JWT_REFRESH_EXPIRES` | `7d` |
| `DB_CONNECTION_LIMIT` | `10` |

### AI (optional)
| Variable | Notes |
|---|---|
| `AI_PROVIDER` | `openai` (default) or `anthropic` |
| `OPENAI_API_KEY` | Enables AI features |
| `OPENAI_BASE_URL` | `https://api.openai.com/v1` (or any OpenAI-compatible endpoint) |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `ANTHROPIC_API_KEY` | If using Anthropic |
| `ANTHROPIC_MODEL` | `claude-3-5-sonnet-latest` |

### Google sign-in (optional)
| Variable | Notes |
|---|---|
| `GOOGLE_CLIENT_ID` | From Google Cloud Console → OAuth credentials |
| `GOOGLE_CLIENT_SECRET` | Same |
| `GOOGLE_CALLBACK_URL` | `https://yourdomain.com/api/auth/google/callback` |

### Email / SMTP (optional but recommended)
| Variable | Notes |
|---|---|
| `SMTP_HOST` | e.g. `smtp.hostinger.com` |
| `SMTP_PORT` | `465` (secure) or `587` |
| `SMTP_SECURE` | `true` for port 465, else `false` |
| `SMTP_USER` | Your Hostinger email address |
| `SMTP_PASS` | Email password |
| `MAIL_FROM` | `"Abilix <no-reply@yourdomain.com>"` |

Without SMTP, verification/reset links are logged instead of emailed (app still works).

### Meta / WhatsApp (optional integrations)
| Variable | Notes |
|---|---|
| `META_APP_ID`, `META_APP_SECRET` | Facebook/Instagram |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_ID` | WhatsApp Cloud API |

### Uploads / security (optional — defaults fine)
| Variable | Default |
|---|---|
| `UPLOAD_DIR` | `public/uploads` |
| `MAX_UPLOAD_MB` | `10` |
| `RATE_LIMIT_WINDOW_MIN` | `15` |
| `RATE_LIMIT_MAX` | `300` |

**Generate strong secrets** (run locally, paste the output):
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## 4. Create the MySQL database on Hostinger

1. **hPanel → Databases → MySQL Databases.**
2. Create a new database; note the **name, user, password, host**.
3. These become your `DB_*` env variables above.

### Import the schema (phpMyAdmin — easiest)
1. Open **phpMyAdmin** for that database.
2. **Import** tab → upload `database/schema.sql` → **Go**.
3. **Import** tab → upload `database/seed.sql` → **Go** (creates roles, permissions, and the default admin + demo data).

### Or via the installer script (if you have SSH)
```bash
npm run build
node server/dist/scripts/install-db.js
```
Creates the database if missing, applies schema, seeds data.

**Default login after seeding:** `admin@abilix.ai` / `Admin@12345` — change it immediately.

---

## 5. Push to GitHub

```bash
git init
git add .
git commit -m "Abilix AI Marketing Studio"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
`node_modules`, `.env`, and build output are already gitignored.

---

## 6. Create the Node.js application on Hostinger

1. **hPanel → Advanced → Node.js → Create application.**
2. Configure:
   - **Node version:** 18 or higher
   - **Application root:** the deploy folder
   - **Application startup file:** `server/dist/index.js`
   - **Application URL:** your domain/subdomain
3. Connect the **GitHub repository** (Hostinger Git deployment) or upload the files.

---

## 7. Set environment variables

In the Node.js app panel, add all **Required** variables from section 3 (plus any optional ones you want). Save.

---

## 8. Install, build, start

From the Node.js panel buttons or SSH, in this order:
```bash
npm install      # installs client + server deps (npm workspaces)
npm run build    # builds client/dist and server/dist
```
Then **Start / Restart** the app (runs `server/dist/index.js`).

Standard Hostinger flow, all three in one place:
```bash
npm install
npm run build
npm start
```

---

## 9. Domain, SSL, first login

1. Point your domain/subdomain to the Node app (hPanel domain settings).
2. Enable **free SSL** (hPanel → SSL) so the site is `https://`.
3. Visit your domain, sign in as `admin@abilix.ai` / `Admin@12345`, then change the password in **Profile**.

---

## 10. Redeploying updates

1. `git push` your changes.
2. Pull in the Hostinger Git panel (or enable auto-deploy).
3. `npm install` (only if deps changed) → `npm run build`.
4. **Restart** the application.

---

## 11. Troubleshooting

| Symptom | Cause / Fix |
|---|---|
| Login returns **500** | Database not reachable or not imported. Check `DB_*`; run the schema + seed import. |
| `ECONNREFUSED …:3306` in logs | MySQL host/port wrong, or DB not started. |
| `ER_ACCESS_DENIED_ERROR` | Wrong `DB_USER`/`DB_PASSWORD`. |
| `Unknown database` / `ER_NO_SUCH_TABLE` | Import `schema.sql` then `seed.sql`. |
| Blank page, API works | `client/dist` missing — run `npm run build`, then restart. |
| CORS errors in browser console | Set `CORS_ORIGIN` to your exact domain (with `https://`). |
| "OPENAI_API_KEY is not configured" | Add the key (or `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`) and restart. |
| Emails not sending | Configure `SMTP_*`. |
| Uploads disappear | Ensure `public/uploads` is writable / persistent on your plan; or set `UPLOAD_DIR`. |

---

## 12. Quick checklist

- [ ] MySQL database created; `schema.sql` + `seed.sql` imported
- [ ] Repo pushed to GitHub
- [ ] Node.js app created; startup file = `server/dist/index.js`
- [ ] All **Required** env vars set (secrets are long & random; `PORT` left unset)
- [ ] `npm install` → `npm run build` → **Restart**
- [ ] Domain + SSL configured
- [ ] Logged in and changed the admin password
