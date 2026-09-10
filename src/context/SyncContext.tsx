import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "./AuthContext";
import { useBudget } from "./BudgetContext";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import {
  clearBusinessLocalData,
  saveCurrentUserCache,
  synchronizeUserData,
  type SyncStatus,
} from "../services/supabaseSync";

interface SyncContextValue {
  status: SyncStatus;
  isOnline: boolean;
  lastSyncAt: string | null;
  error: string | null;
  syncNow: () => Promise<void>;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

export function SyncProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { refreshData } = useBudget();
  const isOnline = useOnlineStatus();
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const previousUserId = useRef<string | null>(null);
  const syncing = useRef(false);

  const syncNow = useCallback(async () => {
    if (!user || authLoading) return;
    if (!isOnline) {
      setStatus("offline");
      return;
    }
    if (syncing.current) return;
    syncing.current = true;
    setStatus("syncing");
    setError(null);
    try {
      const result = await synchronizeUserData(user.id);
      setLastSyncAt(result.snapshot.updatedAt);
      setStatus("synced");
      refreshData();
    } catch (syncError) {
      console.error("Erreur synchronisation Supabase:", syncError);
      setStatus("error");
      setError(syncError instanceof Error ? syncError.message : "Erreur de synchronisation.");
    } finally {
      syncing.current = false;
    }
  }, [user, authLoading, isOnline, refreshData]);

  useEffect(() => {
    if (authLoading) return;
    const currentUserId = user?.id ?? null;
    if (previousUserId.current === currentUserId) return;
    const previousUser = previousUserId.current;
    previousUserId.current = currentUserId;

    async function handleUserChange() {
      if (previousUser) {
        try {
          await saveCurrentUserCache(previousUser);
        } catch (cacheError) {
          console.error("Erreur sauvegarde cache utilisateur:", cacheError);
        }
      }
      if (!currentUserId) {
        await clearBusinessLocalData();
        refreshData();
        setStatus("idle");
        setLastSyncAt(null);
        setError(null);
      } else if (isOnline) {
        await syncNow();
      } else {
        setStatus("offline");
      }
    }

    void handleUserChange();
  }, [user, authLoading, isOnline, refreshData, syncNow]);

  useEffect(() => {
    if (user && isOnline && status === "offline") void syncNow();
  }, [user, isOnline, status, syncNow]);

  useEffect(() => {
    if (!user || !isOnline) return;
    const interval = window.setInterval(() => void syncNow(), 60_000);
    return () => window.clearInterval(interval);
  }, [user, isOnline, syncNow]);

  const value = useMemo(() => ({ status, isOnline, lastSyncAt, error, syncNow }), [status, isOnline, lastSyncAt, error, syncNow]);
  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) throw new Error("useSync doit être utilisé à l'intérieur de SyncProvider.");
  return context;
}
