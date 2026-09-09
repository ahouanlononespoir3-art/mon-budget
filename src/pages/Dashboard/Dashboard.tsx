import {
  AlertTriangle,
  ArrowDownRight,
  CalendarDays,
  CheckCircle2,
  PiggyBank,
  ShieldCheck,
  Target,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";

import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useBudget } from "../../context/BudgetContext";
import { selectBudgetViewModel } from "../../core/budgetSelectors";
import type {
  Category,
  Expense,
  ForecastScenario,
  PlannedExpense,
} from "../../types/finance";

function formatMoney(
  amount: number
): string {
  return `${new Intl.NumberFormat(
    "fr-FR"
  ).format(Math.round(amount))} FCFA`;
}

function formatDate(
  date: string
): string {
  return new Intl.DateTimeFormat(
    "fr-FR",
    {
      day: "2-digit",
      month: "short",
    }
  ).format(
    new Date(`${date}T00:00:00`)
  );
}

function getRiskLabel(
  riskLevel: string
): string {
  switch (riskLevel) {
    case "green":
      return "Situation saine";
    case "orange":
      return "Vigilance";
    case "red":
      return "Risque élevé";
    default:
      return "Situation inconnue";
  }
}

function getRiskClasses(
  riskLevel: string
): string {
  switch (riskLevel) {
    case "green":
      return "border-emerald-200 bg-emerald-50 text-emerald-800";
    case "orange":
      return "border-amber-200 bg-amber-50 text-amber-800";
    case "red":
      return "border-red-200 bg-red-50 text-red-800";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export function Dashboard() {
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
    forecast,
    upcomingExpenses,
    recentExpenses,
    economyMode,
    activeGoals,
  } = viewModel;

  const {
    totalBudget,
    actualExpenses,
    remainingAmount,
    expectedRemainingAmount,
    reservedAmount,
    savedAmount,
    dailyLimit,
    weeklyLimit,
    securedDailyLimit,
    securedWeeklyLimit,
    budgetUsedPercentage,
    forecastEndBalance,
    riskLevel,
  } = calculation;

  const getCategory = (
    categoryId: string
  ): Category | undefined => {
    return categories.find(
      (category: Category) =>
        category.id === categoryId
    );
  };

  const priorityGoal =
    [...activeGoals].sort(
      (a, b) =>
        a.priority - b.priority
    )[0];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Vue d'ensemble
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Mon Budget
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Pilotez votre argent avec une vision claire du réel et du prévisionnel.
          </p>
        </div>

        <div
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getRiskClasses(
            riskLevel
          )}`}
        >
          {riskLevel === "green" ? (
            <CheckCircle2 size={17} />
          ) : (
            <AlertTriangle size={17} />
          )}

          {getRiskLabel(riskLevel)}
        </div>
      </header>

      <Card className="overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Wallet size={17} />
              Argent actuellement disponible
            </div>

            <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              {formatMoney(
                remainingAmount
              )}
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Après dépenses réelles, réserve et épargne.
            </p>

            <div className="mt-6">
              <ProgressBar
                value={
                  budgetUsedPercentage
                }
                max={100}
                showLabel
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <InfoStat
              label="Budget total"
              value={formatMoney(totalBudget)}
            />

            <InfoStat
              label="Dépenses réelles"
              value={formatMoney(
                actualExpenses
              )}
            />

            <InfoStat
              label="Épargne"
              value={formatMoney(
                savedAmount
              )}
          />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LimitCard
          title="Limite quotidienne"
          value={dailyLimit}
          icon={<ArrowDownRight size={19} />}
        />

        <LimitCard
          title="Limite hebdomadaire"
          value={weeklyLimit}
          icon={<ArrowDownRight size={19} />}
        />

        <LimitCard
          title="Limite sécurisée / jour"
          value={securedDailyLimit}
          icon={<ShieldCheck size={19} />}
        />

        <LimitCard
          title="Limite sécurisée / semaine"
          value={securedWeeklyLimit}
          icon={<ShieldCheck size={19} />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Prévision de fin de mois
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Estimation basée sur votre rythme actuel.
              </p>
            </div>

            <PiggyBank
              size={21}
              className="text-slate-500"
            />
          </div>

          <p className="mt-5 text-3xl font-bold text-slate-900">
            {formatMoney(
              forecastEndBalance
            )}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {forecast.scenarios.map(
              (
                scenario: ForecastScenario
              ) => (
                <ScenarioCard
                  key={
                    scenario.name
                  }
                  scenario={
                    scenario
                  }
                />
              )
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Réel vs prévu
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Le montant que vous devriez conserver après vos dépenses connues.
              </p>
            </div>

            <Target
              size={21}
              className="text-slate-500"
            />
          </div>

          <div className="mt-5 space-y-4">
            <ComparisonRow
              label="Disponible maintenant"
              value={remainingAmount}
            />

            <ComparisonRow
              label="Disponible attendu"
              value={
                expectedRemainingAmount
              }
            />

            <ComparisonRow
              label="Réserve"
              value={reservedAmount}
            />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Mode économie
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Protège votre minimum de fin de mois.
            </p>
          </div>

          <ShieldCheck
            size={21}
            className="text-slate-500"
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <ProgressBar
              value={
                economyMode.progressPercentage
              }
              max={100}
              showLabel
            />

            <p className="mt-3 text-sm text-slate-500">
              Dépense supplémentaire maximale recommandée :{" "}
              <span className="font-semibold text-slate-900">
                {formatMoney(
                  economyMode.maxAdditionalSpending
                )}
              </span>
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-5 lg:min-w-64">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Minimum protégé
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {formatMoney(
                economyMode.minimumEndBalance
              )}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Prochaines dépenses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Dépenses prévues qui peuvent réduire votre marge.
              </p>
            </div>

            <CalendarDays
              size={21}
              className="text-slate-500"
            />
          </div>

          <div className="mt-5 space-y-3">
            {upcomingExpenses
              .slice(0, 5)
              .map(
                (
                  expense: PlannedExpense
                ) => {
                  const category =
                    getCategory(
                      expense.categoryId
                    );

                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {expense.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(
                            expense.plannedDate
                          )}
                          {category
                            ? ` · ${category.name}`
                            : ""}
                        </p>
                      </div>

                      <p className="shrink-0 font-bold text-slate-900">
                        {formatMoney(
                          expense.amount
                        )}
                      </p>
                    </div>
                  );
                }
              )}

            {upcomingExpenses.length ===
              0 && (
              <EmptyState text="Aucune dépense prévue à venir." />
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Dernières dépenses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Vos opérations récentes.
              </p>
            </div>

            <Wallet
              size={21}
              className="text-slate-500"
            />
          </div>

          <div className="mt-5 space-y-3">
            {recentExpenses
              .slice(0, 5)
              .map(
                (
                  expense: Expense
                ) => {
                  const category =
                    getCategory(
                      expense.categoryId
                    );

                  const effectiveAmount =
                    Math.max(
                      0,
                      expense.amount -
                        expense.refundedAmount
                    );

                  return (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {expense.description}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(
                            expense.date
                          )}
                          {category
                            ? ` · ${category.name}`
                            : ""}
                        </p>
                      </div>

                      <p className="shrink-0 font-bold text-slate-900">
                        {formatMoney(
                          effectiveAmount
                        )}
                      </p>
                    </div>
                  );
                }
              )}

            {recentExpenses.length ===
              0 && (
              <EmptyState text="Aucune dépense enregistrée." />
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Objectif prioritaire
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Gardez votre objectif principal visible.
            </p>
          </div>

          <Target
            size={21}
            className="text-slate-500"
          />
        </div>

        {priorityGoal ? (
          <div className="mt-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {priorityGoal.name}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {formatMoney(
                    priorityGoal.savedAmount
                  )}{" "}
                  sur{" "}
                  {formatMoney(
                    priorityGoal.targetAmount
                  )}
                </p>
              </div>

              <p className="text-lg font-bold text-slate-900">
                {Math.round(
                  Math.min(
                    100,
                    (priorityGoal.savedAmount /
                      Math.max(
                        1,
                        priorityGoal.targetAmount
                      )) *
                      100
                  )
                )}
                %
              </p>
            </div>

            <div className="mt-4">
              <ProgressBar
                value={
                  priorityGoal.savedAmount
                }
                max={
                  priorityGoal.targetAmount
                }
              />
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState text="Aucun objectif actif pour le moment." />
          </div>
        )}
      </Card>

      <Card>
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoStat
            label="Jours écoulés"
            value={`${calculation.daysElapsed} / ${calculation.daysInMonth}`}
          />

          <InfoStat
            label="Jours restants"
            value={String(
              calculation.daysRemaining
            )}
          />

          <InfoStat
            label="Prévu restant"
            value={formatMoney(
              calculation.expectedRemainingAmount
            )}
          />
        </div>
      </Card>
    </div>
  );
}

interface InfoStatProps {
  label: string;
  value: string;
}

function InfoStat({
  label,
  value,
}: InfoStatProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

interface LimitCardProps {
  title: string;
  value: number;
  icon: ReactNode;
}

function LimitCard({
  title,
  value,
  icon,
}: LimitCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <div className="rounded-xl bg-slate-100 p-2 text-slate-600">
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xl font-bold text-slate-900">
        {formatMoney(value)}
      </p>
    </Card>
  );
}

interface ScenarioCardProps {
  scenario: ForecastScenario;
}

function ScenarioCard({
  scenario,
}: ScenarioCardProps) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {scenario.name}
      </p>

      <p className="mt-2 font-bold text-slate-900">
        {formatMoney(
          scenario.projectedEndBalance
        )}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        +{formatMoney(
          scenario.projectedAdditionalExpenses
        )}{" "}
        de dépenses projetées
      </p>
    </div>
  );
}

interface ComparisonRowProps {
  label: string;
  value: number;
}

function ComparisonRow({
  label,
  value,
}: ComparisonRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="font-semibold text-slate-900">
        {formatMoney(value)}
      </span>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-5 text-center">
      <p className="text-sm text-slate-500">
        {text}
      </p>
    </div>
  );
}