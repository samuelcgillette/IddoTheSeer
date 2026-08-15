# Starter Code - React + Express + PostgreSQL

This is a starter project with a working user authentication system. It uses React (via Vite) for the frontend, Express for the backend API, and PostgreSQL for the database.

## Getting Started

### 1. Run the setup script

After cloning the repo, run:

```bash
./setup.sh
```

The script is interactive — it will prompt you for a project name, description, and database credentials (each with sensible defaults), then handle the rest. See [What `setup.sh` does](#what-setupsh-does) below for details.

> **Prerequisites:** `node`/`npm` and the `psql` client must be on your `PATH`. The script auto-detects how to connect to PostgreSQL on macOS (Homebrew), Linux/WSL (apt), and any setup with trust auth; on other platforms it falls back to prompting for a superuser password.

### 2. Start the development servers

You need **two terminals** running at the same time:

**Terminal 1 — Express backend:**
```bash
npm run server-dev
```

**Terminal 2 — Vite frontend:**
```bash
npm run client-dev
```

### 3. Open the app

Go to **http://localhost:3000** in your browser. This is the Express server, which serves the HTML page and loads the React app from the Vite dev server.

Do **not** open the Vite URL (port 5173) directly. Always use the Express URL so that API calls and cookies work correctly.

## What `setup.sh` does

The script walks through the steps below. It's safe to re-run — the git rename is idempotent and it asks before overwriting an existing `.env`.

1. **Sanity checks.** Verifies `psql` and `npm` are available; aborts early with a clear message if either is missing.
2. **Renames the git remote.** Renames the cloned `origin` to `upstream` so you can later point `origin` at your own repo (`git remote add origin <your-repo-url>`). Skipped if `upstream` already exists or you're not in a git repo.
3. **Prompts for project metadata.** Asks for a project name and description, defaulting to `starter-app` and the generic starter description.
4. **Prompts for database config.** Asks for the DB user, password (hidden input), database name, host, and port — all with defaults.
5. **Detects how to connect to PostgreSQL as a superuser.** Tries, in order: connecting as your current OS user (macOS Homebrew default), connecting as the `postgres` role without a password (trust auth), `sudo -u postgres psql` (Linux/WSL apt installs), and finally prompting you for a superuser name + password.
6. **Updates `package.json`.** Writes the project name and description you entered using `node` (so JSON quoting is handled correctly).
7. **Runs `npm install`.**
8. **Creates the PostgreSQL user and database** using the superuser connection from step 5.
9. **Writes `.env`** with `DATABASE_URL`, `PORT=3000`, and `VITE_ORIGIN=http://localhost:5173`.
10. **Runs `npm run migrate`** to create the `users` and `sessions` tables.

When you add your own migration files to `server/migrations/`, run `npm run migrate` again to apply them.

## Manual setup

If you can't run the script (e.g., on native Windows without WSL or Git Bash), do the equivalent manually:

1. Run `npm install`.
2. Open `psql` as your superuser and run:
   ```sql
   CREATE USER your_user WITH PASSWORD 'your_password';
   CREATE DATABASE your_db WITH OWNER your_user;
   ```
3. Copy `.env.example` to `.env` and fill in the `DATABASE_URL`:
   ```
   DATABASE_URL=postgres://your_user:your_password@localhost:5432/your_db
   PORT=3000
   VITE_ORIGIN=http://localhost:5173
   ```
4. Run `npm run migrate`.
5. (Optional) Edit `name` and `description` in `package.json`.
6. (Optional) `git remote rename origin upstream` and add your own `origin`.

## What's Included

### Backend (`server/`)
- `server.js` - Express app with middleware and route mounting
- `db/connection.js` - PostgreSQL connection pool
- `migrate.js` - Migration runner (reads SQL files from `migrations/`)
- `migrations/` - SQL migration files (001_users.sql, 002_sessions.sql)
- `controllers/auth.js` - Registration, login, logout, and current user endpoints
- `models/users.js` - User and session database functions
- `middleware/auth.js` - `loadUser` (attaches user to every request) and `requireAuth` (returns 401 if not logged in)

### Frontend (`client/src/`)
- `main.jsx` - React entry point with BrowserRouter and AuthProvider
- `App.jsx` - Root component with routes
- `contexts/AuthContext.jsx` - React context for global auth state (user, redirectUrl)
- `hooks/useRequireUser.js` - Custom hook that returns the user or redirects to login
- `components/Navbar.jsx` - Navigation bar
- `pages/Login.jsx` - Login page
- `pages/Register.jsx` - Registration page
- `pages/Home.jsx` - Home page (requires login)

## Auth API Endpoints

These are already implemented and working:

- `POST /api/auth/register` - Create account (sets session cookie)
- `POST /api/auth/login` - Log in (sets session cookie)
- `POST /api/auth/logout` - Log out (clears session cookie)
- `GET /api/auth/me` - Get current logged-in user (or null)

## Adding Your Own Code

- **New migration files** go in `server/migrations/` (e.g. `003_polls.sql`). Run `npm run migrate` to apply them.
- **New API routes** go in `server/controllers/`. Create a router file and mount it in `server.js`.
- **New database functions** go in `server/models/`.
- **New React pages** go in `client/src/pages/`. Add routes for them in `App.jsx`.
- **New React components** go in `client/src/components/`.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run server-dev` | Start the Express server with auto-restart on changes |
| `npm run client-dev` | Start the Vite dev server for React |
| `npm run migrate` | Run database migrations |
