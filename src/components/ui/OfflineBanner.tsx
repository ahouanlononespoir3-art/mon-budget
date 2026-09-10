import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useOnlineStatus } from "../../hooks/useOnlineStatus";
import { useSync } from "../../context/SyncContext";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { status, syncNow } = useSync();

  if (isOnline && status !== "error") {
    return null;
  }

  if (!isOnline) {
    return (
      <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-center text-xs font-semibold text-white">
        <WifiOff className="h-4 w-4 shrink-0" />
        <span>
          Mode hors ligne — tes données restent disponibles sur cet appareil.
        </span>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 flex items-center justify-center gap-2 bg-red-600 px-4 py-2 text-center text-xs font-semibold text-white">
      <Wifi className="h-4 w-4 shrink-0" />
      <span>La synchronisation a rencontré un problème.</span>
      <button
        type="button"
        onClick={() => void syncNow()}
        className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 hover:bg-white/30"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Réessayer
      </button>
    </div>
  );
}
