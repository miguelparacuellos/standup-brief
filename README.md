# standup

A terminal-based daily standup tracker. Zero friction, keyboard-driven, always up to date.

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
│  → ✓ Write unit tests for auth module       │
│    ✓ Sync with design on onboarding flow    │
│    ＋ add item...                            │
│                                             │
│  ▸ BLOCKERS                                 │
│    ⚠ Waiting on API keys from DevOps        │
│                                             │
│─────────────────────────────────────────────│
│  ↑↓ navigate · a add · e edit · d delete   │
│  r resolve blocker · q quit                 │
└─────────────────────────────────────────────┘
```

## Features

- **Three sections**: Yesterday, Today, Blockers — always visible, no routing
- **Auto-rollover**: On each open, if it's a new day, today's tasks move to yesterday and the list resets
- **Persistent blockers**: Carry over across days until resolved with `r`
- **Keyboard-only**: Navigate, add, edit, delete, and resolve without leaving the terminal
- **Stagger-in animation**: Sections fade in sequentially on open

## Setup

```bash
git clone <repo>
cd standup-brief
npm install
npm run build
npm link
```

Then run from anywhere:

```bash
standup
```

## Development

```bash
npm run dev    # run with tsx (no build step)
npm run build  # compile to dist/
npm start      # run compiled output
```

## Keyboard Shortcuts

### Navigation mode

| Key | Action |
|-----|--------|
| `↑` / `k` | Move cursor up |
| `↓` / `j` | Move cursor down |
| `Tab` | Next section |
| `Shift+Tab` | Previous section |
| `a` | Add item to focused section |
| `e` | Edit focused item |
| `d` | Delete focused item (confirm with second `d`) |
| `r` | Resolve focused blocker |
| `q` / `Ctrl+C` | Quit |

### Input mode

| Key | Action |
|-----|--------|
| `Enter` | Confirm and save |
| `Escape` | Cancel |

### Delete confirmation

Pressing `d` shows an inline prompt on the item row. Press `d` again to confirm or `Escape` to cancel.

## Data

Tasks are stored in `data.json` in the project directory. The file is written on every change — no data is lost if the terminal is closed.

```ts
interface StandupData {
  lastWorkingDate: string;  // ISO date: "2025-01-31"
  yesterday: Task[];
  today: Task[];
  blockers: Blocker[];
}
```

Rollover runs on every open: if `lastWorkingDate` differs from today, `today` moves to `yesterday`, `today` resets, and resolved blockers are purged.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **UI**: [Ink](https://github.com/vadimdemedes/ink) (React for CLIs)
- **Dev runner**: [tsx](https://github.com/privatenumber/tsx)
