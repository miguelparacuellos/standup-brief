import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type Status = 'todo' | 'progress' | 'done';

export interface Task {
  id: string;
  text: string;
  createdAt: string;
  status?: Status;
}

export interface Blocker {
  id: string;
  text: string;
  createdAt: string;
  resolvedAt?: string;
  status?: Status;
}

export interface StandupData {
  lastWorkingDate: string;
  yesterday: Task[];
  today: Task[];
  blockers: Blocker[];
}

const DATA_DIR = path.join(__dirname, '..');
const DATA_PATH = path.join(DATA_DIR, 'data.json');

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function defaultData(): StandupData {
  return {
    lastWorkingDate: getTodayISO(),
    yesterday: [],
    today: [],
    blockers: [],
  };
}

function applyRollover(data: StandupData): StandupData {
  const todayDate = getTodayISO();
  const lastDate = data.lastWorkingDate;

  if (todayDate === lastDate) return data;

  return {
    lastWorkingDate: todayDate,
    yesterday: data.today,
    today: [],
    blockers: data.blockers.filter(b => !b.resolvedAt),
  };
}

export function load(): StandupData {
  if (!fs.existsSync(DATA_PATH)) return defaultData();
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return applyRollover(JSON.parse(raw) as StandupData);
}

export function save(data: StandupData): void {
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}
