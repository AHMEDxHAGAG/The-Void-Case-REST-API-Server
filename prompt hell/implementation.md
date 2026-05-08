# PROJECT: THE VOID CASE — Build Prompt (Phase-by-Phase)

> Build one single self-contained file: `game_void.html`
> No backend work needed — all API endpoints are already built and running.
> No external assets. No external CSS. No external JS beyond Phaser CDN.
> Every phase must be fully implemented. No truncation. No placeholder comments.

---

## PHASE 0 — CANVAS, SCALING, AND CENTERING

The game canvas is **exactly 960×600px**, centered in the browser window. Nothing renders outside it.

```css
* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  background: #0a0a0f;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100vw;
  overflow: hidden;
}

#game-container {
  width: 960px;
  height: 600px;
  position: relative;
  flex-shrink: 0;
}
```

Phaser config:
```javascript
const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 600,
  parent: 'game-container',
  backgroundColor: '#111118',
  scene: [Boot, Intro, Game, Trial, Ending]
}
```

Responsive scaling — on screens narrower than 960px, scale down proportionally:
```javascript
function scaleGame() {
  const scale = Math.min(window.innerWidth / 960, window.innerHeight / 600);
  const c = document.getElementById('game-container');
  c.style.transform = `scale(${scale})`;
  c.style.transformOrigin = 'center center';
}
window.addEventListener('resize', scaleGame);
scaleGame();
```

The surrounding page is solid `#0a0a0f`. Canvas is the only thing visible. No fullscreen, no stretching, no overflow.

---

## PHASE 1 — CONSTANTS AND FONTS

Load via `@import` in a `<style>` tag:
- `Rajdhani` weight 700
- `Space Mono` weight 400

**Color palette (exactly 5 colors, use nothing else):**

| Constant | Hex | Use |
|---|---|---|
| BG | `#111118` | Background, scene fill |
| ACCENT | `#e63946` | Active elements, highlights, crimson |
| ACCENT2 | `#9b1d20` | Secondary red, blood tone |
| LIGHT | `#f0eaff` | All text, off-white |
| MUTE | `#4a4a5a` | Inactive borders, labels |

**Fonts:**
- `Rajdhani 700` — all headers, labels, button text, ALL CAPS UI
- `Space Mono 400` — all dialogue, evidence text, descriptions, monospace detail

**Global constants object:**
```javascript
const C = {
  BG:      0x111118,   BG_S:      '#111118',
  ACCENT:  0xe63946,   ACCENT_S:  '#e63946',
  ACCENT2: 0x9b1d20,   ACCENT2_S: '#9b1d20',
  LIGHT:   0xf0eaff,   LIGHT_S:   '#f0eaff',
  MUTE:    0x4a4a5a,   MUTE_S:    '#4a4a5a'
};
const F = { UI: 'Rajdhani, sans-serif', MONO: 'Space Mono, monospace' };
```

---

## PHASE 2 — GAME STATE

All state lives in memory. No `localStorage`. Sync to backend silently via `PUT /api/save` every time state changes — never block gameplay waiting for the response.

```javascript
const gameState = {
  currentLocation: 'basement',
  collectedEvidence: [],
  visitedLocations: [],
  suspectsTalked: [],
  pins: {},
  contradictionsTriggered: [],
  trialProgress: 0,
  gamePhase: 'intro'
};
```

**On game load:**
1. Call `GET /api/auth/me` (with `credentials: 'include'`)
2. If 401 → redirect to `login.html`
3. If authenticated → call `GET /api/save`
4. If save exists → populate `gameState` from response
5. If 404 → use defaults, call `POST /api/save` after first game action

**On every state change:** call `PUT /api/save` with updated fields in the background.

---

## PHASE 3 — HELPER FUNCTIONS

Implement these globally before any scene:

**`drawAllCornerMarks(scene, x, y, w, h, color, len)`**
Draws L-shaped corner accents at all 4 corners of a rectangle. Two perpendicular lines, `len` pixels each (default 14). `lineStyle(2, color, 1)`. Used on every major panel.

```javascript
function drawAllCornerMarks(s, x, y, w, h, color, len) {
  len = len || 14;
  const g = s.add.graphics();
  g.lineStyle(2, color, 1);
  // TL
  g.beginPath(); g.moveTo(x, y+len); g.lineTo(x, y); g.lineTo(x+len, y); g.strokePath();
  // TR
  g.beginPath(); g.moveTo(x+w-len, y); g.lineTo(x+w, y); g.lineTo(x+w, y+len); g.strokePath();
  // BL
  g.beginPath(); g.moveTo(x, y+h-len); g.lineTo(x, y+h); g.lineTo(x+len, y+h); g.strokePath();
  // BR
  g.beginPath(); g.moveTo(x+w-len, y+h); g.lineTo(x+w, y+h); g.lineTo(x+w, y+h-len); g.strokePath();
  return g;
}
```

