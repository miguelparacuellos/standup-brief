import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export interface Task {
  id: string;
  text: string;
  createdAt: string;
}

export interface Blocker {
  id: string;
  text: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface StandupData {
  lastWorkingDate: string;
  yesterday: Task[];
  today: Task[];
  blockers: Blocker[];
}

const DATA_DIR = path.join(os.homedir(), '.standup');
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
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
}
