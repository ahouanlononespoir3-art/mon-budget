import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { OnboardingStep } from "../../components/onboarding/OnboardingStep";
import {
  getSettings,
  saveSettings,
  saveExpenses,
  savePlannedExpenses,
  saveRecurringExpenses,
  saveSavingsGoals,
  saveSavingsTransfers,
  setOnboardingCompleted,
} from "../../services/storage";
import type { BudgetSettings, Category, SavingsGoal } from "../../types/finance";
import { createId } from "../../utils/id";
import { getCurrencyLabel } from "../../utils/currency";
import { useBudget } from "../../context/BudgetContext";

interface CategoryDraft {
  draftId: string;
  name: string;
  amount: number;
}

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function todayISODate(): string {
  return toISODate(new Date());
}

export function Onboarding() {
  const navigate = useNavigate();
  const { budgetMonth, updateBudgetMonth, updateCategories, refreshData } = useBudget();

  const currentSettings = getSettings();
  const currencyLabel = getCurrencyLabel(currentSettings.currency).split(" — ")[0];

  const [step, setStep] = useState(1);
  const [monthlyAmount, setMonthlyAmount] = useState(
    currentSettings.usualMonthlyAmount
  );
  const [minimumEndBalance, setMinimumEndBalance] =
    useState(currentSettings.minimumEndBalance);
  const [moneyReceivedDate, setMoneyReceivedDate] = useState(todayISODate());

  const [categoryDrafts, setCategoryDrafts] = useState<CategoryDraft[]>([
    { draftId: createId("draft"), name: "Logement", amount: 0 },
    { draftId: createId("draft"), name: "Alimentation", amount: 0 },
    { draftId: createId("draft"), name: "Transport", amount: 0 },
  ]);

  const [goalName, setGoalName] = useState("");
  const [goalAmount, setGoalAmount] = useState(0);
  const [goalSkipped, setGoalSkipped] = useState(false);

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

  const updateCategoryDraft = (
    draftId: string,
    field: "name" | "amount",
    value: string
  ) => {
    setCategoryDrafts((current) =>
      current.map((draft) =>
        draft.draftId === draftId
          ? {
              ...draft,
              [field]: field === "amount" ? Number(value) : value,
            }
          : draft
      )
    );
  };

  const addCategoryDraft = () => {
    setCategoryDrafts((current) => [
      ...current,
      { draftId: createId("draft"), name: "", amount: 0 },
    ]);
  };

  const removeCategoryDraft = (draftId: string) => {
    setCategoryDrafts((current) =>
      current.filter((draft) => draft.draftId !== draftId)
    );
  };

  const finish = () => {
    const now = new Date().toISOString();

    const safeMonthlyAmount = Math.max(0, Math.round(monthlyAmount));
    const safeMinimumEndBalance = Math.max(0, Math.round(minimumEndBalance));

    const received = new Date(`${moneyReceivedDate}T00:00:00`);
    const dayReceived = Math.min(received.getDate(), 28);
    const cycleEnd = new Date(
      received.getFullYear(),
      received.getMonth() + 1,
      received.getDate() - 1
    );

    const settings: BudgetSettings = {
      ...currentSettings,
      usualMonthlyAmount: safeMonthlyAmount,
      minimumEndBalance: safeMinimumEndBalance,
      firstDayOfBudgetMonth: dayReceived,
      updatedAt: now,
    };
    saveSettings(settings);

    const nextBudget = {
      ...budgetMonth,
      startDate: toISODate(received),
      endDate: toISODate(cycleEnd),
      initialBudget: safeMonthlyAmount,
      carryOver: 0,
      totalBudget: safeMonthlyAmount,
      reservedAmount: 0,
      minimumEndBalance: safeMinimumEndBalance,
      status: "open" as const,
      updatedAt: now,
    };
    updateBudgetMonth(nextBudget);

    const finalCategories: Category[] = categoryDrafts
      .filter((draft) => draft.name.trim().length > 0)
      .map((draft) => ({
        id: createId("category"),
        name: draft.name.trim(),
        active: true,
        monthlyLimit: draft.amount > 0 ? Math.round(draft.amount) : null,
        createdAt: now,
        updatedAt: now,
      }));
    updateCategories(
      finalCategories.length > 0
        ? finalCategories
        : [
            {
              id: createId("category"),
              name: "Divers",
              active: true,
              monthlyLimit: null,
              createdAt: now,
              updatedAt: now,
            },
          ]
    );

    const finalGoals: SavingsGoal[] =
      !goalSkipped && goalName.trim().length > 0 && goalAmount > 0
        ? [
            {
              id: createId("goal"),
              name: goalName.trim(),
              targetAmount: Math.round(goalAmount),
              savedAmount: 0,
              priority: 1,
              status: "active",
              targetDate: null,
              createdAt: now,
              updatedAt: now,
            },
          ]
        : [];
    saveSavingsGoals(finalGoals);

    // Un compte qui vient d'être créé ne doit pas afficher d'anciennes
    // dépenses ou transactions de démonstration.
    saveExpenses([]);
    savePlannedExpenses([]);
    saveRecurringExpenses([]);
    saveSavingsTransfers([]);

    setOnboardingCompleted(true);
    refreshData();
    navigate("/", { replace: true });
  };

  const totalSteps = 6;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white">
            €
          </div>

          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Mon Budget
          </h1>

          <p className="mt-2 text-slate-500 dark:text-slate-400">
            Configurons ton budget en quelques étapes.
          </p>
        </div>

        <div className="mb-6 flex gap-2">
          {Array.from({ length: totalSteps }, (_, index) => index + 1).map((item) => (
            <div
              key={item}
              className={[
                "h-2 flex-1 rounded-full",
                item <= step
                  ? "bg-blue-600"
                  : "bg-slate-200 dark:bg-slate-600",
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
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
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
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 pr-20 text-lg font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {currencyLabel}
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
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
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
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 pr-20 text-lg font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {currencyLabel}
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
              title="Quand as-tu reçu cet argent ?"
              description="Ton mois budgétaire commencera à compter à partir de cette date, et se renouvellera chaque mois à la même date."
            >
              <div>
                <label
                  htmlFor="moneyReceivedDate"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Date de réception
                </label>

                <input
                  id="moneyReceivedDate"
                  type="date"
                  value={moneyReceivedDate}
                  onChange={(event) =>
                    setMoneyReceivedDate(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-lg font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
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
                  onClick={() => setStep(4)}
                >
                  Continuer
                </Button>
              </div>
            </OnboardingStep>
          )}

          {step === 4 && (
            <OnboardingStep
              title="Tes dépenses prévues"
              description="Ajoute les catégories sur lesquelles tu comptes dépenser ce mois-ci, avec le montant prévu pour chacune."
            >
              <div className="space-y-3">
                {categoryDrafts.map((draft) => (
                  <div key={draft.draftId} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Catégorie (ex: Loyer)"
                      value={draft.name}
                      onChange={(event) =>
                        updateCategoryDraft(draft.draftId, "name", event.target.value)
                      }
                      className="flex-1 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />

                    <input
                      type="number"
                      min="0"
                      step="100"
                      placeholder="Montant"
                      value={draft.amount === 0 ? "" : draft.amount}
                      onChange={(event) =>
                        updateCategoryDraft(draft.draftId, "amount", event.target.value)
                      }
                      className="w-28 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-32"
                    />

                    <button
                      type="button"
                      aria-label="Retirer cette catégorie"
                      onClick={() => removeCategoryDraft(draft.draftId)}
                      className="rounded-xl p-2.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="secondary"
                  size="small"
                  onClick={addCategoryDraft}
                >
                  <Plus size={16} className="mr-1" />
                  Ajouter une catégorie
                </Button>
              </div>

              <div className="flex justify-between gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setStep(3)}
                >
                  Retour
                </Button>

                <Button
                  size="large"
                  onClick={() => setStep(5)}
                >
                  Continuer
                </Button>
              </div>
            </OnboardingStep>
          )}

          {step === 5 && (
            <OnboardingStep
              title="Ton premier objectif d'épargne"
              description="Facultatif : tu pourras en ajouter ou en modifier plus tard."
            >
              <div>
                <label
                  htmlFor="goalName"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Nom de l'objectif
                </label>

                <input
                  id="goalName"
                  type="text"
                  placeholder="ex: Ordinateur, voyage, urgence..."
                  value={goalName}
                  onChange={(event) => {
                    setGoalSkipped(false);
                    setGoalName(event.target.value);
                  }}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="goalAmount"
                  className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                >
                  Montant visé
                </label>

                <div className="relative">
                  <input
                    id="goalAmount"
                    type="number"
                    min="0"
                    step="100"
                    value={goalAmount === 0 ? "" : goalAmount}
                    onChange={(event) => {
                      setGoalSkipped(false);
                      setGoalAmount(Number(event.target.value));
                    }}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 pr-20 text-lg font-semibold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500 dark:text-slate-400">
                    {currencyLabel}
                  </span>
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setStep(4)}
                >
                  Retour
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setGoalSkipped(true);
                      setStep(6);
                    }}
                  >
                    Passer cette étape
                  </Button>

                  <Button
                    size="large"
                    onClick={() => setStep(6)}
                  >
                    Continuer
                  </Button>
                </div>
              </div>
            </OnboardingStep>
          )}

          {step === 6 && (
            <OnboardingStep
              title="Tout est prêt"
              description="Tes paramètres de base sont enregistrés. Tu pourras ensuite ajouter tes dépenses et objectifs."
            >
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-900 p-5">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 py-3">
                  <span className="text-slate-600 dark:text-slate-300">
                    Budget mensuel
                  </span>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {monthlyAmount.toLocaleString("fr-FR")} {currencyLabel}
                  </strong>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 py-3">
                  <span className="text-slate-600 dark:text-slate-300">
                    Réserve minimale
                  </span>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {minimumEndBalance.toLocaleString("fr-FR")}{" "}
                    {currencyLabel}
                  </strong>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 py-3">
                  <span className="text-slate-600 dark:text-slate-300">
                    Compte à partir du
                  </span>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {new Date(`${moneyReceivedDate}T00:00:00`).toLocaleDateString("fr-FR")}
                  </strong>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 py-3">
                  <span className="text-slate-600 dark:text-slate-300">
                    Catégories définies
                  </span>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {categoryDrafts.filter((draft) => draft.name.trim().length > 0).length}
                  </strong>
                </div>

                <div className="flex items-center justify-between py-3">
                  <span className="text-slate-600 dark:text-slate-300">
                    Objectif d'épargne
                  </span>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {!goalSkipped && goalName.trim().length > 0 ? goalName.trim() : "Aucun pour l'instant"}
                  </strong>
                </div>
              </div>

              <div className="flex justify-between gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setStep(5)}
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
