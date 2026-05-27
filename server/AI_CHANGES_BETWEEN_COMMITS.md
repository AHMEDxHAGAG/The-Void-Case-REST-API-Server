# What Changed Between `226ba160` and `8e2eb77`

This file explains the difference between:

- Before AI: `226ba160ae22c26c6debd33d3c805d2a523bf475`
- After AI: `8e2eb77296ef97f528a4bd8933ac5f13ea558316`

The comparison is a cumulative diff across these commits:

```text
edc6aad Better but with fatal errors, will be fixed promise
58b04ce some fixes
9580315 before help
8e2eb77 AI unpurified
```

High-level diff:

```text
15 files changed, 385 insertions(+), 85 deletions(-)
```

## Big Picture

Before the AI changes, the backend had pieces of a CRUD API, but the main authentication path was not real yet. The auth handlers were empty, `GetID` always returned a placeholder string, the server ran only the API on a fixed port, save-game JSON was being encoded incorrectly, and some SQL/DAO code had bugs.

After the AI changes, the backend became a more complete session-based API:

- Signup creates a user, hashes the password, creates a session, sets a cookie, and returns JSON.
- Login checks the email/password, creates a session, sets a cookie, and returns JSON.
- Logout deletes the session and clears the browser cookie.
- Protected routes now read `session_id` from the cookie and look up the real `user_id`.
- Save-game data is stored and returned as JSON bytes instead of double-encoded strings.
- The server can serve both API and UI from one Go process.
- CORS, request logging, panic recovery, environment variables, and safer server timeouts were added.

## Files Changed

| File | Main change |
| --- | --- |
| `server/handlers/auth.go` | Implemented signup, login, logout, session cookie setting, and JSON responses. |
| `server/DAO/authDAO.go` | Replaced fake `GetID` with real session database functions. |
| `server/models/auth.go` | Added request models for login/signup and changed session field names. |
| `server/services/auth.go` | Added duplicate-email helper. |
| `server/handlers/users.go` | Removed direct user creation endpoint and made update/delete use authenticated user. |
| `server/DAO/usersDAO.go` | Added email lookup, username lookup, fixed update ID usage, fixed scan error handling. |
| `server/handlers/saves.go` | Made save routes use real session lookup and JSON bytes. |
| `server/DAO/savesDAO.go` | Changed save data from `string` to `[]byte`; changed default `pins` from object to array. |
| `server/handlers/leaderboard.go` | Made `/api/leaderboard/me` use session lookup. |
| `server/DAO/leaderboardDAO.go` | Fixed invalid "my leaderboard" query by ranking all users then finding the current one. |
| `server/db/db.go` | Added `DB_DSN` environment variable and `parseTime=true`. |
| `server/main.go` | Changed routes, added static UI serving, CORS, logging, recovery, env port, and timeout. |
| `server/models/user.go` | Hid password hash from JSON and added `UpdateUserRequest`. |
| `server/handlers/hints.go` | Moved `204 No Content` response after placeholder lock logic. |
| `sql/sqlquery.sql` | Made `save_data` nullable and added `sessions` table. |

## How The AI Made The Code Work

### 1. Auth handlers stopped being empty

Before:

```go
func Login(w http.ResponseWriter, r *http.Request) {

}

func Signup(w http.ResponseWriter, r *http.Request) {

}
```

After, `Login` and `Signup` actually perform the API work:

- Decode JSON from the request body.
- Validate required fields.
- Search the database by email.
- Hash or compare the password with bcrypt.
- Create a session ID.
- Store the session in the database.
- Set a browser cookie named `session_id`.
- Return JSON to the frontend.

Important files:

- `server/handlers/auth.go`
- `server/models/auth.go`
- `server/services/auth.go`
- `server/DAO/usersDAO.go`
- `server/DAO/authDAO.go`

Why this matters: frontend login/signup cannot work if the backend handler returns nothing. A route existing in `main.go` is not enough; the handler must parse the request, call the database, and write a response.

