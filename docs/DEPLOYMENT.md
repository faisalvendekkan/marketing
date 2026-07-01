# Deployment Guide — Hostinger Node.js Hosting

This guide deploys Abilix AI Marketing Studio to **Hostinger Node.js Hosting** using **GitHub** and **Hostinger MySQL**. No Docker, PM2, Nginx or Apache configuration is required.

---

## 1. Prerequisites

- A Hostinger plan that includes **Node.js hosting** and **MySQL databases**.
- A GitHub repository containing this project.
- Node.js 18+ locally (only needed if you want to test before pushing).

---

## 2. Create the MySQL database

1. In **hPanel → Databases → Management**, create a new MySQL database.
2. Note the **database name**, **username**, **password**, and **host** (often `localhost` on Hostinger, sometimes a dedicated host).
3. Keep these — they become your `DB_*` environment variables.

### Import the schema

**Option A — phpMyAdmin (recommended for shared hosting):**
1. Open **phpMyAdmin** for your database.
2. Go to the **Import** tab and upload `database/schema.sql`. Run it.
3. Import `database/seed.sql` the same way (creates roles, permissions and the default admin).

**Option B — installer script (if you have shell/SSH):**
```bash
npm run build
node server/dist/scripts/install-db.js
```
This creates the database if missing, applies the schema, and seeds it.

---

## 3. Push the project to GitHub

```bash
git init
git add .
git commit -m "Abilix AI Marketing Studio"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

`node_modules`, `.env`, and build output are already excluded via `.gitignore`.

---

## 4. Create the Node.js application on Hostinger

1. In **hPanel → Advanced → Node.js**, click **Create application**.
2. Set:
   - **Node version:** 18 or higher.
   - **Application root:** the folder where the repo is deployed.
   - **Application startup file:** `server/dist/index.js`
   - **Application URL:** your domain or subdomain.
3. Connect the app to your **GitHub repository** (Hostinger's Git deployment), or upload the files.

---

## 5. Configure environment variables

In the Node.js app panel, add the environment variables from `.env.example`. At minimum:

```
NODE_ENV=production
JWT_SECRET=<long-random-string>
JWT_REFRESH_SECRET=<another-long-random-string>
DB_HOST=localhost
DB_PORT=3306
DB_NAME=<your_db>
DB_USER=<your_user>
DB_PASSWORD=<your_password>
APP_URL=https://your-domain.com
CLIENT_URL=https://your-domain.com
CORS_ORIGIN=https://your-domain.com
```

Optional (enable when ready): `OPENAI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SMTP_*`.

> Do **not** set `PORT` manually — Hostinger provides it automatically and the app reads `process.env.PORT`.

---

## 6. Install & build

In the Hostinger Node.js panel use the provided buttons/commands (or SSH):

```bash
npm install
npm run build
```

- `npm install` installs client + server dependencies (npm workspaces).
- `npm run build` compiles the React client into `client/dist` and the TypeScript server into `server/dist`.

---

## 7. Start

Hostinger runs the startup file (`server/dist/index.js`). Use **Restart** in the panel after each deploy, or:

```bash
npm start
```

The single Node process serves:
- the REST API at `/api/*`
- uploaded media at `/uploads/*`
- the built React SPA for all other routes.

Visit your domain and sign in with `admin@abilix.ai` / `Admin@12345`, then change the password.

---

## 8. Redeploying updates

1. Push changes to GitHub.
2. Pull them in the Hostinger Git panel (or auto-deploy).
3. Run `npm install` (if dependencies changed) and `npm run build`.
4. **Restart** the application.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| 500 errors on API, logs show DB connection failure | Re-check `DB_*` variables; confirm the DB user has access from the app host. |
| Blank page but API works | Ensure `npm run build` produced `client/dist`; restart the app. |
| "OPENAI_API_KEY is not configured" | Add the key in env vars and restart, or set `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY`. |
| Emails not sending | Configure `SMTP_*`. Without SMTP, verification/reset links are logged, not emailed. |
| Uploads not persisting | Confirm the `public/uploads` folder is writable on your plan. |

---

## File storage note

Uploads are written to `public/uploads` and served at `/uploads`. This works on standard Hostinger Node.js hosting. If your plan uses ephemeral storage, point `UPLOAD_DIR` at a persistent path provided by Hostinger.