**`makeButton(scene, x, y, w, h, label, opts)`**
Returns a container. `BG` fill, 2px `ACCENT` border, `Rajdhani` label centered. `opts.onClick` callback. Hover: fill lightens slightly. Cursor: pointer.

**`drawCanvasFrame(scene)`**
1px `ACCENT` border around the full 960×600 canvas edge. L-corner marks at all 4 canvas corners in `ACCENT`, 3px weight, len 22. Depth 9999 so always on top.

---

## PHASE 4 — PORTRAIT SYSTEM (BOOT SCENE)

Portraits are baked in the `Boot` scene using `renderTexture` + `saveTexture`. All drawn programmatically — no external images.

**Portrait dimensions:** 160×200px each.

**Draw order for every portrait:**
1. Fill background rect
2. Draw 2px colored border rect (`strokeRect(2, 2, 156, 196)`)
3. Draw body — trapezoid polygon (wider at top/shoulders, narrower at bottom): `moveTo(20, 200), lineTo(42, 115), lineTo(118, 115), lineTo(140, 200), closePath(), fillPath()`
4. Draw head — filled circle at approximately `(80, 62)` radius ~26
5. Draw hair shape if any — rect or arc above/over head
6. Draw any accessory
7. Draw name label: `Space Mono` 9px, centered at `(80, 182)`

**All 8 portraits:**

| Key | Body Color | Head Color | Hair | Accessory | Border Color | Name Color | BG |
|---|---|---|---|---|---|---|---|
| `portrait_investigator` | `0x2a2a3a` | `0x2a2a3a` | none | none | `0xe63946` | `#f0eaff` | `0x1a1a2a` |
| `portrait_scheduler` | `0x1a0a0a` | `0xc49a6c` | wide rect `0xe87ca0` above head | none | `0x9b1d20` | `#e63946` | `0x1a0f0f` |
| `portrait_operator` | `0x2a2035` | `0xd4cfe0` | neat rect `0x1a1520` | small badge rect on body | `0x4a4a5a` | `#f0eaff` | `0x12121a` |
| `portrait_observer` | `0xd4621a` | `0x8b5e3c` | wide dark rect `0x1a0f0a` | none | `0xd4621a` | `#f0eaff` | `0x1a1210` |
| `portrait_courier` | `0x2d4a2d` | `0xc49a6c` | cropped dark rect `0x2a1f1a` | slight frown line below head | `0x4a4a5a` | `#f0eaff` | `0x1a1a18` |
| `portrait_drifter` | `0x2a2035` | `0xd4cfe0` | `0xe87ca0` rect covering left half of head | small `0xc49a2a` filled circle right side (eye) | `0x4a4a5a` | `#c49a2a` | `0x12121a` |
| `portrait_cloaked` | `0x0f0f0f` | `0x0f0f0f` | none | white `0xf0f0f0` oval mask shape over face area | `0x4a4a5a` | `#f0eaff` | `0x0f0f0f` |
| `portrait_assistant` | `0x1a1218` | `0x1a1218` | dark hood shape covering most of head | one `0xe63946` filled dot (eye) visible on right | `0xe63946` | `#9b1d20` | `0x1a1218` |

After baking all portraits, boot transitions to `Intro` scene.

---

## PHASE 5 — INTRO CUTSCENE (5 PANELS)

Click anywhere to advance. Camera fade between each panel (`cameras.main.fadeOut(300)` then `fadeIn(300)`). All text centered. No skippable animation.

**Panel 1** — BG `#111118`
- `[ HALLOWEEN NIGHT. ]` — `Rajdhani` 18px `#e63946`, centered, y:240
- `Four people are dead.` — `Space Mono` 16px `#f0eaff`, y:278
- `One is not dead yet — but the gate is already open.` — `Space Mono` 16px `#f0eaff`, y:308

**Panel 2** — Draw the Void of Judgement background at alpha 0.6, text on top
- `The Void of Judgement opened.`
- `Someone made sure of that.`
- `It was not an accident.`
All in `Space Mono` 16px `#f0eaff`, centered, stacked with 34px gap.

**Panel 3** — Investigator portrait drawn left side (x:180, y:100, 160×200), text right side
- `I don't have a name that matters here.`
- `What matters is what I find.`
- `And the person in this room who caused all of this.`
All in `Space Mono` 14px `#f0eaff`, right block starting x:400.

**Panel 4** — Draw Mirror Labyrinth background at alpha 0.6, text on top
- `The trail starts in the basement.`
- `It ends in the void.`
- `Let's walk it.`
All in `Space Mono` 16px `#f0eaff`, centered.

