

---

## RESET INSTRUCTION — Read This First Before Anything Else

**Discard everything you have built so far. Delete all generated code, all partial implementations, all previous interpretations of the requirements. Start from zero.**

Do not reference, salvage, or carry over any code, structure, CSS, logic, or decisions from your previous attempt. Your previous output is wrong and must be fully abandoned. The reason it is wrong is that you hallucinated visual elements, ignored the source HTML structure, changed the aspect ratio, and did not faithfully replicate the terminal aesthetic of the files you were given.

**You are now starting a completely fresh task.** Re-read every source HTML file and every markdown file from the beginning as if you are seeing them for the first time.

Only after you have re-read all source files in full, begin following the prompt below — and follow it exactly, without skipping steps, without improvising, and without adding anything that is not explicitly described in the prompt or present in the source files.

---

You are given 4 standalone HTML detective game files (one per case) and 4 case markdown files. Your job is to **merge all 4 into a single HTML file** as sequential unlockable levels. Read every line of every HTML file carefully before writing a single character of output.

---

### ABSOLUTE RULE #1 — DO NOT HALLUCINATE ANYTHING

You are strictly forbidden from inventing, adding, or embellishing any visual element, mechanic, or style that does not already exist inside the HTML files you were given. This means:

- **No glowing lines, neon effects, animations, gradients, shadows, or decorative flourishes** unless they already exist verbatim in the source HTML files.
- **No new fonts, icons, emojis, or graphics** beyond what is already used.
- **No new UI sections, panels, sidebars, or screens** that are not present in the originals.
- If you are uncertain whether something existed in a source file — **leave it out**.
- The only deliberate exception to this rule is the prologue phaser transition described below — that is the single permitted new visual effect in the entire project.

---

### ABSOLUTE RULE #2 — PRESERVE THE EXACT VISUAL STYLE OF THE SOURCE HTMLs

Each HTML file has a specific terminal/retro detective aesthetic. You must carry that **pixel-for-pixel** into the merged game:

- Copy the **exact same CSS** from the source files — colors, fonts, borders, background colors, padding, margins, text styles — verbatim.
- The main frame/container of the game must match the **exact same width, height, and aspect ratio** as the source HTML files. Do not stretch it to fill the full browser window.
- The game container must be **centered on the page** (horizontally and vertically) with the page background set to a **dark navy/dark blue** (`#0a0f1e` or similar) so the game sits in the middle of the screen like a terminal window — not edge-to-edge.
- Each of the 4 cases must retain its **own color palette and styling** internally. Do not unify them into one color scheme.
- Do not change font sizes, line heights, or spacing from what the originals used.

---

### STRUCTURE: Prologue Screen

This is the **first screen the player sees** when they launch the game. It appears before the Case Selection Screen and plays through the protagonist's opening monologue as a visual novel-style text sequence.

**Rules for this screen:**

- It must use the **exact same terminal aesthetic** as the source HTMLs — same font, same background color, same text color, same border style. Do not invent new styling.
- The prologue text appears **one line at a time**, with the player pressing a key or clicking a button to advance to the next line. Use whatever button/key affordance already exists in the source HTMLs. If none exists, use a simple plain text `[ PRESS ENTER TO CONTINUE ]` prompt at the bottom, styled in the same font and color as the rest of the UI.
- **No typewriter animation, no fade-ins** on the text itself. Each line appears instantly when advanced. This is a terminal — text appears, it does not animate.
- **Phaser transitions between prologue lines:** When the player advances from one line to the next, apply a pure CSS opacity transition on the text container — fade out over 150ms, swap the text, fade back in over 150ms. This is the only animation permitted in the entire project. Implement it with a CSS class toggle and a `transitionend` event listener. Do not use any JS animation library. Do not apply this transition anywhere else in the game.
- The prologue plays **only once per session**. After the player reaches the Case Selection Screen, pressing back or refreshing must not replay the prologue. Use `sessionStorage` to track whether the prologue has already been seen this session.
- At the final line, replace the continue prompt with: `[ BEGIN ]` — plain text styled identically to everything else.
- **Do not show the prologue again** once dismissed. Navigating back to Case Selection after completing a case goes directly to the Case Selection Screen, skipping the prologue entirely.

