import { supabase } from "../lib/supabaseClient";
import { STORAGE_KEYS } from "../utils/storageKeys";

const SYNC_LOCAL_PREFIX = "mon-budget:user:";
const SYNC_LOCAL_SUFFIX = ":snapshot";

export type SyncStatus =
  | "idle"
  | "syncing"
  | "synced"
  | "offline"
  | "error";

export interface BudgetSnapshot {
  version: 1;
  updatedAt: string;
  data: Record<string, unknown>;
}

const SNAPSHOT_KEYS = [
  STORAGE_KEYS.budgetMonth,
  STORAGE_KEYS.categories,
  STORAGE_KEYS.expenses,
  STORAGE_KEYS.plannedExpenses,
  STORAGE_KEYS.recurringExpenses,
  STORAGE_KEYS.savingsGoals,
  STORAGE_KEYS.savingsTransfers,
  STORAGE_KEYS.futurePurchases,
  STORAGE_KEYS.monthlyHistory,
  STORAGE_KEYS.settings,
  STORAGE_KEYS.onboardingCompleted,
] as const;

function getUserSnapshotKey(userId: string) {
  return `${SYNC_LOCAL_PREFIX}${userId}${SYNC_LOCAL_SUFFIX}`;
}

function safeParse(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function readCurrentLocalData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (const key of SNAPSHOT_KEYS) {
    const raw = localStorage.getItem(key);
    if (raw !== null) data[key] = safeParse(raw);
  }
  return data;
}

function writeLocalData(data: Record<string, unknown>) {
  for (const key of SNAPSHOT_KEYS) {
    if (!(key in data)) continue;
    const value = data[key];
    if (value === undefined) {
      localStorage.removeItem(key);
      continue;
    }
    localStorage.setItem(key, JSON.stringify(value));
  }
}

// NOTE : on n'essaie plus de "fusionner" intelligemment les données locales et celles
// du cloud item par item. Cette fusion ne savait pas reconnaitre une suppression
// (un element absent du tableau local revenait toujours de la version cloud), ce qui
// faisait ressusciter les elements supprimes. A la place : pullCloudData() ecrase le
// local avec le cloud (utilise uniquement a la connexion), et pushLocalData() ecrase
// le cloud avec le local (utilise a chaque modification). Un seul appareil actif a la
// fois est considere comme la source de verite.

function createSnapshot(): BudgetSnapshot {
  return { version: 1, updatedAt: new Date().toISOString(), data: readCurrentLocalData() };
}

function saveUserSnapshotLocally(userId: string, snapshot: BudgetSnapshot) {
  localStorage.setItem(getUserSnapshotKey(userId), JSON.stringify(snapshot));
}

function readUserSnapshotLocally(userId: string): BudgetSnapshot | null {
  const raw = localStorage.getItem(getUserSnapshotKey(userId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BudgetSnapshot;
  } catch {
    return null;
  }
}

async function fetchCloudSnapshot(userId: string): Promise<BudgetSnapshot | null> {
  const { data, error } = await supabase.from("app_snapshots").select("payload, updated_at").eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!data?.payload) return null;
  const payload = typeof data.payload === "string" ? JSON.parse(data.payload) : data.payload;
  return payload as BudgetSnapshot;
}

async function uploadCloudSnapshot(userId: string, snapshot: BudgetSnapshot) {
  const { error } = await supabase.from("app_snapshots").upsert({ user_id: userId, payload: snapshot, updated_at: snapshot.updatedAt }, { onConflict: "user_id" });
  if (error) throw error;
}

export async function pullCloudData(userId: string): Promise<BudgetSnapshot | null> {
  const cloudSnapshot = await fetchCloudSnapshot(userId);
  if (!cloudSnapshot) return null;
  writeLocalData(cloudSnapshot.data);
  saveUserSnapshotLocally(userId, cloudSnapshot);
  return cloudSnapshot;
}

export async function pushLocalData(userId: string): Promise<BudgetSnapshot> {
  const snapshot = createSnapshot();
  saveUserSnapshotLocally(userId, snapshot);
  await uploadCloudSnapshot(userId, snapshot);
  return snapshot;
}

export async function saveCurrentUserCache(userId: string) {
  const snapshot = createSnapshot();
  saveUserSnapshotLocally(userId, snapshot);
  return snapshot;
}

export async function clearBusinessLocalData() {
  for (const key of SNAPSHOT_KEYS) localStorage.removeItem(key);
}

export async function restoreUserCache(userId: string) {
  const snapshot = readUserSnapshotLocally(userId);
  if (!snapshot) return false;
  writeLocalData(snapshot.data);
  return true;
}

export function getLastLocalSync(userId: string): string | null {
  return readUserSnapshotLocally(userId)?.updatedAt ?? null;
}
