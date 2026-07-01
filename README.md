# Abilix AI Marketing Studio

A modern, AI-powered marketing management platform. Create content, schedule social posts, capture and track leads, run email & WhatsApp campaigns, optimize SEO, and measure performance — all from one dashboard.

Built to deploy on **Hostinger Node.js Hosting** with **Hostinger MySQL**, using only Node.js, Express and MySQL. No Docker, Redis, Mongo, Postgres, Firebase or Supabase required.

---

## Tech stack

**Frontend:** React 19, Vite, TypeScript, Tailwind CSS, React Router, React Query, Axios, Framer Motion, Recharts, Lucide icons, Zod.

**Backend:** Node.js (LTS), Express, TypeScript, MySQL (`mysql2` with connection pooling), JWT (access + refresh), bcrypt, Helmet, CORS, compression, morgan, express-rate-limit, multer, Zod.

**Database:** MySQL 8 (Hostinger) — fully normalized schema with foreign keys, indexes and views.

---

## Project structure

```
Marketing_system/
├── client/              # React 19 + Vite front-end
│   ├── src/
│   │   ├── components/   # UI primitives + reusable components
│   │   ├── context/      # Auth, Theme, Toast providers
│   │   ├── hooks/        # useResource, useNotifications
│   │   ├── layouts/      # Sidebar, Topbar, DashboardLayout
│   │   ├── lib/          # api client, utils, nav config
│   │   ├── pages/        # auth, dashboard, module pages
│   │   └── types/        # shared TypeScript types
│   └── package.json
├── server/              # Express + TypeScript API
│   ├── src/
│   │   ├── config/       # env, mysql pool
│   │   ├── controllers/  # request handlers
│   │   ├── middleware/   # auth, validation, rate limit, upload, errors
│   │   ├── routes/       # route definitions
│   │   ├── services/     # business logic (auth, ai, dashboard, crud)
│   │   ├── utils/        # jwt, crypto, mailer, logger, responses
│   │   ├── validators/   # Zod schemas
│   │   └── scripts/      # install-db.ts
│   └── package.json
├── database/            # schema.sql, seed.sql, installation.sql
├── public/uploads/      # uploaded media (served at /uploads)
├── uploads/             # secondary upload target
├── docs/                # deployment guide, API reference
├── .github/workflows/   # CI
├── .env.example
├── .gitignore
└── package.json         # root — npm workspaces, build/start scripts
```

---

## Quick start (local)

```bash
# 1. Install dependencies (installs client + server via workspaces)
npm install

# 2. Configure environment
cp .env.example .env
#   edit .env — set DB_* credentials and secrets

# 3. Create tables + seed demo data
npm run build            # compiles server + client
node server/dist/scripts/install-db.js
#   (or during dev: npx tsx server/src/scripts/install-db.ts)

# 4a. Development (two dev servers, hot reload)
npm run dev              # client on :5173 (proxies /api to :3000), server on :3000

# 4b. Production preview
npm start                # serves API + built client on PORT (default 3000)
```

**Default login:** `admin@abilix.ai` / `Admin@12345` (change immediately).

---

## Environment variables

See [`.env.example`](./.env.example) for the full list. Core values:

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (Hostinger sets this automatically) |
| `NODE_ENV` | `production` on Hostinger |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Long random strings for signing tokens |
| `DB_HOST` `DB_PORT` `DB_NAME` `DB_USER` `DB_PASSWORD` | Hostinger MySQL credentials |
| `OPENAI_API_KEY` | Enables the AI Content/Image/Video studios (or use `ANTHROPIC_API_KEY` with `AI_PROVIDER=anthropic`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `SMTP_*` | Outbound email (verification, password reset) |

The app runs without AI/SMTP/Google keys — those features degrade gracefully with clear messages until configured.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm install` | Install all dependencies (root + workspaces) |
| `npm run build` | Build client (`client/dist`) and server (`server/dist`) |
| `npm start` | Start the production server (serves API + SPA) |
| `npm run dev` | Run client and server in watch mode |
| `npm run typecheck` | Type-check both packages |
| `node server/dist/scripts/install-db.js` | Create schema + seed data |

---

## Deployment

Full step-by-step instructions for Hostinger (GitHub deploy + MySQL) are in
[`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md).

API reference is in [`docs/API.md`](./docs/API.md).

---

## Security

Parameterized SQL everywhere, bcrypt password hashing, JWT access + rotating refresh tokens stored as hashes, httpOnly refresh cookie, Helmet headers with CSP, CORS allow-list, per-route rate limiting, Zod input validation, file-type and size upload restrictions, and role/permission-based access control on every protected route.

---

## License

Proprietary — © Abilix. All rights reserved.
