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

function getUpdatedAt(value: unknown): number {
  if (!value || typeof value !== "object") return 0;
  const object = value as Record<string, unknown>;
  for (const candidate of [object.updatedAt, object.createdAt, object.closedAt]) {
    if (typeof candidate === "string") {
      const timestamp = new Date(candidate).getTime();
      if (!Number.isNaN(timestamp)) return timestamp;
    }
  }
  return 0;
}

function mergeArrays(localValue: unknown, cloudValue: unknown): unknown[] {
  const localArray = Array.isArray(localValue) ? localValue : [];
  const cloudArray = Array.isArray(cloudValue) ? cloudValue : [];
  const merged = new Map<string, unknown>();

  for (const item of [...cloudArray, ...localArray]) {
    if (!item || typeof item !== "object" || !("id" in item) || typeof (item as { id?: unknown }).id !== "string") continue;
    const id = (item as { id: string }).id;
    const existing = merged.get(id);
    if (!existing || getUpdatedAt(item) >= getUpdatedAt(existing)) merged.set(id, item);
  }

  const withoutIds = [...cloudArray, ...localArray].filter(
    (item) => !(item && typeof item === "object" && "id" in item && typeof (item as { id?: unknown }).id === "string")
  );
  return [...merged.values(), ...withoutIds];
}

function mergeValues(localValue: unknown, cloudValue: unknown): unknown {
  if (Array.isArray(localValue) || Array.isArray(cloudValue)) return mergeArrays(localValue, cloudValue);
  if (localValue && typeof localValue === "object" && cloudValue && typeof cloudValue === "object") {
    if ("updatedAt" in localValue || "updatedAt" in cloudValue) {
      return getUpdatedAt(localValue) >= getUpdatedAt(cloudValue) ? localValue : cloudValue;
    }
  }
  return localValue !== undefined ? localValue : cloudValue;
}

function mergeSnapshots(local: BudgetSnapshot, cloud: BudgetSnapshot): BudgetSnapshot {
  const mergedData: Record<string, unknown> = {};
  for (const key of new Set([...Object.keys(cloud.data), ...Object.keys(local.data)])) {
    mergedData[key] = mergeValues(local.data[key], cloud.data[key]);
  }
  return { version: 1, updatedAt: new Date().toISOString(), data: mergedData };
}

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

export async function synchronizeUserData(userId: string): Promise<{ snapshot: BudgetSnapshot; status: "synced" }> {
  const localSnapshot = readUserSnapshotLocally(userId) ?? createSnapshot();
  const cloudSnapshot = await fetchCloudSnapshot(userId);
  const finalSnapshot = cloudSnapshot ? mergeSnapshots(localSnapshot, cloudSnapshot) : localSnapshot;
  writeLocalData(finalSnapshot.data);
  saveUserSnapshotLocally(userId, finalSnapshot);
  await uploadCloudSnapshot(userId, finalSnapshot);
  return { snapshot: finalSnapshot, status: "synced" };
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