### 2. Fake session lookup was replaced with real session lookup

Before:

```go
func GetID(sessionID string) (id string) {
	return "plh"
}
```

This meant every protected endpoint used the fake user id `"plh"`. Even if a browser sent a cookie, the backend never checked the database.

After:

```go
func GetID(db *sql.DB, session string) (id string, err error) {
	query := `select user_id from sessions where session_id = ?`
	var s models.Session
	err = db.QueryRow(query, session).Scan(&s.User_id)
	return s.User_id, err
}
```

The AI also added:

```sql
CREATE TABLE if not exists sessions (
  user_id TEXT not NULL unique,
  session_id TEXT not NULL
);
```

Why this matters: authentication needs a mapping from browser cookie to server-side user. The cookie should not contain the whole user object. It should contain an unguessable session ID, and the server should use that ID to find the user.

### 3. Signup became the correct place to create users

Before, user creation was exposed as:

```go
mux.HandleFunc("PUT /api/users/", handlers.CreateUser)
```

That mixed user account creation with generic user CRUD. It also accepted a full `models.User`, which included fields the client should not control, like `user_id`, `hashed_password`, completion counters, and timestamps.

After, the create-user route was removed and signup creates the user:

```go
mux.HandleFunc("POST /api/auth/signup", handlers.Signup)
```

The signup request model is smaller:

```go
type Signuper struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}
```

Why this matters: clients should send intent-level data like `email`, `username`, and `password`. The server should generate IDs, hash passwords, and set default counters.

### 4. Password hashes stopped leaking through JSON

Before:

```go
Hashed_password string `json:"hashed_password"`
```

After:

```go
Hashed_password string `json:"-"`
```

Why this matters: even though bcrypt hashes are not plain passwords, you should still never return them to the frontend. `json:"-"` tells Go's JSON encoder to omit that field.

### 5. User update/delete now operate on the logged-in user

Before, `UpdateUser` decoded a full `models.User` and then the DAO accidentally used `user.User_id` instead of the authenticated ID:

```go
func DBUpdateUser(db *sql.DB, user models.User, id string) error {
	query := `update users set username = ?, email = ? where user_id = ?`
	_, err := db.Exec(query, user.Username, user.Email, user.User_id)
	return err
}
```

The function accepted `id`, but ignored it.

After:

```go
func DBUpdateUser(db *sql.DB, user models.UpdateUserRequest, id string) error {
	query := `update users set username = ?, email = ? where user_id = ?`
	_, err := db.Exec(query, user.Username, user.Email, id)
	return err
}
```

Why this matters: the server should trust the session, not a user ID sent by the browser. Otherwise a malicious user could try to update someone else's account.

### 6. Save-game JSON stopped being double-encoded

Before, `GetSaveGame` loaded save data as a string and then ran `json.Marshal` on that string:

```go
j, err := json.Marshal(respond)
w.Write(j)
```

If `respond` already contained JSON like:

```json
{"currentLocation":"basement"}
```

marshaling the string again sends this instead:

```json
"{\"currentLocation\":\"basement\"}"
```

That is a JSON string containing JSON text, not a JSON object.

After, save data is loaded as `[]byte` and written directly:

```go
respond, err := dao.DBGetSaveGame(db.Db, theid)
w.Header().Set("Content-Type", "application/json")
w.WriteHeader(http.StatusOK)
w.Write(respond)
```

Why this matters: if data is already valid JSON bytes from the database, write those bytes as the response body. Do not marshal it again as a Go string.

### 7. Save updates now decode the frontend object instead of a string

Before:

```go
var request string
err = json.NewDecoder(r.Body).Decode(&request)
err = dao.UpdateSaveGame(db.Db, dao.GetID(cookie.Value), request)
```

That expects the frontend to send a JSON string, not the actual save object.

After:

```go
var request models.Save
err = json.NewDecoder(r.Body).Decode(&request)
j, err := json.Marshal(request)
err = dao.UpdateSaveGame(db.Db, theid, j)
```

Why this matters: the frontend naturally sends an object. The backend should decode that object into a Go struct, validate it if needed, then store it as JSON.

### 8. Database timestamps now scan correctly

The DSN changed from:

```go
root:200692@tcp(localhost:3306)/puzzle
```

to:

```go
root:200692@tcp(localhost:3306)/puzzle?parseTime=true
```

Why this matters: the MySQL Go driver needs `parseTime=true` to scan `TIMESTAMP`/`DATETIME` columns into Go `time.Time` fields. Without it, scanning into `models.User.Created_at` and `Updated_at` can fail.

### 9. The server now serves the UI and API together

Before:

```go
http.ListenAndServe(":8080", mux)
```

After:

```go
uiDir := os.Getenv("UI_DIR")
if uiDir == "" {
	uiDir = "../UI"
}
mux.Handle("GET /", http.FileServer(http.Dir(uiDir)))
```

The server also now reads:

- `APP_PORT`
- `UI_DIR`
- `DB_DSN`
- `CORS_ORIGINS`
- `COOKIE_SECURE`

Why this matters: if the UI is served from one port and the API from another, relative `/api/...` requests often go to the wrong place. Serving UI and API from one Go server removes that class of bug.

### 10. The leaderboard query was made valid

Before:

```sql
SELECT ... from users order by ... where user_id = ?;
```

SQL order is wrong there. `WHERE` must come before `ORDER BY`.

After, the code ranks all users and loops until it finds the current user.

Why this matters: SQL clause order matters. The usual order is:

```sql
SELECT ...
FROM ...
WHERE ...
GROUP BY ...
HAVING ...
ORDER BY ...
LIMIT ...
```

## What You Did Wrong

These are not "bad programmer" mistakes. They are normal backend learning mistakes.

### 1. You wired routes before implementing the handlers

You had routes like `/api/auth/login`, `/api/auth/signup`, and `/api/auth/logout`, but the functions were empty. The frontend can call those URLs forever and nothing useful will happen.

Lesson: every API route needs a full request lifecycle:

```text
route -> decode request -> validate -> call service/DAO -> handle errors -> write response
```

### 2. You used placeholder auth as if it were real auth

`GetID` returned `"plh"`, so all protected endpoints were pretending to authenticate but were not actually tied to the logged-in user.

Lesson: once a placeholder is used by other code, it can hide bugs. Replace placeholders early or make them fail loudly.

### 3. You trusted client-supplied user data too much

The old `CreateUser` endpoint accepted a full `models.User`. That means the client could send fields that should belong to the server:

- `user_id`
- `hashed_password`
- `created_at`
- `updated_at`
- completion counters

Lesson: use separate request structs for API input. Do not reuse database models for every request.

### 4. You wrote the HTTP status before finishing validation

Old `CreateUser` called:

```go
w.WriteHeader(http.StatusNoContent)
```

before checking whether the request was valid and before writing to the database.

Lesson: in Go, once you call `WriteHeader`, the status code is sent. You cannot later change the response to `400` or `500` in a reliable way.

### 5. You ignored or swallowed some errors

Examples:

- `DBGetAllUsers` returned `users, nil` when `rows.Scan` failed.
- Some handlers returned without sending an error response.
- `http.ListenAndServe` was called without checking its returned error.

Lesson: error handling is part of program logic. If a database operation fails, the caller needs to know.

### 6. You confused raw JSON with JSON strings

A JSON object:

```json
{"gamePhase":"intro"}
```

is not the same as a JSON string containing that object:

```json
"{\"gamePhase\":\"intro\"}"
```

Lesson: if you store JSON as bytes, return bytes. If you have a Go struct, marshal it once. Do not marshal already-marshaled JSON unless you intentionally want a string.

### 7. Some SQL was syntactically or logically wrong

