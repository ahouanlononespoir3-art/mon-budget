import { useMemo, useState } from "react";
import { Plus, Trash2, Power, PowerOff } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useBudget } from "../../context/BudgetContext";
import type {
  ExpenseFrequency,
  RecurringExpense,
} from "../../types/finance";
import { formatMoney } from "../../utils/formatMoney";
import { createId } from "../../utils/id";

const frequencyLabels: Record<ExpenseFrequency, string> = {
  daily: "Chaque jour",
  weekly: "Chaque semaine",
  monthly: "Chaque mois",
  custom: "Personnalisée",
};

export function RecurringExpenses() {
  const {
    recurringExpenses,
    categories,
    addRecurringExpense,
    updateRecurringExpense,
    deleteRecurringExpense,
  } = useBudget();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(
    categories[0]?.id ?? ""
  );
  const [frequency, setFrequency] =
    useState<ExpenseFrequency>("monthly");
  const [nextDate, setNextDate] = useState("");
  const [mandatory, setMandatory] = useState(true);
  const [note, setNote] = useState("");

  const activeExpenses = useMemo(
    () =>
      recurringExpenses.filter(
        (expense) => expense.active
      ),
    [recurringExpenses]
  );

  const inactiveExpenses = useMemo(
    () =>
      recurringExpenses.filter(
        (expense) => !expense.active
      ),
    [recurringExpenses]
  );

  const resetForm = () => {
    setName("");
    setAmount("");
    setCategoryId(categories[0]?.id ?? "");
    setFrequency("monthly");
    setNextDate("");
    setMandatory(true);
    setNote("");
  };

  const handleSubmit = () => {
    const numericAmount = Math.round(Number(amount));

    if (
      !name.trim() ||
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0 ||
      !categoryId ||
      !nextDate
    ) {
      return;
    }

    const now = new Date().toISOString();

    const recurringExpense: RecurringExpense = {
      id: createId("recurring"),
      name: name.trim(),
      amount: numericAmount,
      categoryId,
      frequency,
      nextDate,
      startDate: nextDate,
      mandatory,
      active: true,
      note: note.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };

    addRecurringExpense(recurringExpense);

    resetForm();
    setShowForm(false);
  };

  const getCategoryName = (id: string) =>
    categories.find(
      (category) => category.id === id
    )?.name ?? "Sans catégorie";

  const toggleRecurringExpense = (
    expense: RecurringExpense,
    active: boolean
  ) => {
    updateRecurringExpense({
      ...expense,
      active,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteRecurring = (expense: RecurringExpense) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer "${expense.name}" ? Les dépenses déjà planifiées à partir de cette règle ne seront pas supprimées.`
    );
    if (confirmed) {
      deleteRecurringExpense(expense.id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Dépenses récurrentes
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Automatise tes dépenses régulières.
          </p>
        </div>

        <Button
          onClick={() => setShowForm((value) => !value)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Ajouter
        </Button>
      </div>

      {showForm && (
        <Card
          title="Nouvelle dépense récurrente"
          description="Cette règle générera des dépenses prévues."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="recurring-name"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Nom
              </label>

              <input
                id="recurring-name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Ex. Loyer"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="recurring-amount"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Montant
              </label>

              <input
                id="recurring-amount"
                type="number"
                min="0"
                step="100"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="50000"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="recurring-category"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Catégorie
              </label>

              <select
                id="recurring-category"
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="recurring-frequency"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Fréquence
              </label>

              <select
                id="recurring-frequency"
                value={frequency}
                onChange={(event) =>
                  setFrequency(
                    event.target.value as ExpenseFrequency
                  )
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {Object.entries(frequencyLabels).map(
                  ([value, label]) => (
                    <option
                      key={value}
                      value={value}
                    >
                      {label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="recurring-next-date"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Prochaine date
              </label>

              <input
                id="recurring-next-date"
                type="date"
                value={nextDate}
                onChange={(event) =>
                  setNextDate(event.target.value)
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="recurring-note"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Note
              </label>

              <input
                id="recurring-note"
                value={note}
                onChange={(event) =>
                  setNote(event.target.value)
                }
                placeholder="Optionnel"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={mandatory}
              onChange={(event) =>
                setMandatory(event.target.checked)
              }
              className="h-4 w-4"
            />

            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Dépense obligatoire
            </span>
          </label>

          <div className="mt-5 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Annuler
            </Button>

            <Button onClick={handleSubmit}>
              Enregistrer
            </Button>
          </div>
        </Card>
      )}

      <Card
        title={`${activeExpenses.length} règle${
          activeExpenses.length > 1 ? "s" : ""
        } active${
          activeExpenses.length > 1 ? "s" : ""
        }`}
      >
        {activeExpenses.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Aucune dépense récurrente active.
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {activeExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {expense.name}
                    </h3>

                    {expense.mandatory && (
                      <span className="rounded-full bg-red-50 dark:bg-red-950 px-2 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
                        Obligatoire
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {getCategoryName(
                      expense.categoryId
                    )}{" "}
                    ·{" "}
                    {frequencyLabels[expense.frequency]}
                  </p>

                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Prochaine échéance :{" "}
                    {expense.nextDate}
                  </p>

                  {expense.note && (
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {expense.note}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <strong className="text-lg text-slate-900 dark:text-slate-100">
                    {formatMoney(expense.amount)}
                  </strong>

                  <Button
                    variant="ghost"
                    size="small"
                    aria-label={`Désactiver ${expense.name}`}
                    onClick={() =>
                      toggleRecurringExpense(
                        expense,
                        false
                      )
                    }
                  >
                    <PowerOff className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="danger"
                    size="small"
                    aria-label={`Supprimer ${expense.name}`}
                    onClick={() =>
                      handleDeleteRecurring(expense)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {inactiveExpenses.length > 0 && (
        <Card title="Règles désactivées">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {inactiveExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    {expense.name}
                  </p>

                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    {formatMoney(expense.amount)} ·{" "}
                    {getCategoryName(
                      expense.categoryId
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    {frequencyLabels[expense.frequency]}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() =>
                      toggleRecurringExpense(
                        expense,
                        true
                      )
                    }
                  >
                    <Power className="mr-2 h-4 w-4" />
                    Réactiver
                  </Button>

                  <Button
                    variant="danger"
                    size="small"
                    aria-label={`Supprimer ${expense.name}`}
                    onClick={() =>
                      handleDeleteRecurring(expense)
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}