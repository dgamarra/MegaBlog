# MegaBlog — Agent Guide

## Architecture

- **Monorepo** with two packages: `server/` (Express 5, CommonJS) and `client/` (React 19 + Vite 8, ESM)
- **Database**: MongoDB via Mongoose (`server/src/models/` has schemas for User, Post, Comment). Connection string from `MONGODB_URI` env var, default `mongodb://localhost:27017/megablog`
- **NLP on write**: post content is auto-analyzed for sentiment + keywords via `natural` package (`server/src/services/nlpService.js`)
- **Auth**: JWT + bcrypt; token/user stored in `localStorage` on the client
- **Comment repository** exists in code but is **not wired to any route or service**

## Commands

### Server
```sh
cd server
npm run dev        # nodemon src/server.js (port 5000)
npm start          # node src/server.js
npm test           # jest (no tests written yet)
```

### Client
```sh
cd client
npm run dev        # vite (default port 5173)
npm run build      # vite build
npm run lint       # eslint .
npm run preview    # vite preview
```

### Docker (both services)
```sh
docker compose up   # server:5000, client:3000
```

## Key Conventions

- **Server CommonJS**, client **ESM** (`"type": "module"`) — do not mix `require`/`import` across packages
- **Tailwind CSS v4** — uses `@import "tailwindcss"` in CSS (not deprecated `@tailwind` directives) and PostCSS plugin `@tailwindcss/postcss`
- **NLP analysis runs on every create/update** of a post — `postService` calls `nlpService.getAnalysis(content)` and merges `{ score, sentiment, keywords }` into the post
- **Post ownership**: `updatePost`/`deletePost` check `req.user.id === post.authorId || isAdmin`; no `adminMiddleware` is used in any route today
- **API base URL**: client defaults to `http://localhost:5000/api` (via `VITE_API_URL` env var or axios default)
- **Error handling**: most controllers delegate to Express error middleware; `getPostById` returns 404 inline
- **Client-side filtering**: `Dashboard` fetches all posts and filters by `authorId` in JS (no server endpoint for user's posts)

## Gotchas

- `.gitignore` excludes `package-lock.json` — each install may produce different lockfile
- Server `PORT` defaults to 5000, reads from `process.env.PORT` or `.env`
- `JWT_SECRET` fallback is hardcoded `'supersecretkey'` in multiple files
- Empty directories exist: `docs/`, `tests/`, `docker/`, `client/src/components/blog/`, `client/src/components/ui/`, `client/src/hooks/`, `client/src/utils/`
- No tests exist though `jest` + `supertest` are in server devDependencies

## Layer Order

```
Route → Controller → Service → Repository → Mongoose model → MongoDB
```

Routes in `server/src/routes/`, controllers in `controllers/`, services in `services/`, repositories in `repositories/`, models in `models/`, DB connection in `db/connection.js`.