The leaderboard query put `WHERE` after `ORDER BY`. The user update DAO accepted `id` but used `user.User_id`. Those bugs are small but break whole features.

Lesson: always check SQL clause order and make sure function parameters are actually used.

### 8. You had no tests to catch regressions

The backend compiles after the AI changes, but there are no test files. Without tests, bugs like double-encoded JSON or fake session IDs are easy to miss.

Lesson: even 3 or 4 small tests for auth, save, and user update would catch many of these issues.

## Concepts You Should Learn Next

### 1. HTTP request lifecycle in Go

Learn how `net/http` handlers work:

- `http.ResponseWriter` writes headers and body.
- `*http.Request` contains method, path, body, headers, and cookies.
- `WriteHeader` should happen after validation and before the body.
- If you call `http.Error`, you should usually `return` immediately.

Mental model:

```text
browser sends request -> handler reads request -> handler decides status -> handler writes response
```

### 2. API route design

Good APIs separate auth actions from user resource actions:

```text
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/users/me
PUT  /api/users/me
DELETE /api/users/me
```

This is clearer than making `PUT /api/users/` create an account.

### 3. Request models vs database models

Do not use one struct for everything.

Example:

```go
type Signuper struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type User struct {
	User_id         string `json:"user_id"`
	Email           string `json:"email"`
	Hashed_password string `json:"-"`
}
```

The request model is what the client sends. The database model is what the server stores.

### 4. Sessions and cookies

The flow is:

```text
login/signup -> generate session_id -> store session_id in DB -> send cookie -> browser sends cookie on later requests -> server looks up user_id
```

Important cookie flags:

- `HttpOnly`: JavaScript cannot read the cookie.
- `SameSite`: reduces cross-site request problems.
- `Secure`: only send over HTTPS when enabled.
- `MaxAge`: controls cookie lifetime or deletion.

### 5. Password hashing

Never store plain passwords. The code uses bcrypt:

```go
bcrypt.GenerateFromPassword([]byte(password), 12)
bcrypt.CompareHashAndPassword([]byte(hashed), []byte(password))
```

Important idea: hashing is one-way. On login, you do not decrypt the password. You compare the typed password against the stored hash.

### 6. SQL with Go's `database/sql`

Learn these patterns:

- `db.Exec` for `INSERT`, `UPDATE`, `DELETE`.
- `db.QueryRow(...).Scan(...)` for one row.
- `db.Query` plus `rows.Next()` for many rows.
- `defer rows.Close()` immediately after checking `db.Query` error.
- Always return scan errors.

Also learn SQL clause order:

```sql
SELECT columns
FROM table
WHERE condition
ORDER BY column
```

### 7. JSON encoding and decoding

Learn the difference between:

- `json.NewDecoder(r.Body).Decode(&value)` for request bodies.
- `json.Marshal(value)` to turn Go data into JSON bytes.
- Writing raw JSON bytes directly when data is already JSON.

Rule of thumb:

```text
Go struct -> json.Marshal -> JSON bytes
JSON bytes -> w.Write -> HTTP response
JSON string -> json.Marshal -> quoted/escaped JSON string
```

### 8. Environment-based configuration

Hard-coded values like database passwords and ports make code hard to run on another machine.

Better:

```text
DB_DSN=root:password@tcp(localhost:3306)/puzzle?parseTime=true
APP_PORT=8081
UI_DIR=../UI
```

This lets the same code run locally, on a teammate's laptop, or in deployment with different settings.

### 9. CORS and same-origin problems

If the UI is on `localhost:5500` and the API is on `localhost:8081`, the browser treats them as different origins. Then cookies and `/api/...` requests can fail unless CORS is configured correctly.

Serving the UI and API from the same Go server is simpler:

```text
http://localhost:8081/          -> UI
http://localhost:8081/api/save  -> API
```

### 10. Testing backend handlers

Start with tests for:

