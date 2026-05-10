# Backend PRD — The Void Case

> This document describes everything a backend engineer needs to implement to support the frontend game. No game spoilers, no story content — just the API contract, data models, and behavioral requirements.

---

## Overview

The frontend is a single-player browser-based investigation game. It needs:

1. **Authentication** — signup, login, logout, session-based cookie credentials
2. **Game State Persistence** — save/load player progress
3. **Hint System** — an AI-powered or rule-based assistant that responds to player questions
4. **Completion Tracking** — record game endings and provide personalized recommendations
5. **Leaderboard** — ranked player stats for competitive/social features
6. **Static File Serving** — the frontend (`game_void.html`, `game_void.css`, `js/*.js`) must be served from the same origin (or with proper CORS if separate)

The frontend makes all calls with `credentials: 'include'`. CORS must allow this.

### Existing Server Scaffold

A Go + MySQL server already exists in the `server/` directory:

| File | What It Does |
|---|---|
| `go.mod` | Module `github.com/AHMEDxHAGAG/server`, Go 1.26.2, MySQL driver `github.com/go-sql-driver/mysql` |
| `db/db.go` | Connects to MySQL `root:200692@tcp(localhost:3306)/puzzle`. Exposes global `var Db *sql.DB` |
| `models/user.go` | `User` struct with `Name`, `Email`, `Password`, `ProfileImage`, `Inventory`, `CurrentRoom`, `Xp` |
| `handlers/users.go` | Empty `CreateUser(w, r)` handler |
| `handlers/root.go` | `HandleRoot` returns "Hello World" |
| `main.go` | Calls `db.Connect()`, wires mux with 2 handlers, listens on `:8080` |

**Important:** The existing `User` model has fields (`Inventory`, `CurrentRoom`, `Xp`) from a different game concept. You should either:
- Add a `SaveData JSON` field to the existing `User` model, or
- Create a separate `game_saves` table keyed by `user_id`

**You must add to the existing scaffold:**
- CORS middleware (`Access-Control-Allow-Origin`, `Access-Control-Allow-Credentials: true`, handle `OPTIONS` preflight)
- Session/cookie auth middleware
- Static file serving (or ensure the frontend is served by another means)
- JSON body parsing (`json.NewDecoder` or `ioutil.ReadAll` + `json.Unmarshal`)
- All 10 API handlers described in this document

---

## 1. Authentication

### `POST /api/auth/signup`

**Purpose:** Register a new user account.

**Request Body:**
```json
{
  "username": "player-name",
  "email": "player@example.com",
  "password": "plaintext-password"
}
```

**Request Headers:** `Content-Type: application/json`

**Response (201):**
```json
{
  "id": "user-id",
  "username": "player-name"
}
```

**Response (400):** Validation error (missing fields, invalid email format, password too short — minimum 6 characters).

**Response (409):** Conflict — a user with this email or username already exists.
```json
{
  "error": "email already registered"
}
```

**Requirements:**
- All three fields (`username`, `email`, `password`) are required
- `username` must be 2–30 characters, alphanumeric plus underscores
- `email` must be a valid email format
- `password` must be at least 6 characters
- Password must be hashed with bcrypt before storage — **never store plaintext passwords**
- On success, automatically create a session (set session cookie) so the user is logged in immediately
- The existing `User` model has `Name`, `Email`, `Password` fields — map `username` → `Name`, `email` → `Email`, hashed password → `Password`
- Return the same session cookie format as `POST /api/auth/login`

---

### `POST /api/auth/login`

**Purpose:** Authenticate an existing user and create a session.

**Request Body:**
```json
{
  "email": "player@example.com",
  "password": "plaintext-password"
}
```

**Request Headers:** `Content-Type: application/json`

**Response (200):**
```json
{
  "id": "user-id",
  "username": "player-name"
}
```

**Response (401):** Invalid credentials.
```json
{
  "error": "invalid email or password"
}
```

**Requirements:**
- Look up user by `email` in the `users` table
- Compare the submitted password against the stored bcrypt hash
- On success, create a server-side session and set a session cookie:
  - `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`
  - Session should have a reasonable TTL (e.g., 24 hours or 7 days)
  - Store session data server-side (in-memory map, Redis, or database table)
- On failure, return 401 with a generic error message — do not reveal whether the email exists
- After successful login, `GET /api/auth/me` must return 200 for the duration of the session

---