**Panel 5** — Title card, full black background
- `THE VOID CASE` — `Rajdhani` 48px `#e63946`, centered, y:200
- `Case File — Halloween Night` — `Space Mono` 14px `#f0eaff`, y:264
- `[ BEGIN INVESTIGATION ]` — button (`makeButton`), centered at y:330, transitions to Game scene

---

## PHASE 6 — BACKGROUNDS (6 ROOMS, Phaser Graphics API)

All backgrounds baked in Boot via `renderTexture` + `saveTexture`. Keys: `bg_basement`, `bg_planetarium`, `bg_labyrinth`, `bg_zerograv`, `bg_void`, `bg_tvstation`. Each 960×600px. Use layered shapes and fine details — these must look atmospheric, not placeholder.

**BG_BASEMENT:**
- Back wall fill `#1e1e28`, stone block grid: vertical lines every 60px + horizontal lines every 40px, `#0f0f15` 1px
- Floor `#1a1a22`, same mortar grid offset
- Three shelving units (rects for uprights + 4 horizontal planks each), various small box shapes on shelves in grey tones `#2a2a38` to `#3a3a48`
- Cut rope: two curved arcs `0x8b7355`, frayed ends as small line clusters (6–8 short radiating lines)
- Knocked-over chair: seat rect, 4 leg lines, back rail — all drawn at ~12° tilt
- Overhead light: small `#f0eaff` rect bulb centered near top, wide downward triangle cone in `#e63946` alpha 0.04, cage lines around bulb

**BG_PLANETARIUM:**
- Background deep navy `#0d0d1a`
- 70 individual star dots scattered with `Math.sin` seed, sizes 1–3px, `#f0eaff` alpha 0.3–0.9
- Floor charcoal `#111118`, subtle 48px tile grid lines
- Three suit display stands: pedestal base rect + narrow column + T-bar shoulders. Two stands have full space suit silhouettes (helmet circle, torso rect, arm rects, leg rects). Third stand empty.
- One space suit lying on floor at ~20° angle — torso rect tilted, limbs displaced
- Left and right wall panel rects with small indicator light shapes

**BG_LABYRINTH:**
- Floor `#1a1a22`
- Full-height vertical lines every 48px `#2a2a35` — mirror panel grid
- Every third panel slightly lighter fill `#1e1e2a`
- Random scatter objects on floor: small rect, circle, triangle in `#4a4a5a` at varied positions
- One center-area floor panel: thin `#e63946` 1px border rect, fill `#1e1820`
- Shoe print pairs: small ovals at 3 different floor positions

**BG_ZEROGRAV:**
- Background clinical grey `#d0d4dc` — this room is brighter than all others
- Large cylindrical chamber center: tall rounded rect `#b0b4bc`, vertical panel detail lines, control port shapes on right side
- Chamber viewport: circular shape with space suit silhouette visible inside
- Overhead light bar: wide flat `#f0eaff` rect at top, soft spread triangle below alpha 0.06
- Floor `#c0c4cc`, subtle grid lines
- Right control panel: rect with 6 small button shapes + 2 indicator rects

**BG_VOID:**
- Background near-black `#0a0008`
- Gate: two tall rect door panels slightly open outward, `#1a0810` fill, `#9b1d20` border with ornate inner line details
- Floor `#0d0006`, thin crack lines radiating from gate base
- Rope arc on floor `0x8b7355`
- Angular shadow shapes in corners `#9b1d20` alpha 0.15
- Thin `#e63946` glow line along gate seam, alpha 0.6
- Wall vertical angular shadow shapes `#0f0006`

**BG_TVSTATION:**
- Background dark grey studio `#131318`
- Camera on tripod: 3 converging leg lines + vertical column + camera body rect with circular lens
- Desk rect `#1e1e28`
- Monitor on desk: stand column + screen rect `#0a0a12` + static pattern (grid of tiny rects at varying alpha)
- Flash drive on desk: thin small rect `#4a4a5a`, connector detail line
- Ceiling lighting bar: horizontal bar with 4 small downward cone shapes
- Back wall: vertical panel lines + 2 framed monitor shapes showing static

---

## PHASE 7 — GAME SCENE STRUCTURE

The `Game` scene is the main investigation shell. It renders:
1. The current location background image
2. All hotspots for that location
3. All NPCs for that location
4. The navigation bar (bottom, always visible)
5. The Assistant portrait (bottom-right, always visible)

**On scene create:**
- Mark `gameState.currentLocation` as visited (add to `visitedLocations` if not present, call `PUT /api/save`)
- Draw background for current location
- Spawn hotspots (diamond shapes)
- Spawn NPCs (portrait thumbnails)
- Build navigation bar
- Build Assistant portrait button

