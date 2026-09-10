import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { OnboardingStep } from "../../components/onboarding/OnboardingStep";
import {
  getSettings,
  saveSettings,
  setOnboardingCompleted,
} from "../../services/storage";
import type { BudgetSettings } from "../../types/finance";
import { getCurrencyLabel } from "../../utils/currency";
import { useBudget } from "../../context/BudgetContext";

export function Onboarding() {
  const navigate = useNavigate();
  const { budgetMonth, updateBudgetMonth } = useBudget();

  const currentSettings = getSettings();

  const [step, setStep] = useState(1);
  const [monthlyAmount, setMonthlyAmount] = useState(
    currentSettings.usualMonthlyAmount
  );
  const [minimumEndBalance, setMinimumEndBalance] =
    useState(currentSettings.minimumEndBalance);

  const saveAndContinue = () => {
    const settings: BudgetSettings = {
      ...currentSettings,
      usualMonthlyAmount: Math.max(
        0,
        Math.round(monthlyAmount)
      ),
      minimumEndBalance: Math.max(
        0,
        Math.round(minimumEndBalance)
      ),
      updatedAt: new Date().toISOString(),
    };

    saveSettings(settings);
  };

  const finish = () => {
    saveAndContinue();
    const nextBudget = {
      ...budgetMonth,
      initialBudget: Math.max(0, Math.round(monthlyAmount)),
      minimumEndBalance: Math.max(0, Math.round(minimumEndBalance)),
      totalBudget:
        Math.max(0, Math.round(monthlyAmount)) +
        Math.max(0, budgetMonth.carryOver),
      updatedAt: new Date().toISOString(),
    };
    updateBudgetMonth(nextBudget);
    setOnboardingCompleted(true);
    navigate("/", { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
            €
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            Mon Budget
          </h1>

          <p className="mt-2 text-slate-500">
            Configurons ton budget en quelques étapes.
          </p>
        </div>

        <div className="mb-6 flex gap-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className={[
                "h-2 flex-1 rounded-full",
                item <= step
                  ? "bg-blue-600"
                  : "bg-slate-200",
              ].join(" ")}
            />
          ))}
        </div>

        <Card>
          {step === 1 && (
            <OnboardingStep
              title="Combien peux-tu dépenser ce mois-ci ?"
              description="Indique ton budget mensuel disponible."
            >
              <div>
                <label
                  htmlFor="monthlyAmount"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Montant mensuel
                </label>

                <div className="relative">
                  <input
                    id="monthlyAmount"
                    type="number"
                    min="0"
                    step="100"
                    value={monthlyAmount}
                    onChange={(event) =>
                      setMonthlyAmount(
                        Number(event.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-lg font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    {getCurrencyLabel(currentSettings.currency).split(" — ")[0]}
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  size="large"
                  onClick={() => {
                    saveAndContinue();
                    setStep(2);
                  }}
                >
                  Continuer
                </Button>
              </div>
            </OnboardingStep>
          )}

          {step === 2 && (
            <OnboardingStep
              title="Quelle somme veux-tu préserver ?"
              description="Cette somme sera protégée dans les calculs du budget."
            >
              <div>
                <label
                  htmlFor="minimumEndBalance"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Solde minimum souhaité en fin de mois
                </label>

                <div className="relative">
                  <input
                    id="minimumEndBalance"
                    type="number"
                    min="0"
                    step="100"
                    value={minimumEndBalance}
                    onChange={(event) =>
                      setMinimumEndBalance(
                        Number(event.target.value)
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-20 text-lg font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    {getCurrencyLabel(currentSettings.currency).split(" — ")[0]}
                  </span>
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setStep(1)}
                >
                  Retour
                </Button>

                <Button
                  size="large"
                  onClick={() => {
                    saveAndContinue();
                    setStep(3);
                  }}
                >
                  Continuer
                </Button>
              </div>
            </OnboardingStep>
          )}

          {step === 3 && (
            <OnboardingStep
              title="Tout est prêt"
              description="Tes paramètres de base sont enregistrés. Tu pourras ensuite ajouter tes dépenses et objectifs."
            >
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-center justify-between border-b border-slate-200 py-3">
                  <span className="text-slate-600">
                    Budget mensuel
                  </span>
                  <strong className="text-slate-900">
                    {monthlyAmount.toLocaleString("fr-FR")} {getCurrencyLabel(currentSettings.currency).split(" — ")[0]}
                  </strong>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-600">
                    Réserve minimale
                  </span>
                  <strong className="text-slate-900">
                    {minimumEndBalance.toLocaleString(
                      "fr-FR"
                    )}{" "}
                    {getCurrencyLabel(currentSettings.currency).split(" — ")[0]}
                  </strong>
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setStep(2)}
                >
                  Retour
                </Button>

                <Button
                  size="large"
                  onClick={finish}
                >
                  Commencer
                </Button>
              </div>
            </OnboardingStep>
          )}
        </Card>
      </div>
    </main>
  );
}