### `POST /api/auth/logout`

**Purpose:** End the current session and clear the session cookie.

**Request:** Session cookie only.

**Response (200):** Empty body or `{ "message": "logged out" }`.

**Response (401):** No active session (idempotent — still clear the cookie).

**Requirements:**
- Destroy the server-side session data
- Clear the session cookie by setting it with an expired `Max-Age` or a past `Expires` value
- Must work with `credentials: 'include'`

---

### `GET /api/auth/me`

**Purpose:** Check if the current request has an active session.

**Request:** None (read from session cookie).

**Response (200):**
```json
{
  "id": "user-id",
  "username": "player-name"
}
```

**Response (401):** Empty body. Frontend redirects to `login.html`.

**Requirements:**
- Session must be httpOnly, Secure, SameSite=Lax (or Strict if same-origin)
- If no session cookie present, or session invalid/expired → 401
- The existing `User` model has `Name`, `Email`, `Password`. You can use this for username/password auth or swap in OAuth.

---

## 2. Game State (Save / Load)

The frontend stores all game state in memory and syncs to the backend on every change. Calls are fire-and-forget — the frontend never blocks gameplay waiting for a response.

### Save State Schema

```json
{
  "currentLocation": "basement",
  "collectedEvidence": ["ROPES", "KNOCKOUT GAS BOTTLE #1"],
  "visitedLocations": ["basement", "planetarium"],
  "suspectsTalked": ["operator"],
  "pins": {
    "scheduler": ["BROADCAST RECORDING"],
    "operator": ["KNOCKOUT GAS BOTTLE #1"]
  },
  "contradictionsTriggered": [1],
  "trialProgress": 0,
  "gamePhase": "intro"
}
```

Field descriptions:

| Field | Type | Description |
|---|---|---|
| `currentLocation` | string | Which of 6 locations the player is currently viewing. Enum: `basement`, `planetarium`, `labyrinth`, `zerograv`, `void`, `tvstation` |
| `collectedEvidence` | string[] | List of evidence items the player has found. Max 25 items. Names are ALL CAPS with spaces. |
| `visitedLocations` | string[] | Which locations the player has entered. Same enum as `currentLocation`. |
| `suspectsTalked` | string[] | Which NPCs the player has spoken to. Enum: `scheduler`, `operator`, `observer`, `courier`, `drifter` |
| `pins` | object | Map of suspect ID → array of evidence names pinned to that suspect. Keys are suspect IDs from the enum above. |
| `contradictionsTriggered` | number[] | IDs of contradictions discovered. Values 1–6. |
| `trialProgress` | integer | How many of 5 trial statements resolved (0–5). |
| `gamePhase` | string | Current phase. Enum: `intro`, `investigation`, `trial`, `accusation` |

**Default state (new player):**
```json
{
  "currentLocation": "basement",
  "collectedEvidence": [],
  "visitedLocations": [],
  "suspectsTalked": [],
  "pins": {},
  "contradictionsTriggered": [],
  "trialProgress": 0,
  "gamePhase": "intro"
}
```

**Backend perspective:** The save state is best treated as an opaque JSON blob. The frontend validates its own data. You only need to store it, retrieve it, and return it unchanged.

---

### `GET /api/save`

**Purpose:** Load the player's saved game state.

**Request:** Session cookie only.

**Response (200):** Full save state JSON (schema above).

**Response (404):** No save exists for this user. Frontend will create one with `POST /api/save` after the first game action.

---

### `POST /api/save`

**Purpose:** Create the initial save for a new player.

**Request Body:** Full save state JSON (the default state shown above).

**Request Headers:** `Content-Type: application/json`

**Response (201/200):** Created. Body can be empty or echo the saved state.

**When called:** Only once per player — immediately after `GET /api/save` returns 404, on the first user interaction.

---

### `PUT /api/save`

**Purpose:** Update save state. Called frequently — after every state change.

**Request Body:** Full save state JSON (always includes all fields).

**Request Headers:** `Content-Type: application/json`

**Response (200):** Updated. Body can be empty.

**Response (404):** No save exists yet. Frontend does not handle this — it expects upsert behavior or a prior `POST /api/save`.

**Requirements:**
- Must be fast. Frontend does `.catch(()=>{})` — it ignores failures entirely.
- Should not block or rate-limit aggressively. The frontend may call this 20–50 times per playthrough.
- **Recommended:** Implement PUT as upsert (create if not exists, update if exists). This handles race conditions cleanly.
- Save state size is small (~1–2KB).