**Location switching:** All transitions use `cameras.main.fadeOut(300)` → update `gameState.currentLocation` → `cameras.main.fadeIn(300)` after restarting the scene.

---

## PHASE 8 — NAVIGATION BAR

Fixed at the bottom of the 960×600 canvas. Height 48px. Y position: 552.

Four tabs: `[ LOCATIONS ]` `[ EVIDENCE ]` `[ SUSPECTS ]` `[ MAP ]`

Each tab:
- Width: 240px
- Active tab: `#e63946` fill, `Rajdhani` 13px `#f0eaff`, 2px `#e63946` top border stripe
- Inactive tab: `#111118` fill, `Rajdhani` 13px `#4a4a5a`, 1px `#4a4a5a` border
- Click switches active state and opens that panel overlay

**LOCATIONS panel:** Slides up as a 960×300 overlay from y:252. Lists all 6 locations as buttons. Each location button shows: name in `Rajdhani` bold, visited indicator (filled `#e63946` circle if visited, empty if not). Click fades to that location.

**EVIDENCE panel:** Horizontal scrollable card row in a 960×200 overlay from y:352. Filter buttons at top: `ALL` `PHYSICAL` `DOCUMENT` `TESTIMONY`. Text input for room search. Cards 120×80px each: `#13131f` fill, 3px left `#e63946` stripe, title `Rajdhani` 11px, type + room `Space Mono` 9px `#4a4a5a`. All filtering is pure frontend JS on `gameState.collectedEvidence`.

**SUSPECTS panel:** See Phase 12.

**MAP panel:** 6 location buttons in a 2×3 grid, same visited indicator dots.

All panels animate in/out with `tweens.add` — never instant show/hide. `× CLOSE` button always visible on each panel, `#e63946` border.

---

## PHASE 9 — HOTSPOTS

Diamond shapes drawn with Phaser Graphics, 16px radius. Color `#e63946`. Four bracket lines at corners (short 45° lines, 8px each).

Pulsing opacity tween:
```javascript
this.tweens.add({
  targets: hotspot,
  alpha: { from: 0.6, to: 1.0 },
  duration: 1200, yoyo: true, repeat: -1
});
```

Click: opens dialogue in the bottom dialogue panel (see Phase 10). If the hotspot has a `collect` field and the evidence isn't already in `gameState.collectedEvidence`, add it and call `PUT /api/save`. If the hotspot has a contradiction trigger condition, check it (see Phase 11).

**All hotspots by location:**

### BASEMENT
| Label | X | Y | Collect | Dialogue |
|---|---|---|---|---|
| THE ROPES | 300 | 480 | ROPES | "Ropes. Cut clean. Whoever was tied here was untied. Not freed. There is a difference." |
| THE KNOCKOUT BOTTLE | 500 | 510 | KNOCKOUT GAS BOTTLE #1 | "Knockout gas. Already used. These come in packs of three. Only three. One bottle here. Two unaccounted for." |
| THE CHAIR | 650 | 420 | — | "Something sat here for a while. The chair faces the room, not the door. Whoever was here could see everything coming and could not stop it." |
| THE OVERHEAD LIGHT | 480 | 180 | — | "This room was not meant to hold a person. Someone improvised. They had exactly what they needed though." |

### PLANETARIUM LOUNGE
| Label | X | Y | Collect | Dialogue |
|---|---|---|---|---|
| THE WET SUIT | 320 | 400 | WET SPACE SUIT | "This suit is wet on the outside. Not sweat. Not rain. Something else. It was used recently and put back on display." |
| THE MISSING SUIT STAND | 580 | 360 | — | "One stand. No suit. A suit is missing from display. It did not walk away on its own." |
| THE WORK NOTICE | 750 | 300 | WORK NOTICE | "Most staff out today for Halloween preparations. That means fewer eyes on the building. Convenient timing." |
| THE BODY | 300 | 470 | STABBING VICTIM'S BODY | "Multiple stab wounds. Back and front. Whoever did this was not in a hurry to stop. He was put into a suit after the fact. There is a lot of blood under the suit." — CONTRADICTION trigger if WET SPACE SUIT already collected |

### MIRROR LABYRINTH
| Label | X | Y | Collect | Dialogue |
|---|---|---|---|---|
| THE OBJECTS ON FLOOR | 250 | 480 | OBJECT TRAIL | "Random objects. Placed deliberately. A trail. Leading somewhere specific. Someone used these as a guide." |
| THE ONE-WAY PANEL | 480 | 430 | ONE-WAY PANEL | "This panel is different from the others. Reflective from above. See-through from below. And there is a hole drilled through it. Knife-sized." — CONTRADICTION trigger if OBJECT TRAIL already collected |
| THE LOWER MAZE ENTRANCE | 480 | 520 | LOWER MAZE | "A whole other maze beneath this one. The panel was covering it. The Drifter is down there. Pushed. No way back up." |
| THE BLOODY SHOE PRINTS | 650 | 460 | — | "Multiple sets of shoe prints. All going different directions. This was a busy floor." |

