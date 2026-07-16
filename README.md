# Million Todos

A full-stack todo app built to stress-test large datasets: NDJSON streaming, PostgreSQL indexing, client-side virtualization, and efficient rendering at scale.

- **Client:** Next.js (App Router), React, TanStack Query, Zustand
- **Server:** Express, TypeScript, Prisma, PostgreSQL
- **Scale:** Tested locally with up to 2M todos; hosted demo runs ~750k todos

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [Docker](https://www.docker.com/) and Docker Compose
- npm

## Clone the repository

```bash
git clone https://github.com/Kritik-Kapoor/million-todos.git
cd million-todos
```

## Environment variables

This project keeps secrets out of git. Copy the example files and fill in your values:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Server (`server/.env`)

Required variables are documented in `server/.env.example`. At minimum, set:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — secret used to sign auth tokens
- `WEBAPP_DEV_URL` — frontend URL (e.g. `http://localhost:3000`)
- `RESEND_API_KEY` and `EMAIL_FROM` — if using email features

For local development with the Docker Postgres service, use:

```env
DATABASE_URL="postgresql://postgres:million-todos@localhost:5432/million_todos?schema=public"
```

### Client (`client/.env`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
COOKIE_NAME=million-todos-token
```

> **Note:** `.env` files are gitignored. Only `.env.example` files are committed.

## Start with Docker (recommended)

The project uses two Compose files:

- `docker-compose.yml` — PostgreSQL
- `docker-compose.dev.yml` — server and client in dev mode with hot reload

### 1. Create env files

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Edit `server/.env` and set `JWT_SECRET`, email settings, and any other secrets.

When running inside Docker, `DATABASE_URL` is overridden in `docker-compose.dev.yml` to point at the `postgres` service. Your local `server/.env` value is still used when running the server outside Docker.

### 2. Start all services

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

This starts:

| Service  | URL                   |
| -------- | --------------------- |
| Client   | http://localhost:3000 |
| Server   | http://localhost:3001 |
| Postgres | localhost:5432        |

### 3. Run database migrations

In a separate terminal, with the containers running:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec server npx prisma migrate deploy
```

### 4. (Optional) Seed data

Seed todos (update `USER_ID` in the script first):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec server npm run seed:todos
```

Seed subtasks for a todo (update `TODO_ID` in the script first):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec server npm run seed:subtasks
```

### Stop services

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

To reset the database volume:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
```

## Local development (without Docker for app services)

You can run only Postgres in Docker and start the app locally.

### 1. Start Postgres

```bash
docker compose -f docker-compose.yml up -d
```

### 2. Server

```bash
cd server
cp .env.example .env   # if you have not already
npm install
npx prisma migrate deploy
npm run dev
```

### 3. Client

```bash
cd client
cp .env.example .env   # if you have not already
npm install
npm run dev
```

Open http://localhost:3000.

## Project structure

```
million-todos/
├── client/                 # Next.js frontend
├── server/                 # Express API + Prisma
├── docker-compose.yml      # PostgreSQL
└── docker-compose.dev.yml  # Dev server + client overrides
```

## Scripts

### Server

| Command                 | Description               |
| ----------------------- | ------------------------- |
| `npm run dev`           | Start API with hot reload |
| `npm run build`         | Build for production      |
| `npm run start`         | Run production build      |
| `npm run seed:todos`    | Seed todos for a user     |
| `npm run seed:subtasks` | Seed subtasks for a todo  |

### Client

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start Next.js dev server |
| `npm run build` | Production build         |
| `npm run start` | Start production server  |

## Docker notes

- `./server:/app` and `./client:/app` mount your source code into the container; `/app` is the container working directory, not a folder in the repo.
- `.dockerignore` excludes `.env` files from the **image build context** so secrets are never copied into image layers during `COPY`. Runtime configuration is injected via `env_file`, compose `environment`, or volume mounts instead.
- `.gitignore` and `.dockerignore` serve different purposes: git tracks `.env.example` but ignores `.env`; Docker excludes all env files from builds.

## License

Private project.