---

## 3. Hint System

### `POST /api/hint`

**Purpose:** The player asks the in-game "Assistant" a question. The backend provides a contextual hint.

**Request Body:**
```json
{
  "message": "player's typed question (string, freeform, max ~200 chars)",
  "location": "basement"
}
```

`location` is one of: `basement`, `planetarium`, `labyrinth`, `zerograv`, `void`, `tvstation`

**Request Headers:** `Content-Type: application/json`

**Response (200):**
```json
{
  "reply": "hint text to display to the player"
}
```

**Behavioral Requirements:**

The hint system should be **context-aware by location**. Each of the 6 locations has 3 static fallback hints. If the backend has no AI or NLP layer, a simple rule-based or static-response system is sufficient:

- Match the player's `location` field
- Return one of the 3 hints for that location (cycling, random, or based on a simple keyword match)
- If the player's message contains specific keywords related to evidence they've already collected, provide a more targeted hint
- The reply should be short (1–2 sentences), cryptic, atmospheric — consistent with a noir detective assistant tone
- Maximum reply length: ~200 characters (frontend renders it in a narrow panel)

**Fallback behavior:** If the API fails (network error, 500, timeout), the frontend has its own static fallback hints and will use those instead. So the backend hint endpoint is optional from a gameplay perspective, but required by contract.

**Suggested simple implementation:**

```
location → pick 1 of 3 pre-written hints for that location
optional: if message contains a collected-evidence keyword → return a targeted hint
```

---

## 4. Game Completion

### `POST /api/complete`

**Purpose:** Called once when the player reaches an ending (correct or incorrect accusation). Records the result and returns personalized recommendations.

**Request Body:**
```json
{
  "accusedSuspect": "scheduler",
  "gotCorrectEnding": true,
  "missedClues": []
}
```

**Request Headers:** `Content-Type: application/json`

**Notes:**
- `missedClues` is always sent as an empty array `[]` by the frontend. The backend may compute this server-side if desired, or ignore it.
- `accusedSuspect` is one of 5 fixed IDs: `scheduler`, `operator`, `observer`, `courier`, `drifter`
- `gotCorrectEnding` indicates whether the player accused the correct killer.

**Response (200):**
```json
{
  "recommendations": [
    "string: first recommendation",
    "string: second recommendation"
  ]
}
```

**Requirements:**
- `recommendations` must be an array of 1–3 short strings
- If `gotCorrectEnding` is `true`, recommendations can be congratulatory or suggest harder challenges
- If `gotCorrectEnding` is `false`, recommendations should gently guide the player toward what they missed (without being too explicit — maintain the mystery tone)
- Examples of recommendation tone: "Consider what connects the studio to the letter." / "Three bottles were purchased together." / "The same panel appears in two places."
- The frontend displays these in a scrollable panel after the ending text
- Maximum total length: ~300 characters across all recommendations

**Suggested implementation:**

A simple lookup table keyed by `(accusedSuspect, gotCorrectEnding)` → array of recommendation strings. No AI needed.

---

## 5. Leaderboard

### `GET /api/leaderboard`

**Purpose:** Return a ranked list of players based on game completion performance. This endpoint is not called by the current frontend but is required for future features (e.g., a leaderboard page, post-game stats screen, or social sharing).

**Request:** No auth required — this is a public endpoint. Optional query parameters for filtering:

|| Parameter | Type | Default | Description |
||---|---|---|---|
|| `limit` | integer | 20 | Number of entries to return (max 100) |
|| `offset` | integer | 0 | Pagination offset |
|| `sort` | string | `correct_completions` | Sort field: `correct_completions`, `completion_count`, `fastest_time` |

**Response (200):**
```json
{
  "entries": [
    {
      "rank": 1,
      "user_id": "abc123",
      "username": "detective_k",
      "correct_completions": 3,
      "completion_count": 5,
      "fastest_time_seconds": 842,
      "last_completed_at": "2025-03-14T22:10:00Z"
    },
    {
      "rank": 2,
      "user_id": "def456",
      "username": "sleuth_99",
      "correct_completions": 2,
      "completion_count": 4,
      "fastest_time_seconds": null,
      "last_completed_at": "2025-03-12T18:30:00Z"
    }
  ],
  "total": 142
}
```

