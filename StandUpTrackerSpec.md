# Standup Tracker — Claude Code Spec

A terminal-based daily standup tracker built with Node.js, TypeScript, and Ink. Zero friction, beautiful TUI, runs from a single `standup` command.

---

## Overview

A persistent, keyboard-driven terminal UI that tracks three things: what you did yesterday, what you're doing today, and what's blocking you. It auto-rolls over at midnight so your standup is always pre-filled when you open it.

---

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **UI Framework**: Ink (React for CLIs)
- **Storage**: JSON file at `~/.standup/data.json`
- **Entry point**: Global `standup` command via `npm link` or a bin entry in `package.json`

---

## Project Structure

```
standup-tracker/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.tsx          # Entry point, renders <App />
│   ├── App.tsx            # Root component, manages state & rollover logic
│   ├── store.ts           # JSON read/write, data schema, rollover logic
│   ├── components/
│   │   ├── Section.tsx    # Reusable section (Yesterday / Today / Blockers)
│   │   ├── Item.tsx       # Single task or blocker row
│   │   ├── Input.tsx      # Inline add/edit input field
│   │   ├── Header.tsx     # App header with date and day info
│   │   └── StatusBar.tsx  # Bottom keybinding hints
│   └── hooks/
│       └── useKeymap.ts   # Centralized keyboard handling
```

---

## Data Schema

```ts
// ~/.standup/data.json
interface StandupData {
  lastWorkingDate: string;   // ISO date string: "2025-01-31"
  yesterday: Task[];
  today: Task[];
  blockers: Blocker[];
}

interface Task {
  id: string;                // nanoid
  text: string;
  createdAt: string;         // ISO datetime
}

interface Blocker {
  id: string;                // nanoid
  text: string;
  createdAt: string;
  resolvedAt?: string;       // set when resolved, then removed on next load
}
```

---

## Rollover Logic

Runs **on every app open**, before rendering.

```ts
function applyRollover(data: StandupData): StandupData {
  const todayDate = getTodayISO();           // e.g. "2025-02-03"
  const lastDate = data.lastWorkingDate;

  if (todayDate === lastDate) return data;   // Same day, no rollover

  // Rollover: today → yesterday, reset today, carry over unresolved blockers
  return {
    lastWorkingDate: todayDate,
    yesterday: data.today,
    today: [],
    blockers: data.blockers.filter(b => !b.resolvedAt),
  };
}

function getLastWorkingDay(): string {
  // Returns the most recent Mon–Fri date before today
  // Handles weekends: on Monday, returns the previous Friday
  const d = new Date();
  do { d.setDate(d.getDate() - 1); }
  while (d.getDay() === 0 || d.getDay() === 6);
  return d.toISOString().slice(0, 10);
}
```

