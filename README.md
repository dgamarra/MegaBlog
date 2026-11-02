# MegaBlog

A full-stack blogging platform with JWT authentication and automatic NLP analysis of every story. When a post is created or edited, its content is analyzed for **sentiment** (positive / neutral / negative) and **keywords**, which are stored alongside the post and surfaced in the UI.

Built as a monorepo with an Express + MongoDB API and a React + Vite single-page client.

## Features

- **Authentication** — register / login with bcrypt-hashed passwords and JWT bearer tokens (1-day expiry).
- **Post CRUD** — create, read, update and delete stories. Only the author or an `admin` can edit or delete.
- **Automatic NLP analysis** — sentiment score, sentiment label and the top 5 keywords are computed on every create/update.
- **Feed and reader** — browse all stories, read a story, copy its share link.
- **Personal dashboard** — lists the signed-in user's stories with edit/delete actions.
- **Search API** — case-insensitive regex search across title, content and keywords.
- **Dark, responsive UI** — Tailwind CSS v4, Framer Motion animations and Lucide icons.
- **Docker Compose config** — MongoDB, server and client services (see [Docker](#docker)).

## Tech stack

| Layer | Technology |
| --- | --- |
| Client | React 19, Vite 8, React Router 7, Tailwind CSS 4, Framer Motion, Axios, Lucide |
| Server | Node.js, Express 5 (CommonJS), Mongoose 9 |
| Database | MongoDB 7 |
| NLP | [`natural`](https://www.npmjs.com/package/natural) — AFINN sentiment analyzer + word-frequency keywords |
| Auth | `jsonwebtoken`, `bcryptjs` |
| Tooling | Nodemon, Jest + Supertest (configured), ESLint |

## Project structure

```text
MegaBlog/
├── client/                     # React SPA (ESM)
│   ├── public/
│   └── src/
│       ├── components/layout/  # Navbar
│       ├── context/            # AuthContext (localStorage session)
│       ├── pages/              # Home, Login, Register, Dashboard, Create/EditPost, PostDetail
│       └── services/api.js     # Axios instance + token interceptor
├── server/                     # Express API (CommonJS)
│   └── src/
│       ├── controllers/        # HTTP layer
│       ├── db/                 # MongoDB connection
│       ├── middleware/         # auth + error handling
│       ├── models/             # User, Post, Comment schemas
│       ├── repositories/       # data access over Mongoose
│       ├── routes/             # /api/auth, /api/posts
│       ├── services/           # auth, posts, NLP
│       ├── app.js              # Express app
│       └── server.js           # entry point
├── openspec/                   # Spec-driven change proposals and specs
├── docs/                       # reserved (empty)
├── tests/                      # reserved (empty)
├── package.json                # npm workspaces root + project scripts
├── package-lock.json           # single lockfile for both workspaces
├── docker-compose.yml
└── .env.example
```

The server follows a strict layer order:

```text
Route → Controller → Service → Repository → Mongoose model → MongoDB
```

## Getting started

### Prerequisites

- **Node.js 20+** (Vite 8 requires 20.19+ or 22.12+)
- **MongoDB 7** running locally, or Docker

### 1. Install dependencies

The repository is an npm workspaces monorepo. One install at the root installs both
`server` and `client` and writes a single `package-lock.json`:

```sh
npm install
```

Or, equivalently:

```sh
npm run install:all
```

### 2. Configure the environment

Copy the example file into the server directory. `dotenv` loads `.env` from the
process working directory, so it must be `server/.env` when running the server
from `server/`:

```sh
cp .env.example server/.env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example server/.env
```

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `5000` | API port |
| `MONGODB_URI` | `mongodb://localhost:27017/megablog` | MongoDB connection string |
| `JWT_SECRET` | `supersecretkey` | JWT signing secret — **set a real value outside development** |
| `NODE_ENV` | `development` | In `production`, the server also serves `client/dist` |
| `VITE_API_URL` | `http://localhost:5000/api` | API base URL used by the client (optional) |

### 3. Start MongoDB

If you do not already have MongoDB running:

```sh
docker compose up -d mongo
```

Or, without Compose:

```sh
docker run -d --name megablog-mongo -p 27017:27017 mongo:7
```

### 4. Run the apps

From the repository root, start both apps together:

```sh
npm run dev
```

Or run them separately in two terminals:

```sh
# terminal 1 — API on http://localhost:5000
npm run dev:server
```

```sh
# terminal 2 — UI on http://localhost:5173
npm run dev:client
```

Open <http://localhost:5173>.

## Available scripts

### Root (`./`)

| Command | Description |
| --- | --- |
| `npm install` / `npm run install:all` | Install dependencies for both workspaces |
| `npm run install:server` | Install only the server workspace dependencies |
| `npm run install:client` | Install only the client workspace dependencies |
| `npm run dev` | Run API and client together with `concurrently` |
| `npm run dev:server` | Run only the API |
| `npm run dev:client` | Run only the client |
| `npm run build` | Build the client for production |
| `npm start` | Start the API (no watch) |
| `npm test` | Run the server Jest suite |
| `npm run lint` | Lint the client |

### Server (`server/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start with Nodemon (auto-reload) |
| `npm start` | Start with plain Node |
| `npm test` | Run Jest |

### Client (`client/`)

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `client/dist` |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## API reference

Base URL: `http://localhost:5000/api`

Protected endpoints require a bearer token:

```http
Authorization: Bearer <token>
```

Errors normally use this shape (a few handlers return a flat `{ "message": ... }` instead):

```json
{
  "error": {
    "message": "Invalid credentials",
    "status": 500
  }
}
```

### Auth

#### `POST /auth/register`

Creates a user. The `role` field is optional and defaults to `user`.

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

`201 Created` — the user without the password hash:

```json
{
  "id": "4f1c...",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "user",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

#### `POST /auth/login`

```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

`200 OK`:

```json
{
  "user": { "id": "4f1c...", "name": "Jane Doe", "email": "jane@example.com", "role": "user" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Posts

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/posts` | No | List all posts (natural collection order) |
| `GET` | `/posts/search?q=term` | No | Search title, content and keywords |
| `GET` | `/posts/:id` | No | Get one post (`404` if missing) |
| `POST` | `/posts` | Yes | Create a post; runs NLP analysis |
| `PUT` | `/posts/:id` | Yes | Update a post; re-runs NLP if `content` changes. Author or admin only |
| `DELETE` | `/posts/:id` | Yes | Delete a post. Author or admin only (`204`) |

Create / update body:

```json
{
  "title": "Why I love Node.js",
  "content": "Node.js is fast, friendly and wonderfully productive."
}
```

Post representation:

```json
{
  "id": "9a2b...",
  "title": "Why I love Node.js",
  "content": "Node.js is fast, friendly and wonderfully productive.",
  "authorId": "4f1c...",
  "authorName": "Jane Doe",
  "score": 1.2,
  "sentiment": "positive",
  "keywords": ["wonderfully", "productive", "friendly", "node.js", "fast"],
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

## Data models

All IDs are UUID strings generated by the application, exposed as `id` in JSON.

| Model | Fields |
| --- | --- |
| **User** | `id`, `name`, `email`, `password` (bcrypt hash), `role` (`user` \| `admin`, default `user`), `createdAt`, `updatedAt` |
| **Post** | `id`, `title`, `content`, `authorId`, `authorName`, `score`, `sentiment` (`positive` \| `neutral` \| `negative`), `keywords` (string array), `createdAt`, `updatedAt` |
| **Comment** | `id`, `postId`, `content`, `authorId`, `createdAt`, `updatedAt` — model and repository exist, but there are no routes or UI for comments yet |

## NLP analysis

`server/src/services/nlpService.js` runs synchronously on every post create/update:

1. **Sentiment** — tokens are analyzed with `natural`'s AFINN analyzer. A score above `0.2` is `positive`, below `-0.2` is `negative`, otherwise `neutral`.
2. **Keywords** — tokens are lowercased, stopwords and words of 3 characters or fewer are removed, then the 5 most frequent words are kept.

The results are merged into the post as `score`, `sentiment` and `keywords`.

## Frontend routes

| Route | Page | Access |
| --- | --- | --- |
| `/` | Home / feed | Public |
| `/login` | Login | Public |
| `/register` | Register (auto-logs in) | Public |
| `/post/:id` | Post detail | Public |
| `/dashboard` | User's posts | Private |
| `/create` | Create post | Private |
| `/edit/:id` | Edit post | Private |

Session state lives in `localStorage` (`token` + `user`) and is restored on load; the Axios interceptor attaches the token to every request.

## Docker

`docker-compose.yml` defines three services:

- `mongo` — `mongo:7`, persisted via the `mongo_data` volume, port `27017`
- `server` — built from `./server`, port `5000`
- `client` — built from `./client`, port `3000`

```sh
docker compose up --build
```

> **Note:** the `server/` and `client/` **Dockerfiles are not in the repository yet**, so the `server` and `client` builds will fail. Until they are added, use `docker compose up -d mongo` for the database and run the apps with npm (see [Getting started](#getting-started)).

## Testing

Jest and Supertest are configured in `server/package.json`, but no tests exist yet:

```sh
npm test
```

The `tests/` and `docs/` directories are currently empty placeholders.

## Conventions and known limitations

- **Module systems:** the server is CommonJS (`require`), the client is ESM (`import`) with `"type": "module"`. Do not mix them.
- **Tailwind CSS v4:** `client/src/index.css` uses `@import "tailwindcss"` and the `@theme` block; the PostCSS plugin is `@tailwindcss/postcss`.
- **Dashboard filtering:** the dashboard fetches all posts and filters by `authorId` on the client; there is no “posts by user” endpoint.
- **Search UI:** the `GET /posts/search` endpoint exists, but the navbar search input is not wired to it.
- **Comments:** the `Comment` model and `commentRepository` are not connected to any route or service.
- **Error statuses:** most service errors (`Post not found`, `Unauthorized`, `User already exists`, etc.) have no `status` set, so they are returned as `500` by the error middleware. A few handlers also return `{ message }` instead of `{ error: { message, status } }`.
- **JWT secret:** the fallback `'supersecretkey'` is hardcoded in the auth service and middleware. Always set `JWT_SECRET` outside local development.
- **Lockfiles:** a single root `package-lock.json` covers both workspaces (the per-package lockfiles were removed). Do not add nested lockfiles.
- **No test suite** exists yet.

## OpenSpec

This repository uses [OpenSpec](https://github.com/Fission-AI/OpenSpec) for spec-driven changes:

- `openspec/specs/` — current capability specs
- `openspec/changes/` — active proposals, designs, tasks and delta specs
- `openspec/changes/archive/` — completed changes

Project guidance for agents and contributors lives in [`AGENTS.md`](./AGENTS.md).

## License

No root license file is present. The `server` package declares `ISC`; the `client` package is marked `private`.