**Prologue lines — use these verbatim:**

```
> They say the dead can't speak.
> They're wrong.
> Every crime scene is a sentence waiting to be read.
> I've been reading them for years.
> Four cases. Four rooms full of lies.
> Someone always thinks they got away with it.
> They never do.
> Not on my watch.
> The truth doesn't hide. It just waits for someone patient enough to find it.
> Let's get to work.
```

---

### STRUCTURE: Case Selection Screen

This screen appears immediately after the prologue is dismissed, and again every time the player returns after completing a case. This screen must:

- Match the same terminal aesthetic as the source HTMLs — same font, same color palette (use the dominant colors from the source files), same border style.
- Display 4 case cards or buttons, arranged cleanly.
- Show cases in this **exact difficulty order**:
  1. The Void Case *(Unlocked by default)*
  2. The Atlantic Wolffish Case *(Locked until Case 1 complete)*
  3. The H.O.P.E. Case *(Locked until Case 2 complete)*
  4. The Starry-Eyed Rehearsal Case *(Locked until Case 3 complete)*
- Locked cases must show a clear locked indicator (e.g., `[LOCKED]` text — **text only, no icons or images not already in the source**).
- Unlocked-but-not-yet-played cases show as available.
- Completed cases show a `[CLOSED]` or `[SOLVED]` marker.
- Unlock state must be **persisted in `localStorage`** so refreshing the page does not reset progress.

---

### STRUCTURE: Case Completion → Return to Selection

