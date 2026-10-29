# AGENTS.md — Poth Project Context

> Persistent context file for AI agents and developers working on this repository.
> Keep this file updated after every significant task so work can resume without re-auditing the codebase.
>
> **Last updated:** 2026-10-29
> **Snapshot:** branch `frontend-changes`, commit `ef4a8ea skelton` + uncommitted frontend edits.
> **Audit type:** read-only review (no source changes); findings below were verified by reading code, running the app toolchain, and inspecting `api/server.log`.

---

## 1. What this project is

**Poth** is a road-navigation and community app for Dhaka, Bangladesh. Planned capabilities:

- Map with live road incidents (traffic jams, road closures, breakdowns, etc.)
- Route search and preview with fuel/cost estimates
- Turn-by-turn navigation with incident alerts
- Vehicle garage with fuel-efficiency tracking
- Trip history, toll points, fuel range prediction
- Community feed (posts, comments, reactions)
- Notifications, i18n (English/Bengali), light/dark theme

The repository contains **two independent apps** that are **not yet connected**:

| Part | Path | Status |
|---|---|---|
| Mobile/web frontend | `app/` | Runs on mock data; typecheck and lint currently fail |
| REST API | `api/` | Feature-complete design, not installed/runnable as checked out; known runtime bugs |

---

## 2. Repository layout

```
poth/
├── AGENTS.md                  ← this file
├── api/                       Express + Prisma + PostgreSQL backend
│   ├── prisma/
│   │   ├── schema.prisma      Models + enums
│   │   └── migrations/
│   ├── src/
│   │   ├── server.ts          HTTP + Socket.IO bootstrap
│   │   ├── app.ts             Express app, middleware, route mounting
│   │   └── app/
│   │       ├── config/        env config, swagger
│   │       ├── routes/        index.ts mounts all modules under /api/v1
│   │       ├── middlewares/   auth, validate, error handler, 404, rate limit, logger
│   │       ├── modules/       Auth, User, Vehicle, Incident, Place, Route,
│   │       │                  Fuel, Trip, Toll, Community, Notification
│   │       ├── database/      Prisma client + seed
│   │       ├── cron/          expiry / cleanup jobs
│   │       ├── socket/        Socket.IO setup (connection logging only)
│   │       ├── utils/         JWT, AppError, catchAsync, QueryBuilder
│   │       └── services/      Log service
│   ├── server.log             Evidence of a past runtime failure (Windows paths)
│   └── vercel.json            Deployment config (currently broken)
└── app/                       Expo / React Native app (expo-router)
    ├── app/                   File-based routes
    │   ├── (tabs)/            index (map), community, trips, profile
    │   ├── onboarding.tsx
    │   ├── auth/              login, signup, verify
    │   ├── search.tsx
    │   ├── route-preview.tsx
    │   ├── navigation/active.tsx
    │   ├── report-incident.tsx
    │   └── vehicles/          index, add
    └── src/
        ├── components/        UI + domain components
        ├── services/          interfaces, mocks, apiClient, index.ts (mock switch)
        ├── store/             Zustand stores
        ├── types/             domain.ts
        ├── mocks/             dhaka.ts seed data
        ├── theme/             ThemeProvider, tokens
        ├── i18n/              language provider + translations
        └── hooks/
```

---

## 3. Current status at a glance

| Area | Status |
|---|---|
| Frontend UI / navigation | Works on mocks |
| Frontend typecheck | **FAILS** (4 errors) |
| Frontend lint | **FAILS** (script/tool mismatch) |
| Frontend ↔ API | **Not connected** (`USE_MOCK_API = true`, no real services) |
| API install / build | **Not verified** (`api/node_modules` missing, no `api/.env`) |
| API runtime | **Has confirmed failure** (`GET /api/v1/vehicles`) |
| API tests | No test files exist |
| Auth compatibility | **Incompatible**: frontend phone+OTP vs backend email+password |
| Data model compatibility | **Incompatible**: snake_case frontend enums vs UPPER_SNAKE Prisma enums |

---

## 4. How to run

### 4.1 Frontend (`app/`)

```powershell
cd app
npm install
npm start          # Expo dev server
npm run android
npm run ios
npm run web        # requires react-native-web + @expo/metro-runtime (already added)
npm run typecheck  # tsc --noEmit  (currently failing)
npm run lint       # currently failing, see §8
```

