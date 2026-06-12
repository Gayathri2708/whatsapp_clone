# WhatsApp Clone

A full-stack messaging app built as a learning/portfolio project. Monorepo with a
Node.js/TypeScript/MongoDB backend and a Flutter mobile client, both built with layered,
test-covered architectures.

## Status

**Phase 1 — Foundation + Authentication.** The monorepo skeleton, layered backend
architecture, and Flutter clean-architecture skeleton are in place, with a complete
end-to-end authentication flow (register, login, refresh, logout, session persistence)
serving as the reference pattern for upcoming features (real-time chat, status, AI
assistant).

## Repository layout

```
.
├── backend/   Node.js + TypeScript + Express + MongoDB API
└── mobile/    Flutter app (Riverpod, Clean Architecture, go_router)
```

---

## Backend (`/backend`)

**Stack**: Express, MongoDB/Mongoose, TypeScript, JWT auth, Zod validation, Winston
logging, Jest + Supertest for tests.

### Architecture

Each feature is a self-contained module organized in layers (a lightweight
hexagonal/clean architecture):

```
src/modules/<feature>/
  domain/          entities, repository interfaces ("ports"), domain errors
  application/     use-cases, DTOs/zod schemas
  infrastructure/  Mongoose models + repository implementations, external services
  presentation/    controllers, routes, request validation
```

`src/shared/` holds cross-cutting concerns: the `AppError` hierarchy, the central
Express error handler, `asyncHandler`, auth middleware, and JWT utilities.
`src/config/` holds environment validation (Zod), the Mongo connection, and the logger.

### Auth

- Access tokens (15m) + refresh tokens (7d), signed with separate secrets.
- Refresh tokens are stored hashed (SHA-256 + `crypto.timingSafeEqual` — not bcrypt,
  since bcrypt's 72-byte input limit causes collisions on tokens this long) and rotated
  on every refresh, with a unique `jti` per token.
- Passwords hashed with bcrypt (12 rounds).

### AI Assistant module

A swappable `IAIProvider` interface backs two features:

- **Tone Guard** (`POST /api/v1/ai/tone-guard`) — analyzes a draft message before
  sending and suggests a softer rewrite if it reads as aggressive. Uses
  `claude-haiku-4-5` for low latency on a single short message.
- **Catch-Me-Up** (`POST /api/v1/ai/catch-me-up`) — summarizes a batch of unread
  messages into a digest plus extracted action items/decisions. Uses
  `claude-sonnet-4-6`, with prompt caching on the system prompt.

If `ANTHROPIC_API_KEY` is unset, a heuristic `MockAIProvider` is used instead, so the
API runs out of the box with no API key. Approximate costs when the real provider is
enabled:

| Feature     | Model             | Approx. cost per call                          |
| ----------- | ----------------- | ----------------------------------------------- |
| Tone Guard  | claude-haiku-4-5  | ~$0.001 (≈200 in / ≈150 out tokens)              |
| Catch-Me-Up | claude-sonnet-4-6 | ~$0.01–0.02 (≈1.5–3K in / ≈300–500 out tokens)   |

### Running locally

```bash
cd backend
cp .env.example .env        # fill in JWT secrets, optionally ANTHROPIC_API_KEY
docker compose up -d        # starts a local MongoDB on localhost:27017
npm install
npm run dev                  # http://localhost:4000
```

### Scripts

| Command          | Description                |
| ---------------- | --------------------------- |
| `npm run dev`    | Start the API with hot reload |
| `npm run build`  | Compile TypeScript to `dist/` |
| `npm start`      | Run the compiled API        |
| `npm test`       | Run Jest integration tests  |
| `npm run lint`   | ESLint                       |
| `npm run format` | Prettier                     |

### API endpoints (Phase 1)

| Method | Path                     | Auth | Description                       |
| ------ | ------------------------ | ---- | ---------------------------------- |
| POST   | `/api/v1/auth/register`  | —    | Create an account, returns tokens  |
| POST   | `/api/v1/auth/login`     | —    | Returns access + refresh tokens    |
| POST   | `/api/v1/auth/refresh`   | —    | Rotates a refresh token             |
| GET    | `/api/v1/users/me`       | ✓    | Current user profile               |
| POST   | `/api/v1/ai/tone-guard`  | ✓    | Tone analysis + rewrite suggestion |
| POST   | `/api/v1/ai/catch-me-up` | ✓    | Summarize unread messages           |

---

## Mobile (`/mobile`)

**Stack**: Flutter, Riverpod (state management), go_router (navigation), Dio (HTTP),
flutter_secure_storage (token persistence).

### Architecture

Clean Architecture per feature:

```
lib/features/<feature>/
  data/          remote data sources, JSON models, repository implementations
  domain/        entities, repository interfaces, use-cases
  presentation/  Riverpod providers/controllers, screens, widgets
```

`lib/core/` holds cross-cutting concerns: the `Failure`/`Result` types used instead of
exceptions across layer boundaries, the Dio client + auth interceptor (attaches the
access token, refreshes it transparently on 401, logs the user out if the refresh
token is also invalid), the app theme, and shared widgets.

Routing (`lib/core/router/app_router.dart`) uses go_router with redirect logic driven
by `AuthState`: unauthenticated users are sent to `/login`, authenticated users to
`/home`, and a splash screen is shown while the startup session check runs.

### Running locally

```bash
cd mobile
flutter pub get
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:4000/api/v1
```

`10.0.2.2` is the Android emulator's alias for the host machine's `localhost`. Adjust
`API_BASE_URL` for an iOS simulator (`http://localhost:4000/api/v1`), a physical device
(your machine's LAN IP), or a deployed backend.

### Scripts

| Command           | Description           |
| ----------------- | ----------------------- |
| `flutter run`     | Run the app             |
| `flutter test`    | Run unit/widget tests   |
| `flutter analyze` | Static analysis         |
| `dart format .`   | Format code             |

---

## Roadmap

1. Real-time chat (Socket.io): 1:1 + group messaging, presence, typing, read receipts
2. Media: image/file/voice note upload
3. Status/Stories
4. Wire the AI Assistant (Tone Guard + Catch-Me-Up) into the chat compose box and header
5. Push notifications (FCM)
