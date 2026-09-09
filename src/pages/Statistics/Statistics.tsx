import {
  BarChart3,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Card } from "../../components/ui/Card";
import { useBudget } from "../../context/BudgetContext";
import { selectBudgetViewModel } from "../../core/budgetSelectors";

function formatMoney(
  amount: number
): string {
  return `${new Intl.NumberFormat(
    "fr-FR"
  ).format(Math.round(amount))} FCFA`;
}

export function Statistics() {
  const {
    budgetMonth,
    expenses,
    plannedExpenses,
    savingsTransfers,
    savingsGoals,
    categories,
  } = useBudget();

  const viewModel =
    selectBudgetViewModel({
      budgetMonth,
      expenses,
      plannedExpenses,
      savingsTransfers,
      savingsGoals,
      categories,
    });

  const {
    calculation,
    monthExpenses,
    totalActualExpenses,
    totalPlannedMonthExpenses,
  } = viewModel;

  const averageExpense =
    monthExpenses.length > 0
      ? Math.round(
          totalActualExpenses /
            monthExpenses.length
        )
      : 0;

  const categoryTotals =
    categories.map((category) => {
      const total =
        monthExpenses
          .filter(
            (expense) =>
              expense.categoryId ===
              category.id
          )
          .reduce(
            (sum, expense) =>
              sum +
              Math.max(
                0,
                expense.amount -
                  expense.refundedAmount
              ),
            0
          );

      return {
        category,
        total,
      };
    });

  const sortedCategories =
    [...categoryTotals].sort(
      (a, b) =>
        b.total - a.total
    );

  const topCategory =
    sortedCategories.find(
      (item) => item.total > 0
    );

  const highestExpense =
    [...monthExpenses].sort(
      (a, b) =>
        Math.max(
          0,
          b.amount -
            b.refundedAmount
        ) -
        Math.max(
          0,
          a.amount -
            a.refundedAmount
        )
    )[0];

  const variance =
    calculation.varianceAmount;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-slate-500">
          Analyse
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Statistiques
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Analysez vos dépenses et votre comportement budgétaire.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={BarChart3}
          label="Dépenses réelles"
          value={formatMoney(
            totalActualExpenses
          )}
        />

        <StatCard
          icon={TrendingDown}
          label="Nombre de dépenses"
          value={String(
            monthExpenses.length
          )}
        />

        <StatCard
          icon={TrendingUp}
          label="Dépense moyenne"
          value={formatMoney(
            averageExpense
          )}
        />

        <StatCard
          icon={BarChart3}
          label="Plus grosse dépense"
          value={
            highestExpense
              ? formatMoney(
                  Math.max(
                    0,
                    highestExpense.amount -
                      highestExpense.refundedAmount
                  )
                )
              : "0 FCFA"
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-sm font-medium text-slate-500">
            Budget total
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatMoney(
              calculation.totalBudget
            )}
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">
            Budget utilisé
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {Math.round(
              calculation.budgetUsedPercentage
            )}
            %
          </p>
        </Card>

        <Card>
          <p className="text-sm font-medium text-slate-500">
            Prévu pour le mois
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {formatMoney(
              totalPlannedMonthExpenses
            )}
          </p>
        </Card>
      </div>

      <Card>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Réel vs prévu
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Comparez les dépenses réellement effectuées avec votre plan.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <ComparisonItem
            label="Réel"
            value={formatMoney(
              totalActualExpenses
            )}
          />

          <ComparisonItem
            label="Prévu"
            value={formatMoney(
              totalPlannedMonthExpenses
            )}
          />

          <ComparisonItem
            label="Écart"
            value={formatMoney(
              variance
            )}
            negative={variance > 0}
          />
        </div>
      </Card>

      <Card>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Dépenses par catégorie
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Répartition de vos dépenses réelles.
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {sortedCategories
            .filter(
              (item) =>
                item.total > 0
            )
            .map((item) => {
              const percentage =
                totalActualExpenses > 0
                  ? Math.round(
                      (item.total /
                        totalActualExpenses) *
                        100
                    )
                  : 0;

              return (
                <div
                  key={
                    item.category.id
                  }
                >
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-slate-700">
                      {
                        item.category.name
                      }
                    </span>

                    <span className="font-semibold text-slate-900">
                      {formatMoney(
                        item.total
                      )}
                    </span>
                  </div>

                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-slate-900 transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    {percentage}% des dépenses
                  </p>
                </div>
              );
            })}

          {!topCategory && (
            <div className="rounded-xl bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">
                Les statistiques apparaîtront dès que vous aurez enregistré des dépenses.
              </p>
            </div>
          )}
        </div>
      </Card>

      {topCategory && (
        <Card>
          <p className="text-sm font-medium text-slate-500">
            Catégorie principale
          </p>

          <div className="mt-2 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {
                  topCategory.category.name
                }
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Cette catégorie représente la plus grande part de vos dépenses du mois.
              </p>
            </div>

            <p className="text-lg font-bold text-slate-900">
              {formatMoney(
                topCategory.total
              )}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

interface ComparisonItemProps {
  label: string;
  value: string;
  negative?: boolean;
}

function ComparisonItem({
  label,
  value,
  negative = false,
}: ComparisonItemProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-bold ${
          negative
            ? "text-red-600"
            : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

interface StatCardProps {
  icon: typeof BarChart3;
  label: string;
  value: string;
}

function StatCard({
  icon: Icon,
  label,
  value,
}: StatCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-4">
        <div className="rounded-xl bg-slate-100 p-2.5">
          <Icon
            size={19}
            className="text-slate-600"
          />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-900">
        {value}
      </p>
    </Card>
  );
}