Environment: `app/.env` exists but is **empty**. The intended variable is:

```env
EXPO_PUBLIC_API_BASE_URL=http://<host>:<port>/api/v1
```

`src/services/index.ts` currently hardcodes `USE_MOCK_API = true`.

### 4.2 Backend (`api/`)

```powershell
cd api
npm install                    # NOT yet done in this workspace
# create api/.env first (see below)
npm run db:generate            # prisma generate
npm run db:push                # or: npm run db:migrate
npm run db:seed
npm run dev                    # tsx watch src/server.ts
npm run build                  # tsc && prisma generate
npm run typecheck
```

Required `.env` keys (referenced by config/seed):

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:pass@localhost:5432/poth
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
SUPER_ADMIN_EMAIL=...
SUPER_ADMIN_PASSWORD=...
# storage: local | s3 | cloudinary (see config)
```

Never commit `.env`. Root `.gitignore` does not exist; the API/app rely on per-folder ignores — check before adding secrets or `node_modules`.

### 4.3 API surfaces

- Base URL: `http://localhost:<PORT>/api/v1`
- Health: `GET /health`
- Root: `GET /` (advertises `/api-docs`, which is **not mounted**)
- Socket.IO: same HTTP server, connection logging only

---

## 5. Backend architecture

**Stack:** Express 4, TypeScript 5.7, Prisma 5.22 + PostgreSQL, JWT access/refresh, Zod, bcrypt, Socket.IO 4, node-cron, Swagger, multer with local/S3/Cloudinary storage, Jest (no tests).

**Pattern:** `route → validate → controller → service → Prisma`. Controllers are thin; business logic lives in `*.service.ts`. Errors flow through `AppError` + `globalErrorHandler`.

**Middleware order in `src/app.ts`:** helmet → API logger → body parsers → cookie parser → CORS → routes → error handler → 404.

**Route map** (`src/app/routes/index.ts`) under `/api/v1`:

| Module | Prefix (approx.) | Highlights |
|---|---|---|
| Auth | `/auth` | register, login, refresh, logout, forgot/reset password |
| User | `/users` | admin CRUD, restore, soft delete |
| Vehicle | `/vehicles` | CRUD, set primary, fuel efficiencies |
| Incident | `/incidents` | geo filter, confirmations/votes, confidence score, expiry, clusters |
| Place | `/places` | text search, nearby |
| Route | `/routes` | saved routes CRUD |
| Fuel | `/fuel` | records CRUD, range prediction, stats |
| Trip | `/trips` | start, complete, cancel, stats |
| Toll | `/tolls` | toll points CRUD |
| Community | `/community` | posts, comments, reactions |
| Notification | `/notifications` | list, read, delete |

**Prisma models:** `User`, `RefreshToken`, `Role`, `Vehicle`, `UserVehicle`, `VehicleFuelEfficiency`, `Place`, `RoadIncident`, `IncidentConfirmation`, `IncidentCluster`, `IncidentClusterIncident`, `SavedRoute`, `Trip`, `FuelRecord`, `TollPoint`, `CommunityPost`, `PostComment`, `PostReaction`, `Notification`, `SystemSetting`, `SystemLog`.

**Enums:** `UserStatus`, `FuelType`, `TransmissionType`, `PlaceType`, `PlaceSource`, `IncidentType`, `IncidentStatus`, `IncidentSeverity`, `VoteType`, `TripStatus`, `PostVisibility`, `ReactionType`, `NotificationType`, `LogCategory`.

**Cron:** incident expiry/confidence decay and notification/system-log cleanup. A Vercel cron path for `disable-expired-users` is referenced in `vercel.json` but **not implemented**.

**Template leftovers (cosmetic but confusing):** package name `datahub-backend` and description reference a different project ("Per Backend" / Docker), Swagger examples reference TUTOR/STUDENT/chat, super-admin email `admin@quran.com`, `server.log` paths under `F:\work\maps\api`.

---

## 6. Frontend architecture

**Stack:** Expo SDK 57, React 19.2.3, React Native 0.86.3, expo-router 57, Zustand 5, react-native-maps 1.27.2, Reanimated 4.5.1, bottom-sheet 5, AsyncStorage, Safe Area, TypeScript 6.0.3, ESLint 8.57.1 + `eslint-config-expo` (flat config).

