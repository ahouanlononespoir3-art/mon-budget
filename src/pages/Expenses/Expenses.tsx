import {
  CalendarDays,
  Receipt,
  Trash2,
} from "lucide-react";

import { useBudget } from "../../context/BudgetContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

function formatMoney(
  amount: number
): string {
  return `${new Intl.NumberFormat(
    "fr-FR"
  ).format(amount)} FCFA`;
}

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
    deleteExpense,
  } = useBudget();

  const monthExpenses =
    expenses
      .filter(
        (expense) =>
          expense.budgetMonthId ===
          budgetMonth.id
      )
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date)
      );

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

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Gestion
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Dépenses
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Toutes les dépenses réellement enregistrées pour ce mois.
          </p>
        </div>

        <Card className="sm:min-w-56">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Dépenses du mois
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatMoney(totalSpent)}
          </p>
        </Card>
      </header>

      {monthExpenses.length === 0 ? (
        <Card className="flex min-h-64 flex-col items-center justify-center text-center">
          <div className="rounded-2xl bg-slate-100 p-4">
            <Receipt
              size={32}
              className="text-slate-600"
            />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Aucune dépense
          </h2>

          <p className="mt-2 max-w-md text-sm text-slate-500">
            Vous n'avez encore enregistré aucune dépense pour ce mois.
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-slate-100">
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
                      <div className="mt-0.5 rounded-xl bg-slate-100 p-2.5">
                        <Receipt
                          size={18}
                          className="text-slate-600"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {
                            expense.description
                          }
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
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
                          <p className="mt-2 text-sm text-slate-500">
                            {
                              expense.note
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <p className="font-bold text-slate-900">
                        {formatMoney(
                          effectiveAmount
                        )}
                      </p>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() =>
                          handleDelete(
                            expense.id
                          )
                        }
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
    </div>
  );
}