**Response (400):** Invalid query parameters (e.g., `limit` > 100, unknown `sort` field).
```json
{
  "error": "limit must be between 1 and 100"
}
```

**Requirements:**
- This is a **public, unauthenticated** endpoint — no session cookie required
- Results are read-only; no write operations through this endpoint
- Data is sourced from the `game_saves` table's `completion_count`, `correct_completions` columns
- Join with the `users` table to get `username` (from `Name` column)
- `fastest_time_seconds` requires a new column on `game_saves` (see data model below) — if not yet tracked, return `null`
- `rank` is computed server-side based on the `sort` parameter (dense ranking)
- Default sort is `correct_completions` descending, then `completion_count` descending as tiebreaker
- Cache results for 60 seconds (in-memory or Redis) — leaderboard data changes infrequently
- CORS must allow unauthenticated cross-origin reads (set `Access-Control-Allow-Origin` appropriately)

**Suggested SQL query (default sort):**
```sql
SELECT u.user_id, u.Name AS username,
       gs.correct_completions, gs.completion_count,
       gs.fastest_time_seconds, gs.updated_at AS last_completed_at,
       RANK() OVER (ORDER BY gs.correct_completions DESC, gs.completion_count DESC) AS rank
FROM game_saves gs
JOIN users u ON u.user_id = gs.user_id
WHERE gs.completed = TRUE
ORDER BY gs.correct_completions DESC, gs.completion_count DESC
LIMIT ? OFFSET ?;
```

---

### `GET /api/leaderboard/me`

**Purpose:** Return the current player's leaderboard rank and stats. Requires authentication.

**Request:** Session cookie only.

**Response (200):**
```json
{
  "rank": 14,
  "user_id": "abc123",
  "username": "detective_k",
  "correct_completions": 1,
  "completion_count": 2,
  "fastest_time_seconds": 1205,
  "last_completed_at": "2025-03-14T22:10:00Z"
}
```

**Response (404):** User has no completed games (not on the leaderboard).
```json
{
  "error": "no completions recorded"
}
```

**Response (401):** No active session.

**Requirements:**
- Same ranking logic as `GET /api/leaderboard`
- Returns only the authenticated user's entry
- Useful for showing "Your Rank: #14" on the ending screen or profile page

---

## 6. Data Storage Requirements

### Per-User Data Model

Each authenticated user needs exactly one save record:

| Field | Type | Notes |
|---|---|---|
| `user_id` | string/UUID | Foreign key to auth user |
| `save_data` | JSONB / JSON / TEXT | The full save state JSON (opaque to backend) |
| `created_at` | timestamp | |
| `updated_at` | timestamp | Updated on every PUT |
| `completed` | boolean | Set to true on first POST /api/complete |
| `completion_count` | integer | Incremented on each POST /api/complete |
| `correct_completions` | integer | Incremented only when `gotCorrectEnding=true` |

**No DELETE endpoint exists or is needed.** The frontend resets game state client-side by sending the default state via `PUT /api/save`.

**No multiplayer or real-time features.** Everything is single-player, per-user.

### Users Table

The existing `users` table (from the scaffold) must be extended to support authentication:

