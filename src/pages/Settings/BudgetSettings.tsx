import { useState } from "react";
import { Save } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { getSettings, saveSettings } from "../../services/storage";
import type { BudgetSettings } from "../../types/finance";
import { formatMoney } from "../../utils/formatMoney";
import { CURRENCY_OPTIONS } from "../../utils/currency";
import { useBudget } from "../../context/BudgetContext";
import { useTheme } from "../../context/ThemeContext";

export function BudgetSettings() {
  const [settings, setSettings] =
    useState<BudgetSettings>(() => getSettings());

  const [saved, setSaved] = useState(false);
  const { budgetMonth, updateBudgetMonth } = useBudget();
  const { theme, setTheme } = useTheme();

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
      currency: settings.currency,
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
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Budget
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Configure les règles principales de ton budget.
        </p>
      </div>

      <Card title="Paramètres financiers">
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {formatMoney(settings.usualMonthlyAmount)}
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
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
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Devise
            </label>

            <select
              value={settings.currency}
              onChange={(event) =>
                setSettings((current) => ({
                  ...current,
                    currency: event.target.value as BudgetSettings["currency"],
                  updatedAt: new Date().toISOString(),
                }))
              }
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {CURRENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button onClick={save}>
            <Save className="mr-2 h-4 w-4" />
            Enregistrer
          </Button>

          {saved && (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Paramètres enregistrés.
            </p>
          )}
        </div>
      </Card>

      <Card title="Apparence">
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { value: "light" as const, label: "Clair" },
              { value: "dark" as const, label: "Sombre" },
              { value: "system" as const, label: "Système" },
            ]
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTheme(option.value)}
              className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                theme === option.value
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-300"
                  : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 dark:text-slate-500">
          « Système » suit automatiquement le réglage de ton téléphone.
        </p>
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

              <span className="text-sm text-slate-700 dark:text-slate-300">
                {label}
              </span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}