import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPrompt() {
  const [installEvent, setInstallEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone =
      "standalone" in navigator &&
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    const appleDevice = /iphone|ipad|ipod/i.test(navigator.userAgent);

    setIsInstalled(standalone || iosStandalone);
    setIsIOS(appleDevice && !standalone && !iosStandalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (isInstalled || dismissed || (!installEvent && !isIOS)) {
    return null;
  }

  const install = async () => {
    if (!installEvent) return;

    await installEvent.prompt();
    const choice = await installEvent.userChoice;

    if (choice.outcome === "accepted") {
      setIsInstalled(true);
    }

    setInstallEvent(null);
  };

  return (
    <aside className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-40 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 shadow-xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-96">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-700 text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-slate-100">Installer Mon Budget</p>
          {isIOS ? (
            <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
              Ouvre le menu Partager puis choisis « Sur l'écran d'accueil ».
            </p>
          ) : (
            <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
              Installe l'application sur ton téléphone ou ton ordinateur pour la retrouver rapidement et l'utiliser hors ligne.
            </p>
          )}
          {!isIOS && (
            <button
              type="button"
              onClick={() => void install()}
              className="mt-3 rounded-xl bg-slate-900 dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:hover:bg-slate-600"
            >
              Installer l'application
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Fermer la proposition d'installation"
          className="rounded-lg p-1 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
