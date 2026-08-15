# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

Full-stack starter app: React 19 frontend (Vite) + Express backend + PostgreSQL. Includes session-based auth (bcrypt + httpOnly cookies) out of the box.

## Commands

- `npm run server-dev` — Express server with auto-restart (port 3000)
- `npm run client-dev` — Vite dev server (port 5173)
- `npm run migrate` — Run pending SQL migrations

Both dev servers must run simultaneously. Express serves the HTML shell and API; Vite provides HMR for React.

For production, build the client with `npx vite build client` — Express serves the built files from `client/dist`.

## Architecture

**Dev server wiring:** Express (port 3000) serves a Handlebars template that loads scripts from the Vite dev server (port 5173). API requests go directly to Express; asset/module requests are proxied to Vite. In production, Express serves static files from `client/dist` instead.

**Auth flow:** Cookie-based sessions stored in a `sessions` table. The `loadUser` middleware runs on every request, attaching `req.user` from the session cookie. Protected API routes use `requireAuth` middleware. On the client, `AuthContext` holds user state and `useRequireUser` redirects unauthenticated users to login.

**Database migrations:** SQL files in `server/migrations/` numbered sequentially (e.g., `001_users.sql`). The custom runner in `server/migrate.js` tracks applied migrations in a `schema_migrations` table and runs each in a transaction.

## React Guidelines

### Components
- Build small, reusable components with a single responsibility. If a component is doing too much, split it up.
- Accept props to make components configurable rather than hardcoding values. Prefer `children` for component composition over deeply nested props.
- Keep components pure — given the same props, they should render the same output. Move side effects into hooks or event handlers.
- Co-locate related files (component, styles, tests) rather than grouping by file type.

### Hooks
- Extract reusable logic into custom hooks (e.g., `useAuth`, `useRequireUser`). A custom hook is the right call whenever two or more components share stateful logic.
- Name custom hooks with the `use` prefix and place them in `client/src/hooks/`.
- Keep hooks focused — one concern per hook. Compose smaller hooks together rather than building monolithic ones.
- Use the built-in hooks correctly: `useState` for local state, `useEffect` for side effects and syncing with external systems, `useRef` for values that persist across renders without triggering re-renders.

### State Management
- Lift state to the nearest common ancestor that needs it — no higher.
- Use React Context (like `AuthContext`) for truly global state that many components need. Don't reach for context when prop drilling through 1-2 levels is simpler.
- Keep server state (fetched data) separate from UI state (form inputs, toggles). Fetch data in hooks or effects, not inline in render logic.

### General Patterns
- Use `function` declarations for components and named exports where possible.
- Handle loading and error states explicitly — don't let components render in an undefined state.
- Prefer controlled form inputs (value + onChange) as shown in the existing Login/Register pages.

## Backend Guidelines

### MVC Structure
- Follow MVC strictly: **Models** (`server/models/`) handle all database access, **Controllers** (`server/controllers/`) handle request/response logic, **Routes** mount controllers onto Express.
- Never write SQL or call the database directly from controllers or route handlers — always go through a model function.
- Models should export plain functions that take parameters and return data. Keep them unaware of `req`/`res`.
- Controllers receive `req` and `res`, call model functions, and send responses. Keep business logic thin — if a controller is doing too much, extract helpers or push logic into models.

### Routes & Middleware
- Group related routes into their own router file and mount them under `/api/` in `server.js`.
- Use middleware for cross-cutting concerns (auth, validation, logging). Place reusable middleware in `server/middleware/`.

### Database
- All schema changes go through numbered migration files in `server/migrations/`. Never modify the database schema by hand.
- Use parameterized queries (`$1`, `$2`) to prevent SQL injection — never interpolate user input into SQL strings.

## Key Conventions

- Server routes mount under `/api/` (e.g., `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`)
- Client routing uses React Router v7 — import from `react-router`, not `react-router-dom`
- Environment variables: copy `.env.example` to `.env` and configure DB credentials
- Client pages that require auth call the `useRequireUser()` hook
