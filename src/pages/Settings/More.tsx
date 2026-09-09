import {
  CalendarDays,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { Card } from "../../components/ui/Card";

export function More() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-slate-500">
          Application
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Plus
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Accédez aux autres fonctionnalités.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CalendarDays className="text-slate-600" size={24} />

          <h2 className="mt-4 font-semibold">
            Calendrier
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Consultez vos dépenses prévues et réelles.
          </p>
        </Card>

        <Card>
          <Settings className="text-slate-600" size={24} />

          <h2 className="mt-4 font-semibold">
            Paramètres
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Configurez votre application.
          </p>
        </Card>

        <Card>
          <ShieldCheck className="text-slate-600" size={24} />

          <h2 className="mt-4 font-semibold">
            Confidentialité
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Vos données budgétaires resteront privées.
          </p>
        </Card>
      </div>
    </div>
  );
}