```sql
CREATE TABLE users (
  user_id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(30) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,  -- bcrypt hash, never plaintext
  profile_image VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Notes:**
- `user_id` can be a UUID generated server-side on signup
- `name` maps to the `username` field in the API (2–30 chars, unique)
- `email` must be unique — used as the login identifier
- `password` stores the bcrypt hash only
- The existing scaffold `User` struct has `Inventory`, `CurrentRoom`, `Xp` fields — these can be dropped or ignored, as game state is now stored in `game_saves`

### Sessions Table (if using database-backed sessions)

```sql
CREATE TABLE sessions (
  session_id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

**Notes:**
- Alternatively, use an in-memory map (e.g., `map[string]sessionData`) for development, or a library like `gorilla/sessions` with cookie-backed sessions
- Sessions must expire — recommended TTL: 24 hours (configurable)
- On logout, delete the session row (or remove from in-memory map)

### Game Saves Table

```sql
CREATE TABLE game_saves (
  user_id VARCHAR(255) PRIMARY KEY,
  save_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed BOOLEAN DEFAULT FALSE,
  completion_count INT DEFAULT 0,
  correct_completions INT DEFAULT 0,
  fastest_time_seconds INT DEFAULT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
```

**New fields vs. original spec:**
- `fastest_time_seconds` — tracks the player's fastest completion time in seconds. Populated by the backend when `POST /api/complete` is called (see timing section below). Used by the leaderboard endpoint for the `fastest_time` sort option. If not tracked, remains `NULL`.

### Timing on Completion

When `POST /api/complete` is called, the backend should also:

1. Compare the elapsed time between `game_saves.created_at` (or the time of the first `POST /api/save`) and `now()` to compute `completion_time_seconds`
2. If `fastest_time_seconds` is `NULL` or `completion_time_seconds < fastest_time_seconds`, update `fastest_time_seconds`

Alternatively, the frontend can send a `completionTimeSeconds` field in the `POST /api/complete` request body. If you prefer this approach, add it to the `CompleteRequest` model:

```json
{
  "accusedSuspect": "scheduler",
  "gotCorrectEnding": true,
  "missedClues": [],
  "completionTimeSeconds": 842
}
```

This field is optional — if not provided, `fastest_time_seconds` remains unchanged.

---

## 7. Auth & Session Requirements

- **Mechanism:** Cookie-based sessions (not JWT in headers)
- **Cookie attributes:** `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`
- **CORS:** Must allow credentials from the frontend origin
  - `Access-Control-Allow-Origin`: must be the exact frontend origin (not `*`) when credentials are used
  - `Access-Control-Allow-Credentials: true`
  - `Access-Control-Allow-Methods`: `GET, POST, PUT, OPTIONS`
  - `Access-Control-Allow-Headers`: `Content-Type`
- **Login flow:** Defined in section 1 — `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`. The frontend expects a `login.html` page to exist. After successful login or signup, a valid session cookie must be set, and `GET /api/auth/me` must return 200.
- **New users:** If a user has a valid session but no save data, `GET /api/save` returns 404. Frontend handles creation via `POST /api/save`.

---

## 8. Rate Limits & Performance

| Endpoint | Expected Frequency | Suggested Rate Limit |
|---|---|---|
| `POST /api/auth/signup` | Once per user (ever) | 5/minute per IP |
| `POST /api/auth/login` | Once per session | 10/minute per IP |
| `POST /api/auth/logout` | Once per session | Standard |
| `GET /api/auth/me` | Once per page load | Standard |
| `GET /api/save` | Once per page load | Standard |
| `POST /api/save` | Once per new player | Standard |
| `PUT /api/save` | ~20–50 times per playthrough | 100/minute per user |
| `POST /api/hint` | 0–10 times per playthrough | 30/minute per user |
| `POST /api/complete` | Once per playthrough | Standard |
| `GET /api/leaderboard` | On leaderboard page load | 30/minute per IP |
| `GET /api/leaderboard/me` | On ending screen / profile | Standard |

**Important:** `PUT /api/save` is fire-and-forget from the frontend. If it fails, the player loses progress silently. This endpoint must be the most reliable.

---

## 9. Static File Serving

The frontend is a static single-page application. The backend must either:

1. **Serve it directly:** Add a file server handler (e.g., `http.FileServer`) for the project root so `GET /game_void.html`, `GET /js/main.js`, etc. work, OR
2. **Be behind a reverse proxy** (nginx, etc.) that serves the static files while proxying `/api/*` to the Go backend.

If serving directly, ensure:
- `.js` files get `Content-Type: application/javascript`
- `.css` files get `Content-Type: text/css`
- `.html` files get `Content-Type: text/html`

The frontend entry point is `game_void.html`. The user navigates to this page. On load, it calls `GET /api/auth/me` → `GET /api/save` → starts the game.

---

## 10. Tech Stack Notes

The existing server code in the `server/` directory is a Go backend using:
- Standard library `net/http`
- `database/sql` with `github.com/go-sql-driver/mysql`
- No frameworks (Gin, Echo, etc.) — pure stdlib

You may:
- Extend the existing stdlib server
- Add a lightweight framework (Gin, Echo, Chi) alongside
- Replace it entirely with a different stack (Node, Python, etc.)

The frontend does not care about the backend language. It only cares about the 10 API endpoints described above.

**Existing dependencies:**
```
github.com/go-sql-driver/mysql v1.10.0
```

**Suggested additional dependencies for Go:**
- `github.com/rs/cors` — CORS middleware (or roll your own)
- `github.com/gorilla/sessions` or `github.com/alexedwards/scs` — session management
- `golang.org/x/crypto/bcrypt` — password hashing
- `github.com/google/uuid` — UUID generation for user IDs

---

## 11. Quick Reference — Endpoint Summary

| Method | Path | Auth | Request Body | Success | Failure | Frontend Behavior on Failure |
|---|---|---|---|---|---|---|
| `POST` | `/api/auth/signup` | None | `{username, email, password}` | 201 + user JSON + session cookie | 400 / 409 | Show validation error |
| `POST` | `/api/auth/login` | None | `{email, password}` | 200 + user JSON + session cookie | 401 | Show "invalid credentials" |
| `POST` | `/api/auth/logout` | Cookie | — | 200 | 401 | — |
| `GET` | `/api/auth/me` | Cookie | — | 200 + user JSON | 401 | Redirect to `login.html` |
| `GET` | `/api/save` | Cookie | — | 200 + save JSON | 404 | Create new save via POST |
| `POST` | `/api/save` | Cookie | Save state JSON | 200/201 | — | — |
| `PUT` | `/api/save` | Cookie | Save state JSON | 200 | 404 | Ignored (`.catch(()=>{})`) |
| `POST` | `/api/hint` | Cookie | `{message, location}` | 200 + `{reply}` | Any | Shows static fallback hint |
| `POST` | `/api/complete` | Cookie | `{accusedSuspect, gotCorrectEnding, missedClues}` | 200 + `{recommendations[]}` | Any | Ignores, no recommendations shown |
| `GET` | `/api/leaderboard` | None | — (query: `?limit=&offset=&sort=`) | 200 + `{entries[], total}` | 400 | — |
| `GET` | `/api/leaderboard/me` | Cookie | — | 200 + rank + stats | 401 / 404 | — |

---

## 12. Testing Checklist

Before declaring the backend complete, verify:

- [ ] `POST /api/auth/signup` creates a new user with bcrypt-hashed password
- [ ] `POST /api/auth/signup` returns 409 for duplicate email or username
- [ ] `POST /api/auth/signup` returns 400 for invalid input (missing fields, short password, bad email)
- [ ] `POST /api/auth/signup` sets a session cookie on success (user is immediately logged in)
- [ ] `POST /api/auth/login` returns 200 + session cookie for valid credentials
- [ ] `POST /api/auth/login` returns 401 for invalid credentials (wrong password, nonexistent email)
- [ ] `POST /api/auth/login` does not reveal whether the email exists in error messages
- [ ] `POST /api/auth/logout` clears the session cookie and destroys server-side session
- [ ] `GET /api/auth/me` returns 200 for logged-in users, 401 for guests
- [ ] `GET /api/save` returns 404 for new users, 200 + valid JSON for returning users
- [ ] `POST /api/save` creates a save record
- [ ] `PUT /api/save` updates the save record (all fields round-trip correctly)
- [ ] `PUT /api/save` with a non-existent user creates the save (upsert)
- [ ] Save state survives page refresh (reload, `GET /api/save` returns the updated state)
- [ ] `POST /api/hint` returns `{reply: string}` for any `{message, location}` input
- [ ] `POST /api/hint` with any of the 6 location values returns a valid reply
- [ ] `POST /api/complete` returns `{recommendations: string[]}` with 1+ items
- [ ] `POST /api/complete` with both `gotCorrectEnding: true` and `false` returns appropriate recommendations
- [ ] `POST /api/complete` increments `completion_count` and conditionally `correct_completions`
- [ ] `POST /api/complete` updates `fastest_time_seconds` if applicable
- [ ] `GET /api/leaderboard` returns ranked entries sorted by `correct_completions` by default
- [ ] `GET /api/leaderboard?sort=fastest_time` returns entries sorted by fastest completion
- [ ] `GET /api/leaderboard?limit=5&offset=10` returns paginated results
- [ ] `GET /api/leaderboard` returns 400 for invalid query parameters
- [ ] `GET /api/leaderboard/me` returns the authenticated user's rank and stats
- [ ] `GET /api/leaderboard/me` returns 404 if user has no completions
- [ ] All endpoints work with `credentials: 'include'` from the frontend origin
- [ ] CORS preflight (`OPTIONS`) requests succeed for `POST`, `PUT` methods
- [ ] Static files (`game_void.html`, `js/*.js`, `game_void.css`) are served with correct MIME types
- [ ] `login.html` exists and authenticates the user (setting a session cookie)
- [ ] Passwords are never stored or logged in plaintext