- Signup creates a user and returns `201`.
- Login rejects wrong passwords with `401`.
- `GET /api/save` returns a JSON object, not a quoted string.
- `PUT /api/users/me` updates only the logged-in user's row.
- Invalid session cookies return `401` or `403`, not `500`.

Use tests to prove behavior, not just to check that code compiles.

## Remaining Problems After The AI Changes

The AI improved the backend, but the after version is not perfect.

### 1. Duplicate-email check hides database errors

Current code:

```go
func EmailDuplicated(email string) bool {
	_, _, err := dao.DBSearchUserByEmail(db.Db, email)
	if err == sql.ErrNoRows {
		return false
	} else {
		return true
	}
}
```

If the database is down, this returns `true` and tells the user "email already registered". Better design:

```go
func EmailDuplicated(email string) (bool, error)
```

Then the handler can return `500` for database errors.

### 2. Invalid sessions become internal server errors

Many handlers call:

```go
id, err := dao.GetID(db.Db, cookie.Value)
if err != nil {
	http.Error(w, err.Error(), http.StatusInternalServerError)
	return
}
```

If the cookie is expired or fake, that is not a server crash. It should probably be `401 Unauthorized` or `403 Forbidden`.

### 3. Session table needs stronger constraints

Current schema:

```sql
CREATE TABLE if not exists sessions (
  user_id TEXT not NULL unique,
  session_id TEXT not NULL
);
```

Better ideas:

- Make `session_id` unique or primary key.
- Add `created_at` and `expires_at`.
- Add a foreign key to `users(user_id)`.
- Use `VARCHAR(255)` instead of `TEXT` if you need indexes.

### 4. `models.Save.Pins` is probably the wrong type

Current model:

```go
Pins []byte `json:"pins"`
```

But the default save JSON uses:

```json
"pins": []
```

If `pins` is supposed to be an array of pin objects or strings, `[]byte` is not the right type. `[]byte` has special JSON behavior in Go. It is usually for raw bytes, not normal JSON arrays.

### 5. User update needs validation

`UpdateUser` can currently write empty username/email values if the frontend sends them. It also does not check duplicate emails.

Better behavior:

- Trim spaces.
- Reject empty username/email.
- Validate email format if needed.
- Return `409 Conflict` on duplicate email.

### 6. Leaderboard "me" works but is inefficient

The AI fixed the invalid SQL by loading all ranked users and finding the current user in Go. That works for small data, but a better SQL query would rank in a subquery/CTE and filter by `user_id`.

### 7. No automated runtime tests yet

`go test ./...` passes, but only because there are no test files. That proves the code compiles. It does not prove login, signup, save, or leaderboard behavior works with a real database.

## Commands Used To Inspect The Difference

Run the git commands from the repository root:

```bash
git diff --stat 226ba160ae22c26c6debd33d3c805d2a523bf475 8e2eb77296ef97f528a4bd8933ac5f13ea558316

git diff --name-status 226ba160ae22c26c6debd33d3c805d2a523bf475 8e2eb77296ef97f528a4bd8933ac5f13ea558316

git diff 226ba160ae22c26c6debd33d3c805d2a523bf475 8e2eb77296ef97f528a4bd8933ac5f13ea558316 -- server
```

Run the Go verification command from `server`:

```bash
go test ./...
```

## Final Summary

The AI mainly turned your backend from "routes and partial database functions" into a working session-auth API.

Your biggest original issues were:

- Auth routes existed but did not do anything.
- Session logic was a placeholder.
- Client input was trusted too much.
- JSON save data was encoded in the wrong shape.
- SQL and DAO functions had small but important bugs.
- UI/API port setup likely caused frontend requests to hit the wrong server.
- There were no tests to catch these problems.

The most important concepts to learn next are:

1. Go HTTP handler flow.
2. Sessions and cookies.
3. Request structs vs database structs.
4. Password hashing.
5. SQL with `database/sql`.
6. JSON encoding/decoding.
7. Environment configuration and CORS.
8. Backend tests.
