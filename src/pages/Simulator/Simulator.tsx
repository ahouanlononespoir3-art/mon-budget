import { useState } from "react";
import {
  Calculator,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useBudget } from "../../context/BudgetContext";
import { calculateSimulation } from "../../core/financialEngine";
import { formatMoney } from "../../utils/formatMoney";
import { getCurrencyLabel, getStoredCurrency } from "../../utils/currency";

export function Simulator() {
  const {
    budgetMonth,
    expenses,
    plannedExpenses,
    savingsTransfers,
  } = useBudget();

  const [amount, setAmount] =
    useState("");

  const [result, setResult] =
    useState<
      ReturnType<typeof calculateSimulation> | null
    >(null);

  const simulate = () => {
    const numericAmount = Math.max(
      0,
      Math.round(Number(amount))
    );

    if (numericAmount <= 0) {
      setResult(null);
      return;
    }

    setResult(
      calculateSimulation(
        budgetMonth,
        expenses,
        plannedExpenses,
        savingsTransfers,
        numericAmount,
        new Date()
      )
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Simulateur
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Vérifie l'impact d'une dépense avant de
          la faire.
        </p>
      </div>

      <Card
        title="Puis-je me permettre cette dépense ?"
        description="Entre le montant de l'achat que tu envisages."
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <input
              type="number"
              min="0"
              step="100"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="100000"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 text-lg font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />

            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
              {getCurrencyLabel(getStoredCurrency()).split(" — ")[0]}
            </span>
          </div>

          <Button
            size="large"
            onClick={simulate}
          >
            <Calculator className="mr-2 h-5 w-5" />
            Simuler
          </Button>
        </div>
      </Card>

      {result && (
        <Card title="Résultat">
          <div className="flex items-center gap-3">
            {result.isAffordable ? (
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
            ) : (
              <ShieldAlert className="h-8 w-8 text-red-600" />
            )}

            <div>
              <p className="font-bold text-slate-900">
                {result.isAffordable
                  ? "Dépense potentiellement supportable"
                  : "Dépense déconseillée"}
              </p>

              <p className="text-sm text-slate-500">
                Niveau de risque :{" "}
                {result.riskLevel}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Solde avant
              </p>

              <p className="mt-1 text-xl font-bold">
                {formatMoney(
                  result.balanceBefore
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Solde après
              </p>

              <p className="mt-1 text-xl font-bold">
                {formatMoney(
                  result.balanceAfter
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Prévision fin de mois
              </p>

              <p className="mt-1 text-xl font-bold">
                {formatMoney(
                  result.forecastEndBalance
                )}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">
                Nouvelle limite quotidienne
              </p>

              <p className="mt-1 text-xl font-bold">
                {formatMoney(
                  result.dailyLimitAfter
                )}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}