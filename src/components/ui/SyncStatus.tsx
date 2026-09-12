import {
  CheckCircle2,
  Cloud,
  CloudOff,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";

import { useSync } from "../../context/SyncContext";

export function SyncStatus() {
  const { status, isOnline, lastSyncAt, syncNow } = useSync();

  if (!isOnline) {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
        <CloudOff className="h-4 w-4" />
        <span>Hors ligne</span>
      </div>
    );
  }

  if (status === "syncing") {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
        <LoaderCircle className="h-4 w-4 animate-spin" />
        <span>Synchronisation...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <button
        type="button"
        onClick={() => void syncNow()}
        className="inline-flex items-center gap-2 text-xs text-red-600 dark:text-red-400"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Synchronisation échouée</span>
      </button>
    );
  }

  if (status === "synced") {
    return (
      <div className="inline-flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
        <span>
          Synchronisé
          {lastSyncAt
            ? ` • ${new Date(lastSyncAt).toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : ""}
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
      <Cloud className="h-4 w-4" />
      <span>Prêt</span>
    </div>
  );
}
