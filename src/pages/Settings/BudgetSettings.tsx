import { useState } from "react";
import { Save } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { getSettings, saveSettings } from "../../services/storage";
import type { BudgetSettings } from "../../types/finance";
import { formatMoney } from "../../utils/formatMoney";
import { useBudget } from "../../context/BudgetContext";

export function BudgetSettings() {
  const [settings, setSettings] =
    useState<BudgetSettings>(() => getSettings());

  const [saved, setSaved] = useState(false);
  const { budgetMonth, updateBudgetMonth } = useBudget();

  const updateNumber = (
    field:
      | "usualMonthlyAmount"
      | "firstDayOfBudgetMonth"
      | "minimumEndBalance",
    value: string
  ) => {
    setSettings((current) => ({
      ...current,
      [field]: Math.max(0, Math.round(Number(value))),
      updatedAt: new Date().toISOString(),
    }));
  };

  const save = () => {
    saveSettings({
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    updateBudgetMonth({
      ...budgetMonth,
      initialBudget: settings.usualMonthlyAmount,
      minimumEndBalance: settings.minimumEndBalance,
      totalBudget: settings.usualMonthlyAmount + budgetMonth.carryOver,
      updatedAt: new Date().toISOString(),
    });

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Budget
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure les règles principales de ton budget.
        </p>
      </div>

      <Card title="Paramètres financiers">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Budget mensuel habituel
            </label>

            <input
              type="number"
              min="0"
              step="100"
              value={settings.usualMonthlyAmount}
              onChange={(event) =>
                updateNumber(
                  "usualMonthlyAmount",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-slate-400">
              {formatMoney(settings.usualMonthlyAmount)}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Premier jour du mois budgétaire
            </label>

            <input
              type="number"
              min="1"
              max="28"
              value={settings.firstDayOfBudgetMonth}
              onChange={(event) =>
                updateNumber(
                  "firstDayOfBudgetMonth",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Réserve minimale de fin de mois
            </label>

            <input
              type="number"
              min="0"
              step="100"
              value={settings.minimumEndBalance}
              onChange={(event) =>
                updateNumber(
                  "minimumEndBalance",
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Devise
            </label>

            <select
              value={settings.currency}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                  currency: event.target.value as "XOF",
                  updatedAt: new Date().toISOString(),
                }))
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="XOF">
                XOF — FCFA
              </option>
            </select>
          </div>

          <Button onClick={save}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>

          {saved && (
            <p className="text-sm font-medium text-emerald-600">
              Paramètres enregistrés.
            </p>
          )}
        </div>
      </Card>

      <Card title="Alertes">
        <div className="space-y-4">
          {[
            ["alertsEnabled", "Activer les alertes"],
            ["alertAt80Percent", "Alerte à 80 % du budget"],
            [
              "alertAboveWeeklyAverage",
              "Alerte au-dessus de la moyenne hebdomadaire",
            ],
            [
              "alertBelowPlan",
              "Alerte lorsque les dépenses dépassent le plan",
            ],
            [
              "alertSavedMoreThanExpected",
              "Alerte lorsque j'épargne plus que prévu",
            ],
            [
              "alertOverspendingRisk",
              "Alerte en cas de risque de dépassement",
            ],
          ].map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3"
            >
              <input
                type="checkbox"
                checked={
                  settings[key as keyof BudgetSettings] as boolean
                }
                onChange={(event) =>
                  setSettings((current) => ({
                    ...current,
                    [key]: event.target.checked,
                    updatedAt: new Date().toISOString(),
                  }))
                }
                className="h-4 w-4"
              />

              <span className="text-sm text-slate-700">
                {label}
              </span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}