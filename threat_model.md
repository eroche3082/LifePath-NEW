# Threat Model

## Project Overview

LIFE PATH is a React 18/TypeScript and Node.js/Express wellbeing platform that lets users register or sign in, track life dimensions, store check-ins, goals, rituals, journals, preferences, and receive Google Gemini-generated guidance. The production server is `server/index.ts`, which registers Express API routes from `server/routes.ts`, authentication routes from `server/auth.ts`, uses PostgreSQL/Neon through Drizzle in `server/database-storage.ts`, and serves the built Vite client statically.

Production assumptions for future scans: `NODE_ENV` is set to `production`, platform TLS terminates HTTPS automatically, and the mockup/development sandbox is not deployed to production. Vite dev middleware, Replit development plugins, the Replit dev banner, and in-memory mock storage paths are dev-only unless proven reachable through the production `npm start` path.

## Assets

- **User accounts and sessions** -- usernames, emails, names, Firebase identifiers, password hashes, session cookies, and server-side session records. Compromise allows account takeover and access to personal wellbeing records.
- **Personal wellbeing data** -- mood, energy, reflections, consultations, goals, rituals, journal content, preferences, and profile information. This is sensitive personal data and must only be visible to the owning user.
- **Application secrets** -- `DATABASE_URL`, `SESSION_SECRET`, Gemini/Google/Firebase service account credentials, and other API keys loaded from environment variables. Exposure could compromise authentication, database access, or external service accounts.
- **AI prompts and responses** -- user-provided consultation text and generated advice. These may contain sensitive personal information and cross the server-to-AI-service boundary.
- **Database records** -- all application tables and the `sessions` table in PostgreSQL. Unauthorized reads or writes can disclose or tamper with user history and identity data.

## Trust Boundaries

- **Browser to Express API** -- all `/api/*` requests come from an untrusted client. Authentication, authorization, validation, and rate limiting must be enforced server-side.
- **Public to authenticated routes** -- login, registration, Firebase authentication, Firebase status, and the Gemini test route are public; dashboard, check-ins, trackers, consultations, goals, rituals, archive, and settings require an authenticated Express session.
- **Express API to PostgreSQL** -- server code reads and writes user data through Drizzle. Queries must be parameterized and scoped to the authenticated user.
- **Express API to Firebase Admin** -- `/api/auth/firebase` accepts a client-supplied ID token and relies on Firebase Admin verification before creating or linking an application user.
- **Express API to Google Gemini** -- user names, moods, and consultation messages are sent to Gemini. Prompts must avoid leaking secrets and responses must be treated as untrusted content when rendered.
- **Production to development tooling** -- Vite dev server, Replit runtime plugins, the Replit dev banner script, and mock in-memory storage are development-only and should not be considered production attack surface unless production reachability is demonstrated.

## Scan Anchors

- Production entry points: `server/index.ts`, `server/routes.ts`, `server/auth.ts`, `server/database-storage.ts`, `server/db.ts`, `server/ai.ts`, `server/firebase-admin.ts`, `shared/schema.ts`, and built static client served by `server/vite.ts` via `serveStatic`.
- Highest-risk areas: authentication/session handling in `server/auth.ts`, user-scoped data access in `server/routes.ts` and `server/database-storage.ts`, AI prompt/data flow in `server/ai.ts`, and Firebase token linking in `server/auth.ts`/`server/firebase-admin.ts`.
- Public surfaces: `/api/register`, `/api/login`, `/api/logout`, `/api/user` (auth-gated response), `/api/auth/firebase`, `/api/firebase/status`, and `/api/test-gemini`.
- Authenticated surfaces: dashboard, check-in, trackers, consultations, goals, rituals, archive, and settings routes in `server/routes.ts`.
- Dev-only areas to usually ignore: Vite dev middleware in `server/vite.ts` when `app.get("env") === "development"`, Replit dev banner in `client/index.html`, Replit Vite plugins in `vite.config.ts`, and the unused `MemStorage` test admin setup in `server/storage.ts` while `storage` exports `new DatabaseStorage()`.

## Threat Categories

### Spoofing

Users authenticate with local username/password sessions or Firebase ID tokens. Passwords must be strongly hashed, session cookies must be signed with a production-only secret from the environment, Firebase tokens must be verified by Firebase Admin, and authentication responses must not expose credentials or password hashes.

### Tampering

The client can submit check-ins, preferences, consultation messages, goal IDs, ritual IDs, dimensions, and archive search strings. The server must validate request bodies and parameters, enforce allowed dimensions/types, and scope every update to `req.user.id` so users cannot alter other users' data or corrupt JSON fields with unexpected structures.

### Information Disclosure

Wellbeing records, journals, preferences, profile data, password hashes, session identifiers, and API keys must not appear in API responses, logs, stack traces, or client-side bundles. Public diagnostic endpoints must not reveal sensitive service behavior or consume costly external APIs. Error responses in production should be generic.

### Denial of Service

Public authentication and AI endpoints can be abused for brute-force attempts or expensive Gemini calls. The API must rate-limit public routes, bound request body sizes, avoid unauthenticated expensive operations, and set sensible timeouts around external AI services.

### Elevation of Privilege

Authenticated users must only access records where `userId` matches their own session user. Administrative or test accounts must not exist in production with hardcoded credentials, and server-side role or ownership checks must not rely on client-side routing.