### ZERO GRAVITY CHAMBER
| Label | X | Y | Collect | Dialogue |
|---|---|---|---|---|
| THE SPACE SUIT IN CHAMBER | 480 | 320 | STRANGULATION VICTIM'S BODY | "The chamber is on. There is someone inside that suit. She is not floating. She is arranged to look like it." |
| THE CHAMBER CONTROLS | 750 | 400 | — | "Switched on manually. Someone wanted this to look like a display. It almost worked." |
| THE SECOND SUIT | 280 | 380 | — | "This suit looks like the one from the Planetarium Lounge. Same model. Same size. They came as a set." |

### VOID OF JUDGEMENT
| Label | X | Y | Collect | Dialogue |
|---|---|---|---|---|
| THE GATE | 480 | 250 | THE GATE | "The gate is open now. It was not open before. Someone planned for it to open at exactly this moment." |
| ROPES ON GROUND | 350 | 500 | BINDING ROPES | "He was tied here. The ropes are still attached to the panel. He could not move even if he woke up." |
| THE SAW | 550 | 490 | RIGGED SAW | "This fell when the gate opened. It was rigged. A battery-powered saw. No outlet needed." |
| MIRROR PANEL | 450 | 460 | VOID PANEL | "Same type as the labyrinth. He was tied to it. Brought here from somewhere else." — CONTRADICTION trigger if ONE-WAY PANEL already collected |

### TV STATION
| Label | X | Y | Collect | Dialogue |
|---|---|---|---|---|
| THE BROADCAST MONITOR | 400 | 320 | BROADCAST RECORDING | "The broadcast played from here. Pre-recorded. Made to look live. Whoever made it knew the studio would be empty." |
| THE FLASH DRIVE | 620 | 400 | FLASH DRIVE | "The video was on this. Someone brought it here and plugged it in. They knew exactly what they were doing." |
| THE ANONYMOUS LETTER | 300 | 450 | ANONYMOUS LETTER | "Told the hosts to film in the plaza. So the studio would be free. No name. Of course." — CONTRADICTION trigger if BROADCAST RECORDING already collected |

---

## PHASE 10 — DIALOGUE PANEL

Slides up from the bottom of the canvas when a hotspot or NPC is clicked. Height 140px. Y start: 600 (off screen), Y end: 460.

**Layout:**
- `#111118` fill, 1px `#4a4a5a` top border
- L-corner accents at all 4 corners in `#e63946` (use `drawAllCornerMarks`)
- Left: 100×120px portrait slot at (10, 10) within panel
- Speaker name: `Rajdhani` 14px `#e63946`, x:120, y:10 within panel
- Dialogue text: `Space Mono` 12px `#f0eaff`, wordWrap width 820px, x:120, y:34 within panel
- Click anywhere on panel or anywhere on screen to advance line
- After final line, click closes panel (slides back down)
- Conditional lines: check `gameState.collectedEvidence` array before showing

**Slide tween:**
```javascript
this.tweens.add({ targets: panelContainer, y: 460, duration: 220, ease: 'Power2' });
```

**NPC dialogue lines:**

**THE OPERATOR (Basement):**
> "I did not agree to help. I was found and used."
> "They asked me about the maze. The void gate. I said what I knew."
> "I did not know what they were planning to do with that information."
> [if BINDING ROPES collected] INVESTIGATOR: "The ropes in the basement were cut clean. Someone helped you out."
→ On completion, collect: THE OPERATOR'S ACCOUNT

**THE OBSERVER (Planetarium Lounge):**
> "I told them where the Operator was. That is all I did."
> "I did not agree with what was being planned."
> "I did not stop it either. That is the part I cannot justify."
> [if BROADCAST RECORDING collected] INVESTIGATOR: "You knew what was coming and said nothing. That is not neutrality. That is a choice."
→ On completion, collect: THE OBSERVER'S ACCOUNT

**THE COURIER (Mirror Labyrinth):**
> "We were invited. There was supposed to be a Halloween trick to see."
> "The objects on the floor — we just followed them. Like we were told to."
> "He crouched on a panel. I was looking around. I was not paying attention."
> "When I turned back he was bleeding. There was nothing sharp in there. Nothing visible."
→ On completion, collect: THE COURIER'S ACCOUNT

