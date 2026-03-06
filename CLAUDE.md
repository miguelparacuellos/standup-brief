# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Terminal-based daily standup tracker built with TypeScript, React, and [Ink](https://github.com/vadimdemedes/ink) (React for CLIs). Keyboard-driven, zero-friction UI with three persistent sections: Yesterday, Today, Blockers.

## Commands

```bash
npm run dev    # run with tsx (no build step) — use during development
npm run build  # compile TypeScript to dist/
npm start      # run compiled output from dist/
npm link       # install global `standup` CLI command
```

No test framework is currently set up.

## Architecture

**Entry point**: `src/index.tsx` — renders the `<App>` component via Ink's `render()`.

**State management**: All application state lives in `App.tsx` using React hooks (useState, useEffect, useCallback). Key state:
- `data` (StandupData) — yesterday tasks, today tasks, blockers
- `activeSection` — which section has focus
- `focusedIndex` — cursor position within the active section
- `mode` — navigation | input | delete-confirm | move-confirm

**Persistence**: `store.ts` reads/writes `data.json` synchronously on every state change. On startup, runs rollover logic: if `lastWorkingDate` differs from today, moves today→yesterday, resets today, and purges resolved/done blockers.

**Keyboard handling**: `hooks/useKeymap.ts` is a single hook that captures all keyboard input. It is context-sensitive based on the current mode — navigation keys, edit actions, readline-style input bindings (Ctrl+A/E/W/U/K), and confirmation flows are all handled here.

**Components** (`src/components/`):
- `Header.tsx` — date display
- `Section.tsx` — reusable section container (Yesterday/Today/Blockers)
- `Item.tsx` — individual task/blocker row with status icon
- `StatusBar.tsx` — bottom bar showing available keyboard shortcuts
- `Input.tsx` — text input for add/edit modes

## Key Patterns

- **Color constants** are defined at the component level (ACCENT `#4ade80`, DANGER `#f87171`, MUTED `#8a8a9a`, etc.) — not centralized.
- **Status icons**: `○` (todo), `◐` (progress), `●` (done). Status cycles via `s` key.
- **Vi-style navigation**: `j`/`k` for up/down alongside arrow keys.
- **Persist pattern**: state updates that need saving call a `persist()` wrapper that writes to disk via `save()` from store.ts.
- **Stagger-in animation**: sections fade in sequentially on app open (60ms intervals).

## Data Model

```typescript
interface Task { id: string; text: string; createdAt: string; status?: 'todo' | 'progress' | 'done' }
interface Blocker { id: string; text: string; createdAt: string; resolvedAt?: string; status?: Status }
interface StandupData { lastWorkingDate: string; yesterday: Task[]; today: Task[]; blockers: Blocker[] }
```

Data stored in `data.json` at project root (gitignored).