Key behaviors:
- If today is Monday and `lastWorkingDate` is Friday → rollover triggers correctly (it's a new working day)
- Resolved blockers are purged on rollover, not on resolution — keeps the session clean
- `lastWorkingDate` tracks the **last date the app was opened**, not necessarily a working day — the rollover condition is simply `todayDate !== lastDate`

---

## UI Layout

Full-screen TUI. Three vertical sections, always visible. No routing, no multi-screen.

```
┌─────────────────────────────────────────────┐
│  STANDUP          Monday, Feb 3             │
│  ─────────────────────────────────────────  │
│                                             │
│  ▸ YESTERDAY                                │
│    ✓ Reviewed PR #412                       │
│    ✓ Fixed login redirect bug               │
│                                             │
│  ▸ TODAY                                    │
│  → ✓ Write unit tests for auth module       │  ← focused item
│    ✓ Sync with design on onboarding flow    │
│    + add item...                            │
│                                             │
│  ▸ BLOCKERS                                 │
│    ⚠ Waiting on API keys from DevOps        │
│                                             │
│─────────────────────────────────────────────│
│  ↑↓ navigate · a add · e edit · d delete   │
│  r resolve blocker · q quit                 │
└─────────────────────────────────────────────┘
```

---

## Visual Design

This is the most important part. The UI must feel polished and intentional — zero friction means it can't feel clunky or generic.

### Aesthetic Direction

**Dark, minimal, terminal-native.** Not trying to look like a web app. Leans into the terminal medium with careful use of color, spacing, and unicode characters. Should feel like a tool a developer is proud to have in their workflow.

### Colors (use `chalk` or Ink's `<Text color="">`)

| Role | Color | Usage |
|------|-------|-------|
| Accent | `#4ade80` (green) | Section headers, focused cursor, "add" prompt |
| Muted | `#5a5a6a` (gray) | Keybinding hints, timestamps, secondary text |
| Warning | `#f59e0b` (amber) | Blockers |
| Danger | `#f87171` (red) | Delete confirmation, errors |
| Text | `#e8e6e1` (off-white) | Primary item text |
| Dim | `#3a3a48` | Unfocused sections, dividers |

### Typography & Symbols

Use unicode box-drawing and symbol characters for structure — no ASCII slashes or dashes.

```
Section headers:  ▸ TODAY
Focused item:     → (arrow cursor, colored green)
Normal item:      space (no cursor)
Add prompt:       ＋ add item...  (dimmed, at bottom of section)
Blocker icon:     ⚠
Divider:          ─ (repeated to fill width)
```

### Layout Rules

- Full terminal width, adapt to resize
- Sections separated by a single blank line, no heavy borders
- Each section header is bold + accent color, uppercase
- Items are indented 4 spaces from the left edge
- Focused item has a `→` cursor in accent color replacing the first 2 spaces
- Active input field shows an underline cursor, accent-colored
- Status bar is pinned to the bottom, always visible, very dimmed

### Animations & Micro-interactions

- When an item is added: it fades in (Ink supports this via re-render, use a brief highlight flash on new items — show it in accent color for 300ms then transition to normal)
- When a blocker is resolved: strikethrough text briefly, then the item disappears
- When switching sections: cursor moves smoothly (Ink re-renders fast enough to feel instant)
- On open: header renders first, then sections stagger in with a 50ms delay each (use `useEffect` + `setTimeout`)

---

## Keyboard Navigation

### Navigation Mode (default)

| Key | Action |
|-----|--------|
| `↑` / `k` | Move cursor up |
| `↓` / `j` | Move cursor down |
| `Tab` | Move to next section |
| `Shift+Tab` | Move to previous section |
| `a` | Add item to focused section |
| `e` | Edit focused item |
| `d` | Delete focused item (with brief confirmation) |
| `r` | Resolve focused blocker (only in Blockers section) |
| `q` / `Ctrl+C` | Quit |

### Input Mode (when adding or editing)

| Key | Action |
|-----|--------|
| `Enter` | Confirm and save |
| `Escape` | Cancel, return to navigation |
| Standard text input | Type normally |

### Delete Confirmation

When `d` is pressed, show an inline confirmation on the item row:
```
→ Fix auth bug  [d again to confirm, esc to cancel]
```
Confirm with a second `d`, cancel with `Escape`. This prevents accidental deletes without adding a modal.

---

## Sections Behavior

### Yesterday
- Editable (tasks can be added, edited, deleted)
- Read from `data.yesterday` 
- Changes persist to `data.yesterday` in JSON
- Visually distinct from Today — slightly dimmed text to signal "past"

### Today
- Fully editable
- Changes persist to `data.today` in JSON
- This is the primary working section

### Blockers
- Items persist across rollovers until resolved
- Resolved with `r` — mark `resolvedAt`, then remove on next rollover
- Use amber color for blocker items to make them visually stand out
- When adding a blocker, input placeholder: `describe the blocker...`

---

## Storage

```ts
// store.ts

const DATA_PATH = path.join(os.homedir(), '.standup', 'data.json');

function load(): StandupData {
  if (!fs.existsSync(DATA_PATH)) return defaultData();
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return applyRollover(JSON.parse(raw));
}

function save(data: StandupData): void {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}
```

Writes are synchronous and happen on every state change (tasks are small, this is fine).

---

## package.json Essentials

```json
{
  "name": "standup-tracker",
  "version": "1.0.0",
  "bin": {
    "standup": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.tsx",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "ink": "^4.4.1",
    "react": "^18.2.0",
    "chalk": "^5.3.0",
    "nanoid": "^5.0.4"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "ts-node": "^10.9.0"
  }
}
```

After building, run `npm link` to make `standup` available globally.

---

## Implementation Notes for Claude Code

- Use Ink's `useInput` hook for all keyboard handling — centralize it in `useKeymap.ts` and pass down callbacks
- Use Ink's `useStdout` to get terminal dimensions for responsive layout
- `<Static>` is not needed here — the whole UI re-renders on each state change, which is fine
- Persist to disk on every mutation, not on quit — avoids data loss if the terminal is closed
- The stagger-in animation on open: use a `mounted` state with a `useEffect` that sets section visibility with `setTimeout(fn, i * 60)` for each section index `i`
- Keep components pure where possible — pass data and callbacks down from `App.tsx`, don't read from disk in components
- `nanoid` for task IDs, `new Date().toISOString()` for all timestamps

---

## Setup Instructions to Include in README

```bash
git clone <repo>
cd standup-tracker
npm install
npm run build
npm link

# Now available globally:
standup
```