**THE DRIFTER (Lower Maze — only accessible after LOWER MAZE is in collectedEvidence):**
> "I got a text. Midnight. Go to the labyrinth."
> "I followed the objects on the ground. Then I was falling."
> "There is a phone down here. A saw drill. Blood on the floor from above."
> "I did not do this. I cannot get out of here on my own."
→ On completion, collect: THE DRIFTER'S ACCOUNT

**THE SCHEDULER (TV Station):**
> "I was here all night. Halloween preparations. Nothing unusual."
> "I did not go near the labyrinth. Or the void. I had things to do here."
> "The broadcast? I saw it same as everyone. Unsettling stuff."
> [if FLASH DRIVE + ANONYMOUS LETTER both collected] INVESTIGATOR: "The drive was in the studio. The letter cleared the studio. You were in the studio. All night."

---

## PHASE 11 — CONTRADICTION SYSTEM

When triggered: a `#e63946` border flash rect overlays the full canvas (alpha 0 → 0.9 → 0, 400ms). Then a centered panel appears:

- `#111118` fill, 2px `#e63946` border
- L-corner accents all 4 corners in `#e63946`
- `// CONTRADICTION` — `Rajdhani` bold 18px `#e63946`, top of panel
- 1px `#e63946` divider line
- Contradiction text — `Space Mono` 13px `#f0eaff`, wrapped
- Click anywhere to dismiss

Add the contradiction ID to `gameState.contradictionsTriggered`. Call `PUT /api/save`.

**6 contradictions:**

**1. WET SPACE SUIT + STABBING VICTIM'S BODY**
> "A suit wet on the outside — used, then returned to display. The victim was placed inside a suit after death. Two suits used. One stand empty. This was prepared in advance."

**2. OBJECT TRAIL + ONE-WAY PANEL**
> "The objects led someone to a specific panel on purpose. That panel had a knife-hole drilled through it. This was not a trap. This was a guided assassination."

**3. ONE-WAY PANEL + VOID PANEL**
> "Same panel type. Two separate locations. One for the stabbing. One for the rigged saw. The same person built both setups."

**4. BROADCAST RECORDING + ANONYMOUS LETTER**
> "The letter cleared the studio before the broadcast. The broadcast played from that same empty studio. The letter writer and the broadcaster are the same person."

**5. KNOCKOUT GAS BOTTLE #1 + KNOCKOUT GAS INFO**
> "Sold only in packs of three. Always exactly three. One in the basement. One in the locker rooms. One elsewhere. Three victims incapacitated. Three bottles. One buyer."

**6. FRAMING PHONE (on collection)**
> "This phone belongs to no one in the group. It is new. Fresh number. But full of texts. It was left here deliberately — to be found."

---

## PHASE 12 — SUSPECT BOARD (SUSPECTS TAB)

Opens as full-canvas overlay from the SUSPECTS nav tab. Background `#111118`. Dot-grid: 1px dots every 32px at `#1a1a25`.

Header: `// SUSPECT BOARD` — `Rajdhani` bold 20px `#f0eaff`
Subtitle: `Space Mono` 10px `#4a4a5a`
`× CLOSE` button top-right, `#e63946` border.

