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
  pullCloudData,
  pushLocalData,
  saveCurrentUserCache,
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

  // pullNow : recupere les donnees du cloud et les copie dans le stockage local.
  // Utilisee une seule fois, juste apres la connexion (l'appareil local peut etre vide).
  const pullNow = useCallback(async () => {
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
      const snapshot = await pullCloudData(user.id);
      setLastSyncAt(snapshot?.updatedAt ?? new Date().toISOString());
      setStatus("synced");
      refreshData();
    } catch (syncError) {
      console.error("Erreur de recuperation Supabase:", syncError);
      setStatus("error");
      setError(syncError instanceof Error ? syncError.message : "Erreur de synchronisation.");
    } finally {
      syncing.current = false;
    }
  }, [user, authLoading, isOnline, refreshData]);

  // syncNow : envoie les donnees locales actuelles vers le cloud. Utilisee a chaque
  // modification (ajout/edition/suppression) et toutes les 60s. Elle ne reecrit jamais
  // le stockage local : un element supprime localement ne peut donc plus "revenir".
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
      const snapshot = await pushLocalData(user.id);
      setLastSyncAt(snapshot.updatedAt);
      setStatus("synced");
    } catch (syncError) {
      console.error("Erreur synchronisation Supabase:", syncError);
      setStatus("error");
      setError(syncError instanceof Error ? syncError.message : "Erreur de synchronisation.");
    } finally {
      syncing.current = false;
    }
  }, [user, authLoading, isOnline]);

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
        await pullNow();
      } else {
        setStatus("offline");
      }
    }

    void handleUserChange();
  }, [user, authLoading, isOnline, refreshData, pullNow]);

  useEffect(() => {
    if (user && isOnline && status === "offline") void syncNow();
  }, [user, isOnline, status, syncNow]);

  useEffect(() => {
    if (!user || !isOnline) return;
    const interval = window.setInterval(() => void syncNow(), 60_000);
    return () => window.clearInterval(interval);
  }, [user, isOnline, syncNow]);

  useEffect(() => {
    if (!user) return;

    let timeout: number | undefined;

    const handleDataChanged = () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }

      timeout = window.setTimeout(() => {
        void syncNow();
      }, 500);
    };

    window.addEventListener("mon-budget:data-changed", handleDataChanged);

    return () => {
      window.removeEventListener("mon-budget:data-changed", handleDataChanged);
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [user, syncNow]);

  const value = useMemo(() => ({ status, isOnline, lastSyncAt, error, syncNow }), [status, isOnline, lastSyncAt, error, syncNow]);
  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) throw new Error("useSync doit être utilisé à l'intérieur de SyncProvider.");
  return context;
}
