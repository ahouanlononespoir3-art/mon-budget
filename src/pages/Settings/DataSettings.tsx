import { Download, Upload, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  exportAllData,
  exportExpensesCSV,
  importAllData,
} from "../../services/dataExport";
import { clearAllStorage } from "../../services/storage";
import { useBudget } from "../../context/BudgetContext";

export function DataSettings() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { refreshData } = useBudget();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const importFile = async (file: File) => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      importAllData(JSON.parse(await file.text()));
      refreshData();
      setMessage("Import terminé.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import impossible.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    if (busy) return;
    if (!window.confirm("Supprimer toutes les données locales ?")) return;
    setBusy(true);
    clearAllStorage();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Mes données
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Sauvegarde une copie de tes données.
        </p>
      </div>

      <Card
        title="Exporter"
        description="Les fichiers sont générés directement dans ton navigateur."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={exportAllData} disabled={busy}>
            <Download className="mr-2 h-4 w-4" />
            Exporter toutes mes données
          </Button>

          <Button
            variant="secondary"
            onClick={exportExpensesCSV}
            disabled={busy}
          >
            <Download className="mr-2 h-4 w-4" />
            Exporter les dépenses CSV
          </Button>

          <Button variant="secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
            <Upload className="mr-2 h-4 w-4" />
            Importer un export JSON
          </Button>
          <input ref={inputRef} type="file" accept="application/json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file); }} />
        </div>
        {message && <p className="mt-4 text-sm font-medium text-slate-600 dark:text-slate-300">{message}</p>}
      </Card>

      <Card title="Zone sensible" description="Cette action efface toutes les données enregistrées sur cet appareil.">
        <Button variant="danger" onClick={reset} disabled={busy}><RotateCcw className="mr-2 h-4 w-4" />Réinitialiser les données</Button>
      </Card>
    </div>
  );
}