Five suspect cards in a row, centered. Each card: 160×280px, `#13131f` fill, 1px border (color matches that character's portrait border), L-corner accents.

Card contents (top to bottom):
- Number label top-left: `Space Mono` `#4a4a5a`
- Portrait area 160×160px (use baked portrait texture)
- Name `Rajdhani` 14px bold all-caps
- Divider line 1px `#4a4a5a`
- Description `Space Mono` 10px `#4a4a5a`
- `+ PIN EVIDENCE` button bottom, `#e63946` border

| # | Suspect | Description |
|---|---|---|
| 01 | THE SCHEDULER | "Organized. Present all night. Has a very specific skill set." |
| 02 | THE OPERATOR | "Was held captive. Helped regardless. Knows more than they say." |
| 03 | THE OBSERVER | "Knew where the Operator was. Stayed quiet about the rest." |
| 04 | THE COURIER | "Was in the labyrinth. Witnessed the stabbing. Panicked." |
| 05 | THE DRIFTER | "Trapped in the lower maze. Or conveniently placed there." |

**PIN EVIDENCE:** Clicking `+ PIN EVIDENCE` opens a small overlay listing `gameState.collectedEvidence`. Player clicks an item to pin it to this suspect. Pinned items appear as small `#e63946` tags below the description on the card. Store pins in `gameState.pins[suspectId] = [evidenceNames...]`. Call `PUT /api/save`.

---

## PHASE 13 — EVIDENCE DATA

All 25 evidence items. Stored in `gameState.collectedEvidence` as name strings.

| Name | Type | Location |
|---|---|---|
| ROPES | Physical | Basement |
| KNOCKOUT GAS BOTTLE #1 | Physical | Basement |
| KNOCKOUT GAS BOTTLE #2 | Physical | Locker Rooms |
| KNOCKOUT GAS BOTTLE #3 | Physical | Gatekeeper's Room |
| KNOCKOUT GAS INFO | Document | Mall |
| WET SPACE SUIT | Physical | Planetarium Lounge |
| WORK NOTICE | Document | Planetarium Lounge |
| STABBING VICTIM'S BODY | Physical | Planetarium Lounge |
| OBJECT TRAIL | Physical | Mirror Labyrinth |
| ONE-WAY PANEL | Physical | Mirror Labyrinth |
| LOWER MAZE | Physical | Mirror Labyrinth |
| SAW DRILL | Physical | Mirror Labyrinth |
| FRAMING PHONE | Physical | Mirror Labyrinth |
| STRANGULATION VICTIM'S BODY | Physical | Zero Gravity Chamber |
| THE GATE | Physical | Void of Judgement |
| BINDING ROPES | Physical | Void of Judgement |
| RIGGED SAW | Physical | Void of Judgement |
| VOID PANEL | Physical | Void of Judgement |
| BROADCAST RECORDING | Document | TV Station |
| FLASH DRIVE | Physical | TV Station |
| ANONYMOUS LETTER | Document | TV Station |
| THE COURIER'S ACCOUNT | Testimony | Mirror Labyrinth |
| THE DRIFTER'S ACCOUNT | Testimony | Mirror Labyrinth |
| THE OPERATOR'S ACCOUNT | Testimony | Basement |
| THE OBSERVER'S ACCOUNT | Testimony | Various |

> Note: KNOCKOUT GAS BOTTLE #2, #3, KNOCKOUT GAS INFO, SAW DRILL, FRAMING PHONE are not collectable from hotspots in the playable rooms — they appear in the evidence list and are referenced in the trial/contradictions. The FRAMING PHONE contradiction triggers when THE DRIFTER'S ACCOUNT is collected (Drifter mentions it). SAW DRILL is part of the Drifter's testimony. KNOCKOUT GAS BOTTLE #2 and #3 are implied by Knockout Gas Info. These items auto-add to `collectedEvidence` when triggered by the relevant testimony or hotspot.

---

## PHASE 14 — HINT SYSTEM (THE ASSISTANT)

Small 80×100px portrait of THE ASSISTANT drawn in bottom-right of every location scene (x:870, y:490).

Click opens a hint panel that slides in from the right edge: 280px wide, full 600px height, `#0d0d14` fill, 1px `#e63946` left border.

Panel:
- `// THE ASSISTANT` header `Rajdhani` bold `#e63946`
- Scrollable message history in `Space Mono` 11px
- Text input at bottom (DOM element via `scene.add.dom`)
- `[ SEND ]` button

On send: `POST /api/hint` with `{ message: playerInput, location: gameState.currentLocation }`. Display response `reply` in message history in `#e63946`. Player messages in `#f0eaff`. On API failure, show static fallback.

**Static fallbacks by location:**

- **Basement:** "Ropes do not cut themselves." / "Three bottles. Sold only in threes." / "This room held something important."
- **Planetarium:** "A wet suit returned to its stand. Someone knew this room well." / "Two suits. One missing stand." / "The notice tells you who was meant to be absent."
- **Labyrinth:** "The objects are not clutter. They are a path." / "One panel is not like the others." / "The Drifter did not choose to fall."
- **Zero Gravity:** "The chamber was switched on after the fact." / "Both suits came from the same source." / "She could not have arranged herself."
- **Void:** "The saw did not fall by chance." / "The gate opening was the mechanism." / "He was brought here."
- **TV Station:** "The letter emptied the room before anyone arrived." / "Pre-recorded means the opposite of unplanned." / "The drive was left. Someone forgot — or wanted it found."

---

## PHASE 15 — TRIAL PHASE

Triggered automatically when: player has visited all 6 locations AND `gameState.collectedEvidence.length >= 12`. Camera fade to the Trial scene.

**Layout:** Black background. Header `// THE TRIAL` `Rajdhani` bold `#e63946`.

Five statement cards displayed one at a time (advance with click). Each card: centered, 600×120px, `#13131f` fill, 1px `#4a4a5a` border, L-corner accents.

Player has their collected evidence cards displayed as a scrollable row at the bottom (120×60px each). Player drags an evidence card from their hand onto the statement card.

- **Correct drag:** Card border flashes `#e63946`, statement gets strikethrough + `✓` checkmark. Progress: `gameState.trialProgress++`. Call `PUT /api/save`.
- **Wrong drag:** Card bounces back (tween back to start position), brief red flash on statement border.

After all 5 resolved: accusation screen opens automatically via camera fade.

**5 statements + correct evidence:**

| # | Statement | Speaker | Correct Evidence |
|---|---|---|---|
| 1 | "I was held in the basement. I never saw their face." | THE OPERATOR | KNOCKOUT GAS BOTTLE #1 |
| 2 | "There was nothing sharp in the labyrinth." | THE COURIER | ONE-WAY PANEL |
| 3 | "I only told them where the Operator was." | THE OBSERVER | ANONYMOUS LETTER |
| 4 | "I was pushed. I don't know who did it." | THE DRIFTER | FRAMING PHONE |
| 5 | "I was preparing for Halloween all night." | THE SCHEDULER | BROADCAST RECORDING or FLASH DRIVE |

---

## PHASE 16 — ACCUSATION PHASE

Five suspect portrait cards in a row, centered. Each 160×280px with name label. Player drags collected evidence cards onto one suspect portrait.

After dropping at least one evidence card on a suspect: `[ CONFIRM ACCUSATION ]` button appears, centered, `#e63946` border.

On confirm: camera fade to Ending scene. Pass accused suspect ID.

Correct answer: **THE SCHEDULER**

---

## PHASE 17 — ENDINGS

Call `POST /api/complete` with:
```javascript
{ accusedSuspect: suspectId, gotCorrectEnding: boolean, missedClues: [] }
```
Returns `{ recommendations[] }`.

**GOOD ENDING (accused THE SCHEDULER):**
Camera fade to black. Sequential text panels in `Space Mono`, accent lines between each. Full truth reveal:

1. `"The Scheduler planned everything from the start."`
2. `"She got a costume and voice changer — and a new phone — so no one would recognize her."`
3. `"She visited the Observer in disguise. The Observer told her where the Operator was."`
4. `"She knocked out the Operator with the first bottle. She needed the gate key."`
5. `"Malcolm was lured to the Planetarium and stabbed through the floor panel from below."`
6. `"Ada was strangled in her room with the third knockout gas bottle used first. Then stuffed into a suit and staged in the chamber."`
7. `"Petunia was guided by text to crouch on a marked panel. He was stabbed from beneath through the drilled hole. Iwo saw the Operator nearby — a reflection. A distraction."`
8. `"Viste was knocked out in the locker room and bound at the void gate. The saw was rigged to fall when the gate opened."`
9. `"The Drifter was pushed into the lower maze and framed with a phone left behind."`
10. `"The broadcast was pre-recorded. The letter cleared the studio. She stood in it alone and played the video."`
11. `"Four dead. One framed. One gate open. All of it planned."`

Final panel: `[ CASE CLOSED ]` — `Rajdhani` bold 48px `#e63946`, centered.

**BAD ENDING (anyone else):**
> `"The wrong person."`
> `"The real killer watches you leave."`
> `"The gate stays open."`

After either ending: display `recommendations[]` from API response in a scrollable panel (`Space Mono` 12px `#f0eaff`), then `[ PLAY AGAIN ]` button.

---

## PHASE 18 — GAME LOOP RESET

When `[ PLAY AGAIN ]` is pressed:

```javascript
gameState.currentLocation = 'basement';
gameState.collectedEvidence = [];
gameState.visitedLocations = [];
gameState.suspectsTalked = [];
gameState.pins = {};
gameState.contradictionsTriggered = [];
gameState.trialProgress = 0;
gameState.gamePhase = 'intro';
```

Then: `PUT /api/save` with all reset fields. Then: `this.scene.start('Intro')`. **Never use `location.reload()`.**

On every scene start, re-register all `setInteractive()` calls fresh. Never rely on interactive state persisting across scene restarts. All hotspots, NPC triggers, evidence drags, and nav tabs must function correctly on the second and third playthroughs.

---

## PHASE 19 — UI RULES (APPLY EVERYWHERE)

- **No `border-radius`** — all corners sharp
- **No gradients** — flat fills only
- **No drop shadows**
- All panels: 1px `#4a4a5a` outer border minimum
- All major panels: L-corner accents via `drawAllCornerMarks` in `#e63946`
- Active element: 2px `#e63946` top or left border stripe
- Inactive element: 1px `#4a4a5a` border
- All interactive elements call `setInteractive()` fresh on every scene start
- All panel open/close animations use `tweens.add` — never instant show/hide
- All scene transitions use `cameras.main.fadeOut` / `fadeIn` — never instant cuts

---

## OUTPUT

Output one single complete file: `game_void.html`.

- Do not truncate.
- Do not use placeholder comments like "rest of code here."
- Every scene, every hotspot, every line of dialogue, every evidence item, every contradiction, every UI panel must be fully implemented.
- The game loop must work on the second and third playthroughs.
- All `setInteractive()` calls re-registered on every scene create.