**Routes:** onboarding → auth (login/signup/verify) → tabs (map, community, trips, profile), plus search, route preview, active navigation, report incident, vehicles list/add, community post detail.

**Services:** `src/services/types.ts` defines interfaces; `src/services/mock/*` implements them; `src/services/index.ts` selects mocks via `USE_MOCK_API`. `apiClient.ts` exists but is unused. There is **no** `src/services/real` directory.

**State:** Zustand stores for auth/session, vehicles, incidents, trips, theme/language preferences (persisted with AsyncStorage where relevant).

**Types:** `src/types/domain.ts` is the app-facing model (camelCase, snake_case incident enum values). It does **not** match Prisma models or backend enum values.

**Mock data:** `src/mocks/dhaka.ts` — seeded Dhaka places, incidents, community posts/comments, vehicles, trips.

**UX notes:** OTP mock accepts any 4 digits; navigation is simulated (no routing engine); map uses react-native-maps.

---

## 7. Integration gaps (critical)

1. **Mock switch is on.** `app/src/services/index.ts:15` → `USE_MOCK_API = true`; no real implementation exists to flip to.
2. **Auth mismatch.** Frontend: phone + 4-digit OTP. Backend: email + password only (`/auth/register`, `/auth/login`, refresh). No OTP endpoints or phone identity.
3. **Enum/shape mismatch.**
   - `IncidentType`: frontend `traffic_jam | road_blocked | breakdown | ...` vs Prisma `TRAFFIC_JAM | ROAD_CLOSURE | VEHICLE_BREAKDOWN | ...`.
   - Vehicles: frontend `VehicleType` + camelCase domain objects vs Prisma `name`, `plateNumber`, `fuelType`, etc.
   - Dates: frontend ISO strings; backend returns JSON dates.
4. **No adapter layer.** Any integration requires a mapper (DTO ↔ domain) and a decision on auth (add OTP to backend, or switch frontend to email/password).

---

## 8. Known bugs (verified)

> Line numbers are accurate as of the audit date and may drift after edits.

### 8.1 Frontend tooling

| # | Severity | Location | Problem |
|---|---|---|---|
| F1 | High | `app/tsconfig.json:5` | `baseUrl` deprecated under TypeScript 6.0.3 (TS5101); typecheck fails before real errors are reported cleanly. |
| F2 | High | `app/app/(tabs)/index.tsx:79` | `style={StyleSheet.absoluteFillObject}` — should be `StyleSheet.absoluteFill` or spread the object. |
| F3 | High | `app/app/navigation/active.tsx:109` | Same `absoluteFillObject` misuse. |
| F4 | High | `app/src/theme/ThemeProvider.tsx:54` | Context value is a union of light/dark token sets; not assignable to the declared context type. |
| F5 | Medium | `app/package.json:11` | `"lint": "eslint . --ext .ts,.tsx"` is invalid for flat config; ESLint 8.57.1 treats `--ext` as a path and exits with an error. |

### 8.2 Backend correctness

| # | Severity | Location | Problem |
|---|---|---|---|
| B1 | **Critical** | `api/src/app/modules/Vehicle/vehicle.service.ts:46` | `orderBy: { isPrimary: 'desc', createdAt: 'desc' }` — Prisma requires an **array**. `GET /api/v1/vehicles` returns 400. Confirmed in `api/server.log`. |
| B2 | High | `api/src/app/modules/Community/community.controller.ts:31,42,53` | Reads `req.params.id`, but routes define `:postId` → `undefined`. Get/update/delete post broken. |
| B3 | High | `api/src/app/middlewares/auth.ts:42` | Compares `status === 'blocked'` (lowercase) against uppercase enum `BLOCKED`; blocked users are not actually blocked. |
| B4 | High | Auth password reset flow | Route validates only `newPassword`; service expects `{ id, code, newPassword }`; `forgotPassword` never returns an id → reset cannot complete. |
| B5 | Medium | `api/src/app/modules/Community/community.service.ts` | Removing a reaction does not decrement `reactionCount`; `deleteComment` contains a no-op parent update. |
| B6 | Medium | `api/src/app/modules/Notification/notification.service.ts` | `getNotificationById` returns the pre-update snapshot. |
| B7 | Medium | `api/src/app.ts:54` | `/api-docs` is advertised but `swaggerSpec` is never mounted → 404. Swagger content is also stale. |
| B8 | Medium | Uploads | Local `uploads/` is not served statically; folder contains only `.gitkeep`. |
| B9 | Medium | `api/vercel.json` | Build source `api/index.ts` does not exist; cron path `/api/cron/disable-expired-users` is unimplemented. |
| B10 | Low | `api/src/app.ts:24-39` | CORS callback allows every origin in both branches (effectively `origin: true`). |

