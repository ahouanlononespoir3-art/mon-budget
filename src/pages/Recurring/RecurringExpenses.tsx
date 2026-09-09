import {
  CalendarClock,
  Pause,
  Play,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useBudget } from "../../context/BudgetContext";
import type {
  ExpenseFrequency,
} from "../../types/finance";

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

function getToday(): string {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

export function RecurringExpenses() {
  const {
    categories,
    recurringExpenses,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
  } = useBudget();

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [
    name,
    setName,
  ] = useState("");

  const [
    amount,
    setAmount,
  ] = useState("");

  const [
    categoryId,
    setCategoryId,
  ] = useState(
    categories.find(
      (category) => category.active
    )?.id ?? ""
  );

  const [
    frequency,
    setFrequency,
  ] =
    useState<ExpenseFrequency>(
      "monthly"
    );

  const [
    nextDate,
    setNextDate,
  ] = useState(getToday());

  const [
    mandatory,
    setMandatory,
  ] = useState(true);

  const resetForm = () => {
    setName("");
    setAmount("");
    setCategoryId(
      categories.find(
        (category) =>
          category.active
      )?.id ?? ""
    );
    setFrequency("monthly");
    setNextDate(getToday());
    setMandatory(true);
  };

  const handleCreate = () => {
    const numericAmount =
      Number(amount);

    if (
      !name.trim() ||
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount <= 0 ||
      !categoryId ||
      !nextDate
    ) {
      return;
    }

    const now =
      new Date().toISOString();

    addRecurringExpense({
      id: crypto.randomUUID(),
      name: name.trim(),
      amount: Math.round(
        numericAmount
      ),
      categoryId,
      frequency,
      nextDate,
      startDate: nextDate,
      endDate: null,
      mandatory,
      active: true,
      createdAt: now,
      updatedAt: now,
    });

    resetForm();
    setIsFormOpen(false);
  };

  const toggleActive = (
    id: string
  ) => {
    const expense =
      recurringExpenses.find(
        (item) => item.id === id
      );

    if (!expense) {
      return;
    }

    updateRecurringExpense({
      ...expense,
      active: !expense.active,
      updatedAt:
        new Date().toISOString(),
    });
  };

  const remove = (
    id: string
  ) => {
    if (
      window.confirm(
        "Supprimer cette règle de dépense récurrente ?"
      )
    ) {
      deleteRecurringExpense(
        id
      );
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Automatisation
          </p>

          <h1 className="mt-1 text-2xl font-bold">
            Dépenses récurrentes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Configurez les dépenses qui
            reviennent régulièrement.
          </p>
        </div>

        <Button
          onClick={() =>
            setIsFormOpen(
              (value) => !value
            )
          }
        >
          <Plus size={18} />
          Nouvelle règle
        </Button>
      </header>

      <Card className="border-blue-200 bg-blue-50">
        <div className="flex items-start gap-3">
          <CalendarClock
            className="mt-0.5 text-blue-600"
            size={22}
          />

          <div>
            <p className="font-semibold text-blue-900">
              Règle ≠ dépense payée
            </p>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              Une dépense récurrente sert à
              prévoir une dépense. Elle ne sera
              jamais automatiquement considérée
              comme une dépense réellement payée.
            </p>
          </div>
        </div>
      </Card>

      {isFormOpen && (
        <Card>
          <h2 className="text-lg font-bold">
            Nouvelle dépense récurrente
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold">
                Nom
              </label>

              <input
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="Ex. Internet"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Montant
              </label>

              <input
                type="number"
                min="1"
                value={amount}
                onChange={(event) =>
                  setAmount(
                    event.target.value
                  )
                }
                placeholder="10000"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Catégorie
              </label>

              <select
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                {categories
                  .filter(
                    (category) =>
                      category.active
                  )
                  .map(
                    (category) => (
                      <option
                        key={
                          category.id
                        }
                        value={
                          category.id
                        }
                      >
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">
                Fréquence
              </label>

              <select
                value={frequency}
                onChange={(event) =>
                  setFrequency(
                    event.target
                      .value as ExpenseFrequency
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <option value="daily">
                  Tous les jours
                </option>
                <option value="weekly">
                  Toutes les semaines
                </option>
                <option value="monthly">
                  Tous les mois
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">
                Prochaine date
              </label>

              <input
                type="date"
                value={nextDate}
                onChange={(event) =>
                  setNextDate(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3"
              />
            </div>

            <label className="flex items-center gap-3 self-end rounded-xl bg-slate-50 p-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={mandatory}
                onChange={(event) =>
                  setMandatory(
                    event.target
                      .checked
                  )
                }
              />

              Dépense obligatoire
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                setIsFormOpen(false);
              }}
            >
              Annuler
            </Button>

            <Button
              onClick={
                handleCreate
              }
            >
              Enregistrer
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {recurringExpenses.length ===
        0 ? (
          <Card className="py-12 text-center">
            <CalendarClock
              size={36}
              className="mx-auto text-slate-400"
            />

            <p className="mt-4 font-semibold">
              Aucune règle récurrente
            </p>
          </Card>
        ) : (
          recurringExpenses.map(
            (expense) => {
              const category =
                categories.find(
                  (item) =>
                    item.id ===
                    expense.categoryId
                );

              return (
                <Card
                  key={expense.id}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">
                          {
                            expense.name
                          }
                        </h2>

                        {expense.mandatory && (
                          <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                            Obligatoire
                          </span>
                        )}

                        {!expense.active && (
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                            Inactive
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {category?.name ??
                          "Sans catégorie"}{" "}
                        ·{" "}
                        {expense.frequency}{" "}
                        · prochaine date{" "}
                        {
                          expense.nextDate
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <p className="font-bold">
                        {formatMoney(
                          expense.amount
                        )}{" "}
                        FCFA
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          toggleActive(
                            expense.id
                          )
                        }
                        className="rounded-xl p-2 text-slate-500 hover:bg-slate-100"
                        aria-label={
                          expense.active
                            ? "Désactiver"
                            : "Activer"
                        }
                      >
                        {expense.active ? (
                          <Pause
                            size={18}
                          />
                        ) : (
                          <Play
                            size={18}
                          />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          remove(
                            expense.id
                          )
                        }
                        className="rounded-xl p-2 text-red-500 hover:bg-red-50"
                        aria-label="Supprimer"
                      >
                        <Trash2
                          size={18}
                        />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            }
          )
        )}
      </div>
    </div>
  );
}