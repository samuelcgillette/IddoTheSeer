#!/usr/bin/env bash
#
# One-shot setup for this starter project. Installs npm deps, creates a
# PostgreSQL user + database, writes .env, and runs the initial migrations.
#
# Usage: ./setup.sh

set -euo pipefail

cd "$(dirname "$0")"

echo "=== React + Express + PostgreSQL Starter Setup ==="
echo

# --- Sanity checks ---
if ! command -v psql >/dev/null 2>&1; then
  echo "Error: 'psql' is not on your PATH. Install the PostgreSQL client tools first." >&2
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: 'npm' is not on your PATH. Install Node.js first." >&2
  exit 1
fi

# --- Git remote setup ---
# This project is a template. Rename the cloned 'origin' to 'upstream' so the
# developer can add their own 'origin' for their new repo. Idempotent: if
# 'upstream' already exists (re-run), leave the remotes alone.
if git rev-parse --git-dir >/dev/null 2>&1; then
  if git remote get-url upstream >/dev/null 2>&1; then
    echo "==> Git remote 'upstream' already exists; skipping rename."
  elif git remote get-url origin >/dev/null 2>&1; then
    echo "==> Renaming git remote 'origin' to 'upstream'..."
    git remote rename origin upstream
  fi
fi

# --- Prompt for project metadata ---
read -rp "Project name [starter-app]: " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-starter-app}

read -rp "Project description [A full-stack starter app with React, Express, and PostgreSQL]: " PROJECT_DESCRIPTION
PROJECT_DESCRIPTION=${PROJECT_DESCRIPTION:-"A full-stack starter app with React, Express, and PostgreSQL"}

# --- Prompt for DB config ---
read -rp "Database user [starter_app]: " DB_USER
DB_USER=${DB_USER:-starter_app}

while :; do
  read -rsp "Database password: " DB_PASSWORD
  echo
  if [[ -n "$DB_PASSWORD" ]]; then
    break
  fi
  echo "Password cannot be empty."
done

read -rp "Database name [starter_app]: " DB_NAME
DB_NAME=${DB_NAME:-starter_app}

read -rp "Database host [localhost]: " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -rp "Database port [5432]: " DB_PORT
DB_PORT=${DB_PORT:-5432}

# Confirm before clobbering an existing .env
if [[ -f .env ]]; then
  read -rp ".env already exists. Overwrite? [y/N]: " OVERWRITE
  if [[ ! "$OVERWRITE" =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
  fi
fi

# --- Detect a working way to connect as a Postgres superuser ---
# Strategies, in order of preference:
#   1. Current OS user owns the cluster (macOS Homebrew default).
#   2. 'postgres' role accepts no-password connections (trust auth).
#   3. 'postgres' OS user exists and we can sudo to it (Linux/WSL apt installs).
#   4. Prompt the user for a Postgres superuser + password.
#
# `psql -w` makes psql fail instead of prompting interactively, which is what
# we want during detection.
PSQL_SUPER=()
detect_super() {
  if psql -w -h "$DB_HOST" -p "$DB_PORT" -d postgres -tAc "SELECT 1" >/dev/null 2>&1; then
    PSQL_SUPER=(psql -h "$DB_HOST" -p "$DB_PORT" -d postgres)
    return 0
  fi
  if psql -w -U postgres -h "$DB_HOST" -p "$DB_PORT" -d postgres -tAc "SELECT 1" >/dev/null 2>&1; then
    PSQL_SUPER=(psql -U postgres -h "$DB_HOST" -p "$DB_PORT" -d postgres)
    return 0
  fi
  if command -v sudo >/dev/null 2>&1 && id postgres >/dev/null 2>&1; then
    PSQL_SUPER=(sudo -u postgres psql -d postgres)
    return 0
  fi
  return 1
}

echo
echo "==> Detecting how to connect to PostgreSQL as a superuser..."
if ! detect_super; then
  echo "Could not auto-detect a Postgres superuser connection."
  read -rp "Postgres superuser name [postgres]: " PG_SUPER
  PG_SUPER=${PG_SUPER:-postgres}
  echo "(psql will prompt for the '$PG_SUPER' password.)"
  PSQL_SUPER=(psql -U "$PG_SUPER" -h "$DB_HOST" -p "$DB_PORT" -d postgres -W)
fi
echo "    Using: ${PSQL_SUPER[*]}"

# --- 1. Update package.json with project name + description ---
echo
echo "==> Updating package.json..."
PROJECT_NAME="$PROJECT_NAME" PROJECT_DESCRIPTION="$PROJECT_DESCRIPTION" node -e '
  const fs = require("fs");
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  pkg.name = process.env.PROJECT_NAME;
  pkg.description = process.env.PROJECT_DESCRIPTION;
  fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
'

# --- 2. Install npm deps ---
echo
echo "==> Installing npm dependencies..."
npm install

# --- 3. Create DB user + database ---
echo
echo "==> Creating PostgreSQL user '$DB_USER' and database '$DB_NAME'..."

# Escape single quotes in the password for the SQL string literal
ESCAPED_PASSWORD=${DB_PASSWORD//\'/\'\'}

"${PSQL_SUPER[@]}" -v ON_ERROR_STOP=1 <<SQL
CREATE USER "$DB_USER" WITH PASSWORD '$ESCAPED_PASSWORD';
CREATE DATABASE "$DB_NAME" WITH OWNER "$DB_USER";
SQL

# --- 4. Write .env ---
echo
echo "==> Writing .env..."
cat > .env <<ENV
DATABASE_URL=postgres://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME
PORT=3000
VITE_ORIGIN=http://localhost:5173
ENV

# --- 5. Run migrations ---
echo
echo "==> Running database migrations..."
npm run migrate

echo
echo "Setup complete!"
echo
if git rev-parse --git-dir >/dev/null 2>&1 && ! git remote get-url origin >/dev/null 2>&1; then
  echo "Don't forget to point 'origin' at your new repo:"
  echo "  git remote add origin <your-repo-url>"
  echo
fi
echo "Start the dev servers in two terminals:"
echo "  npm run server-dev"
echo "  npm run client-dev"
