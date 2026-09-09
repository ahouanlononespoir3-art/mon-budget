import {
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useBudget } from "../../context/BudgetContext";

function formatMoney(
  amount: number
): string {
  return new Intl.NumberFormat(
    "fr-FR",
    {
      maximumFractionDigits: 0,
    }
  ).format(Math.round(amount));
}

export function Goals() {
  const {
    budgetMonth,
    savingsGoals,
    addSavingsTransfer,
  } = useBudget();

  const [selectedGoal, setSelectedGoal] =
    useState<string | null>(null);

  const [amount, setAmount] =
    useState("");

  const activeGoals =
    savingsGoals
      .filter(
        (goal) =>
          goal.status === "active"
      )
      .sort(
        (a, b) =>
          a.priority - b.priority
      );

  const handleAddSavings = () => {
    if (!selectedGoal) {
      return;
    }

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      return;
    }

    const goal =
      savingsGoals.find(
        (item) =>
          item.id === selectedGoal
      );

    if (!goal) {
      return;
    }

    const remaining =
      Math.max(
        0,
        goal.targetAmount -
          goal.savedAmount
      );

    const amountToAdd =
      Math.min(
        Math.round(
          numericAmount
        ),
        remaining
      );

    if (amountToAdd <= 0) {
      return;
    }

    const now =
      new Date().toISOString();

    addSavingsTransfer({
      id: crypto.randomUUID(),
      budgetMonthId:
        budgetMonth.id,
      goalId: goal.id,
      amount: amountToAdd,
      date: new Date()
        .toISOString()
        .slice(0, 10),
      note:
        "Épargne ajoutée depuis les objectifs",
      createdAt: now,
    });

    setAmount("");
    setSelectedGoal(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-slate-500">
          Épargne
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Objectifs
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Transformez vos projets en objectifs
          d'épargne concrets.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <Target className="text-slate-600" />

          <p className="mt-4 text-sm text-slate-500">
            Objectifs actifs
          </p>

          <p className="mt-1 text-2xl font-bold">
            {activeGoals.length}
          </p>
        </Card>

        <Card>
          <TrendingUp className="text-slate-600" />

          <p className="mt-4 text-sm text-slate-500">
            Total épargné
          </p>

          <p className="mt-1 text-2xl font-bold">
            {formatMoney(
              activeGoals.reduce(
                (total, goal) =>
                  total +
                  goal.savedAmount,
                0
              )
            )}{" "}
            FCFA
          </p>
        </Card>

        <Card>
          <Target className="text-slate-600" />

          <p className="mt-4 text-sm text-slate-500">
            Montant cible
          </p>

          <p className="mt-1 text-2xl font-bold">
            {formatMoney(
              activeGoals.reduce(
                (total, goal) =>
                  total +
                  goal.targetAmount,
                0
              )
            )}{" "}
            FCFA
          </p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {activeGoals.map(
          (goal) => {
            const progress =
              goal.targetAmount >
              0
                ? Math.min(
                    100,
                    (goal.savedAmount /
                      goal.targetAmount) *
                      100
                  )
                : 0;

            const remaining =
              Math.max(
                0,
                goal.targetAmount -
                  goal.savedAmount
              );

            return (
              <Card
                key={goal.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Priorité{" "}
                      {goal.priority}
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-900">
                      {goal.name}
                    </h2>
                  </div>

                  <span className="text-lg font-bold">
                    {Math.round(
                      progress
                    )}
                    %
                  </span>
                </div>

                <div className="mt-5">
                  <ProgressBar
                    value={
                      progress
                    }
                  />
                </div>

                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-slate-500">
                    {formatMoney(
                      goal.savedAmount
                    )}{" "}
                    FCFA
                  </span>

                  <span className="font-semibold">
                    {formatMoney(
                      goal.targetAmount
                    )}{" "}
                    FCFA
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                  Il reste{" "}
                  <strong className="text-slate-900">
                    {formatMoney(
                      remaining
                    )}{" "}
                    FCFA
                  </strong>{" "}
                  à épargner.
                </div>

                <Button
                  className="mt-5 w-full"
                  variant="secondary"
                  onClick={() =>
                    setSelectedGoal(
                      goal.id
                    )
                  }
                >
                  <Plus size={17} />
                  Ajouter une épargne
                </Button>
              </Card>
            );
          }
        )}
      </div>

      {activeGoals.length ===
        0 && (
        <Card className="py-12 text-center">
          <Target
            size={36}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-4 font-semibold">
            Aucun objectif actif
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Aucun objectif actif n'est
            actuellement disponible.
          </p>
        </Card>
      )}

      {selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <Card className="w-full max-w-md">
            <h2 className="text-xl font-bold">
              Ajouter une épargne
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Indiquez le montant que vous
              souhaitez ajouter à cet objectif.
            </p>

            <div className="mt-5">
              <label
                htmlFor="goal-saving"
                className="text-sm font-semibold"
              >
                Montant
              </label>

              <div className="mt-2 flex rounded-xl border border-slate-200 px-4">
                <input
                  id="goal-saving"
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value
                    )
                  }
                  className="w-full py-3 outline-none"
                  placeholder="Ex. 10000"
                />

                <span className="py-3 text-sm font-semibold text-slate-500">
                  FCFA
                </span>
              </div>
            </div>

            <div className="mt-5 flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setSelectedGoal(
                    null
                  );
                  setAmount("");
                }}
              >
                Annuler
              </Button>

              <Button
                className="flex-1"
                onClick={
                  handleAddSavings
                }
              >
                Épargner
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}