### 8.3 Frontend stubs (not bugs, unfinished features)

- Community “write post” button does nothing.
- Profile rows for saved places, notifications, privacy do nothing.
- Incident cards on the map/home list have no `onPress`.
- Navigation completion never creates a `Trip` record.
- No notifications screen; no push notifications.
- No real geocoding, routing, or traffic provider.

---

## 9. Conventions / rules for future work

1. **Do not rename Prisma enums or fields** without a migration and a frontend mapper update; the frontend enum values already differ.
2. **Keep mocks working.** Add real services beside `src/services/mock/*` and switch through `USE_MOCK_API`; do not delete mock fixtures — they are the demo/offline path.
3. **API response shape:** follow the existing controller/service return pattern; do not introduce a second envelope format.
4. **Validation:** all new API input goes through the module’s Zod schema + `validate` middleware.
5. **Auth:** all non-public routes use the `auth` middleware; role checks use the existing helpers. Note the `BLOCKED` comparison bug (B3) before relying on account blocking.
6. **Errors:** throw `AppError(status, message)`; never send ad-hoc error responses from services.
7. **Frontend styling:** use tokens from `src/theme`; do not hardcode colors/spacing. Use `StyleSheet.absoluteFill`, not `absoluteFillObject`.
8. **Typecheck before commit:** `cd app && npm run typecheck`. Do not commit with known TS errors.
9. **Never commit** `node_modules/`, `.env`, `dist/`, or generated uploads.
10. **Keep this file current.** Append to the changelog and update the status tables after each task.

---

## 10. Suggested roadmap (priority order)

### P0 — make the repo buildable
- [ ] Fix F1–F5 (tsconfig deprecation, 2 `absoluteFillObject` uses, theme context type, lint script).
- [ ] Install `api/node_modules`, create `.env`, run `prisma generate` + `typecheck` + `build`.
- [ ] Fix B1 (vehicle `orderBy` array) and re-test `GET /vehicles`.

### P1 — backend correctness
- [ ] Fix B2 (`postId` params), B3 (`BLOCKED`), B4 (password reset contract), B5, B6.
- [ ] Mount Swagger (`swagger-ui-express`) or remove the `/api-docs` claim.
- [ ] Serve `uploads/` statically.
- [ ] Repair or remove `vercel.json`; implement or drop the cron route.
- [ ] Add a minimal Jest suite for auth + vehicles + incidents.

### P2 — connect frontend to API
- [ ] Decide auth: add phone/OTP endpoints to the API **or** switch the app to email/password.
- [ ] Implement `src/services/real/*` behind `USE_MOCK_API`.
- [ ] Add DTO mappers for incidents, vehicles, trips, community.
- [ ] Wire `apiClient` with token refresh + error handling.

### P3 — finish features
- [ ] Community post composer.
- [ ] Notifications screen + push.
- [ ] Persist trips from navigation.
- [ ] Saved places / privacy screens.
- [ ] Real routing/geocoding provider.

---

## 11. Verification log

| Date | Command | Result |
|---|---|---|
| 2026-10-29 | `cd app && npm run typecheck` | FAIL — TS5101 (`baseUrl`) + F2, F3, F4 |
| 2026-10-29 | `cd app && npm run lint` | FAIL — invalid `--ext` with flat config |
| 2026-10-29 | `cd app && npm ls --depth=0` | OK — Expo 57.0.19, RN 0.86.3, TS 6.0.3, ESLint 8.57.1 |
| 2026-10-29 | API typecheck/build | NOT RUN — `api/node_modules` absent, `api/.env` absent |
| 2026-10-29 | `api/server.log` review | Confirms B1 runtime failure |

---

## 12. Changelog

| Date | Change |
|---|---|
| 2026-10-29 | Created this file with full audit context (structure, stack, status, bugs, roadmap). |