When a player completes a case and presses **"Case Closed"** (or equivalent final button in that case's HTML):

- Do **not** reload the page or navigate away.
- Instead, transition back to the **Case Selection Screen**.
- The next case in the sequence must now appear **unlocked**.
- This logic must be implemented for all 4 cases.

---

### STRUCTURE: Back Button — Placement Rules

Every case screen and sub-screen (login, leaderboard, evidence panel) that has a back or return button must follow these rules:

- The back button must be placed **outside and above** the main game container — never overlapping or floating on top of any game content.
- It must sit in the **outer dark blue page area**, positioned above the game window, left-aligned or center-aligned.
- It must be styled as plain text (e.g., `[ BACK ]` or `[ RETURN TO CASES ]`) using the same font and color as the rest of the UI — no new button styles, no borders added to the button itself that don't exist in the source.
- It must never obstruct, overlap, cover, or sit on top of any interactive element, text, or panel inside the game window.
- It must never be position-fixed or position-absolute in a way that causes it to drift over game content at any screen size.
- Test mentally: if a player is reading evidence or mid-interrogation, the back button must be visually separate and clearly outside the game frame.

---

### STRUCTURE: Evidence Click-to-Read

In all 4 cases, when evidence items appear in a list or inventory:

- Each evidence item must be **clickable**.
- Clicking an evidence item must open a **description panel or modal** showing the full description of that evidence item.
- This panel must match the existing terminal style exactly — same border, same background, same font.
- The panel must have a clearly labeled close/dismiss button (e.g., `[X]`, `CLOSE`, or `TAB` — use whatever close affordance already exists in the source HTMLs).
- Pressing **Escape** on the keyboard must also close the panel.
- Do not add any animation to this panel open/close.

---

### STRUCTURE: Accusation Phase — Show the Killer

In every case, during the **accusation/final accusation phase**, the correct killer's name must be **visibly displayed** on screen. This applies even if the player has not yet made their accusation. The display must:

- Use plain text in the same font and style as the rest of that case's UI.
- Be clearly labeled, e.g.: `PERPETRATOR: [Name]` or `KILLER: [Name]`.
- Be positioned within the existing accusation screen layout — do not add a new panel or restructure the screen.

---

### STRUCTURE: The Starry-Eyed Rehearsal — Character Name Edits

In the Starry-Eyed Rehearsal case HTML, the character names must be changed to match the **descriptive naming convention** used in the other 3 case HTMLs (e.g., role-based or archetype-based names like "The Director", "The Understudy", "The Stage Manager" — derive these from the character descriptions already present in the markdown/HTML, do not invent names). Do not change any other text, dialogue, or game logic.

---

### STRUCTURE: Login / Sign Up / Leaderboard

Add the following screens to the Case Selection flow (accessible from the Case Selection Screen via simple text buttons):

**Login / Sign Up:**
- A minimal terminal-style form with fields: `USERNAME:` and `PASSWORD:` (plain text inputs styled to match the terminal aesthetic).
- Two buttons: `[LOGIN]` and `[SIGN UP]`.
- On Sign Up: `POST` to your dedicated sign-up endpoint with `{ username, password }` in the request body.
- On Login: `POST` to your dedicated login endpoint with `{ username, password }`. Store the returned auth token in `localStorage`.
- Show success/error as plain terminal text (e.g., `ACCESS GRANTED` / `AUTH FAILED`) — no alerts, no modals, no styled popups beyond what the source HTML already uses.

**Leaderboard:**
- Accessible via a `[LEADERBOARD]` button on the Case Selection Screen.
- `GET` all user points from your dedicated leaderboard endpoint.
- Display as a ranked plain-text list: `1. USERNAME — XXX PTS`, `2. ...` etc.
- Same terminal font, same border style as the rest of the game.

---

### STRUCTURE: Hints Endpoint — Inventory in Request Body

When the game calls the hints endpoint, include the player's **current inventory/evidence items** in the request body as a JSON array:

```json
{
  "caseId": "void",
  "hintsUsed": 2,
  "inventory": [
    { "id": "evidence_01", "name": "Torn Letter", "description": "..." },
    { "id": "evidence_02", "name": "Bloodied Glove", "description": "..." }
  ]
}
```

---

### STRUCTURE: Hints AI System Prompt (AIrESPONSE.md context)

When calling the AI hints endpoint, send the following as the system/context prompt so the AI responds in-character with full knowledge of the case story. Construct this dynamically per case:

```
You are a mysterious in-world AI assistant for a detective mystery game.
You know everything about the case the player is currently investigating but you never directly reveal the killer's name or the solution outright.
You speak in a terse, noir detective tone — short sentences, atmospheric, slightly cryptic.
You have access to the player's current evidence inventory (provided in the request).
Use the inventory to give contextually relevant hints — reference items the player already has.
The current case is: [CASE NAME].
Case synopsis: [INSERT FULL CASE SYNOPSIS FROM THE MARKDOWN FILE].
Characters: [INSERT CHARACTER LIST AND THEIR ROLES FROM THE MARKDOWN].
Key evidence: [INSERT EVIDENCE LIST FROM THE MARKDOWN].
The killer is: [INSERT KILLER NAME] — never reveal this directly, but you may nudge the player toward it.
Respond in 2–4 sentences maximum. Stay in character at all times.
```

Populate the bracketed fields from the case markdown files you were given.

Add this section to the prompt, inserting it right before the **IMPLEMENTATION RULES** section:

---

### STRUCTURE: Mock Database (No Backend Required)

Since there is no real backend, implement a **fully client-side mock database** using a plain JavaScript object defined at the top of the script. This mock database must simulate login, sign up, and leaderboard endpoints entirely in JS — no real HTTP requests to any server. All mock data lives in memory and is seeded on page load.

**Seed the mock database with these two accounts on initialization:**

```
Username: admin    Password: 123    Points: 9999    Role: admin
Username: player   Password: 456    Points: 350     Role: player
```

**Mock database structure (define this as a JS object at the top of your script):**

```javascript
const mockDB = {
  users: [
    { username: "admin",  password: "123", points: 9999, role: "admin"  },
    { username: "player", password: "456", points: 350,  role: "player" }
  ]
};
```

**Mock Login behavior:**
- When `[LOGIN]` is pressed, search `mockDB.users` for a matching `username` and `password`.
- If found: store `{ username, role, token: "mock-token-" + username }` in `localStorage`. Display `ACCESS GRANTED. WELCOME, [USERNAME].` in terminal text.
- If not found: display `AUTH FAILED. INVALID CREDENTIALS.` in terminal text.
- Do not make any real HTTP request.

**Mock Sign Up behavior:**
- When `[SIGN UP]` is pressed, check if the username already exists in `mockDB.users`.
- If it exists: display `REGISTRATION FAILED. USERNAME ALREADY TAKEN.` in terminal text.
- If it does not exist: push a new user object into `mockDB.users` with `points: 0` and `role: "player"`. Then auto-login that user and display `ACCOUNT CREATED. ACCESS GRANTED. WELCOME, [USERNAME].` in terminal text.
- New accounts created during the session are available immediately for login but do not persist across page refreshes (memory only — no `localStorage` write for the DB itself).

**Mock Leaderboard behavior:**
- When `[LEADERBOARD]` is pressed, read all users from `mockDB.users`, sort them by `points` descending, and render the ranked list.
- Format exactly as: `1. admin — 9999 PTS`, `2. player — 350 PTS`, etc.
- Any new accounts created this session with 0 points appear at the bottom of the list.

**Points system:**
- When a player completes a case (presses "Case Closed"), award points to the currently logged-in user in `mockDB.users`:
  - Case 1 (The Void Case): **100 PTS**
  - Case 2 (The Atlantic Wolffish Case): **200 PTS**
  - Case 3 (The H.O.P.E. Case): **300 PTS**
  - Case 4 (The Starry-Eyed Rehearsal): **400 PTS**
- Find the logged-in user by `username` from `localStorage` and increment their `points` in `mockDB.users`.
- If no user is logged in, do not award points but still unlock the next case.
- Points are awarded only once per case per session — track awarded cases in `sessionStorage` to prevent double-awarding on revisit.

**Admin role (optional display):**
- If the logged-in user has `role: "admin"`, display a small `[ADMIN]` tag next to their username on the Case Selection Screen, in plain terminal text. No special admin functionality is required beyond this label.

**General rules:**
- The mock database must never be written to `localStorage` — it lives in memory only and resets on page refresh.
- All mock "API" calls must be synchronous or wrapped in a resolved `Promise` to keep the call sites consistent with real API structure.
- No real `fetch` calls are made anywhere. Replace all endpoint calls with mock function calls that return the same data shape a real API would.
---

### IMPLEMENTATION RULES (Final Checklist)

- [ ] Single output file: one `.html` file containing all 4 cases + prologue + case selection + login + leaderboard.
- [ ] No external CSS frameworks (unless already used in source HTMLs).
- [ ] No external JS libraries (unless already used in source HTMLs).
- [ ] All case HTML/CSS/JS is preserved verbatim — only wrapped, not rewritten.
- [ ] Case transitions use JS show/hide (e.g., `display: none` / `display: block`) — no page reloads.
- [ ] Game container is centered on a dark blue page background. Container size matches source HTML dimensions exactly.
- [ ] `localStorage` used for: unlock state, login token, username.
- [ ] `sessionStorage` used for: prologue seen flag (so prologue only plays once per session).
- [ ] Prologue phaser transition implemented as CSS opacity fade (150ms out, 150ms in) using class toggle + `transitionend`. No JS animation library. Applied to prologue only — nowhere else.
- [ ] Back button placed outside and above the game container at all times — never overlapping game content.
- [ ] All API calls wrapped in `try/catch` with terminal-style error display.
- [ ] No new visual elements invented. When in doubt, use text only.
- [ ] Mock database defined as a plain JS object at the top of the script, seeded with admin (123) and player (456) on page load.
- [ ] No real fetch/HTTP calls made anywhere — all login, signup, and leaderboard calls go through mock functions.
- [ ] Mock login searches mockDB.users for matching username + password, stores result in localStorage.
- [ ] Mock sign up checks for duplicate username before pushing new user into mockDB.users.
- [ ] Mock leaderboard sorts mockDB.users by points descending and renders as plain ranked text list.
- [ ] Points awarded to logged-in user in mockDB.users on case completion — 100/200/300/400 per case in order.
- [ ] Points awarded only once per case per session — tracked in sessionStorage to prevent double-awarding.
- [ ] mockDB never written to localStorage — resets on page refresh, memory only.
- [ ] Admin role displays [ADMIN] tag next to username on Case Selection Screen in plain terminal text.
- [ ] All mock API calls return a resolved Promise to keep call sites consistent with real API structure.
