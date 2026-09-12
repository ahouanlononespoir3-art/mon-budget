import {
  CalendarDays,
  Pencil,
  Receipt,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useBudget } from "../../context/BudgetContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import {
  ExpenseForm,
  type ExpenseFormData,
} from "../../components/expenses/ExpenseForm";
import type { Expense } from "../../types/finance";
import { createId } from "../../utils/id";
import { formatMoney } from "../../utils/formatMoney";

function formatDate(
  date: string
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(new Date(`${date}T00:00:00`));
}

export function Expenses() {
  const {
    expenses,
    categories,
    budgetMonth,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useBudget();

  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [period, setPeriod] = useState("month");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const monthExpenses = useMemo(() => expenses
      .filter(
        (expense) =>
          expense.budgetMonthId ===
          budgetMonth.id
      )
      .filter((expense) =>
        !query.trim() ||
        expense.description.toLowerCase().includes(query.toLowerCase()) ||
        expense.note?.toLowerCase().includes(query.toLowerCase())
      )
      .filter((expense) =>
        categoryFilter === "all" || expense.categoryId === categoryFilter
      )
      .filter((expense) => {
        if (period === "month") return true;
        const expenseDate = new Date(`${expense.date}T00:00:00`);
        const now = new Date();
        if (period === "today") return expense.date === now.toISOString().slice(0, 10);
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - 6);
        return expenseDate >= weekStart;
      })
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date)
      ), [expenses, budgetMonth.id, query, categoryFilter, period]);

  const totalSpent =
    monthExpenses.reduce(
      (total, expense) =>
        total +
        Math.max(
          0,
          expense.amount -
            expense.refundedAmount
        ),
      0
    );

  const getCategoryName = (
    categoryId: string
  ): string => {
    return (
      categories.find(
        (category) =>
          category.id === categoryId
      )?.name ?? "Sans catégorie"
    );
  };

  const handleDelete = (
    expenseId: string
  ) => {
    const confirmed =
      window.confirm(
        "Voulez-vous vraiment supprimer cette dépense ?"
      );

    if (confirmed) {
      deleteExpense(expenseId);
    }
  };

  const handleSubmit = (data: ExpenseFormData) => {
    const now = new Date().toISOString();
    if (editingExpense) {
      updateExpense({
        ...editingExpense,
        ...data,
        amount: Math.round(data.amount),
        description: data.description.trim(),
        note: data.note?.trim() || undefined,
        updatedAt: now,
      });
    } else {
      addExpense({
        id: createId("expense"),
        budgetMonthId: budgetMonth.id,
        amount: Math.round(data.amount),
        description: data.description.trim(),
        categoryId: data.categoryId,
        date: data.date,
        note: data.note?.trim() || undefined,
        refundedAmount: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
    setEditingExpense(null);
  };

  const addRefund = (expense: Expense) => {
    const refund = Number(window.prompt("Montant du remboursement", "0"));
    if (!Number.isFinite(refund) || refund <= 0) return;
    updateExpense({
      ...expense,
      refundedAmount: Math.min(expense.amount, expense.refundedAmount + Math.round(refund)),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Gestion
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            Dépenses
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Toutes les dépenses réellement enregistrées pour ce mois.
          </p>
        </div>

        <Card className="sm:min-w-56">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Dépenses du mois
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-slate-100">
            {formatMoney(totalSpent)}
          </p>
        </Card>
      </header>

      <Card>
        <div className="grid gap-3 md:grid-cols-[1fr_180px_150px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher une dépense"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 py-3 pl-10 pr-4 outline-none focus:border-blue-500"
            />
          </label>
          <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-3">
            <option value="all">Toutes les catégories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
          <select value={period} onChange={(event) => setPeriod(event.target.value)} className="rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-3">
            <option value="month">Ce mois</option>
            <option value="week">7 derniers jours</option>
            <option value="today">Aujourd'hui</option>
          </select>
        </div>
      </Card>

      {monthExpenses.length === 0 ? (
        <Card className="flex min-h-64 flex-col items-center justify-center text-center">
          <div className="rounded-2xl bg-slate-100 dark:bg-slate-700 p-4">
            <Receipt
              size={32}
              className="text-slate-600 dark:text-slate-300"
            />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
            Aucune dépense
          </h2>

          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Vous n'avez encore enregistré aucune dépense pour ce mois.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {monthExpenses.map(
              (expense) => {
                const effectiveAmount =
                  Math.max(
                    0,
                    expense.amount -
                      expense.refundedAmount
                  );

                return (
                  <div
                    key={expense.id}
                    className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="mt-0.5 rounded-xl bg-slate-100 dark:bg-slate-700 p-2.5">
                        <Receipt
                          size={18}
                          className="text-slate-600 dark:text-slate-300"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                          {
                            expense.description
                          }
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span>
                            {getCategoryName(
                              expense.categoryId
                            )}
                          </span>

                          <span>
                            •
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <CalendarDays
                              size={13}
                            />
                            {formatDate(
                              expense.date
                            )}
                          </span>
                        </div>

                        {expense.note && (
                          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            {
                              expense.note
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        {formatMoney(
                          effectiveAmount
                        )}
                      </p>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setEditingExpense(expense)}
                        aria-label={`Modifier ${expense.description}`}
                      >
                        <Pencil size={18} />
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => addRefund(expense)}
                        aria-label={`Ajouter un remboursement à ${expense.description}`}
                      >
                        Rembourser
                      </Button>

                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => handleDelete(expense.id)}
                        aria-label={`Supprimer ${expense.description}`}
                      >
                        <Trash2
                          size={18}
                        />
                      </Button>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </Card>
      )}

      {editingExpense && (
        <ExpenseForm
          key={editingExpense.id}
          categories={categories}
          title="Modifier la dépense"
          initialValues={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}