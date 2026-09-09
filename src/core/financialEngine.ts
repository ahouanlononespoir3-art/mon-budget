import {
  differenceInCalendarDays,
  getDaysInMonth as dateFnsGetDaysInMonth,
} from "date-fns";

import type {
  BudgetCalculation,
  BudgetMonth,
  EconomyMode,
  Expense,
  ForecastScenario,
  RiskLevel,
} from "../types/finance";

/**
 * Sécurise un montant financier.
 * Les montants négatifs et NaN sont ramenés à 0.
 */
function safeAmount(value: number | null | undefined): number {
  if (!Number.isFinite(value ?? NaN)) {
    return 0;
  }

  return Math.max(0, Math.round(value ?? 0));
}

/**
 * Convertit une date YYYY-MM-DD en date locale.
 */
function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

/**
 * Retourne le nombre de jours d'un mois.
 */
export function getDaysInMonth(date: Date): number {
  return dateFnsGetDaysInMonth(date);
}

/**
 * Retourne le nombre de jours écoulés depuis le début
 * du mois budgétaire.
 *
 * Exemple :
 * 01/09 -> 1 jour écoulé
 * 10/09 -> 10 jours écoulés
 */
export function getDaysElapsed(
  monthStart: string,
  currentDate: Date
): number {
  const start = parseDate(monthStart);
  const daysInMonth = getDaysInMonth(start);

  const difference =
    differenceInCalendarDays(
      currentDate,
      start
    ) + 1;

  return Math.min(
    Math.max(difference, 0),
    daysInMonth
  );
}

/**
 * Retourne le nombre de jours restants jusqu'à la fin
 * du mois budgétaire.
 */
export function getDaysRemaining(
  monthEnd: string,
  currentDate: Date
): number {
  const end = parseDate(monthEnd);

  const difference =
    differenceInCalendarDays(
      end,
      currentDate
    );

  return Math.max(0, difference);
}

/**
 * Calcule le budget total disponible.
 *
 * Budget total = budget initial + report.
 */
export function calculateTotalBudget(
  budgetMonth: BudgetMonth
): number {
  return (
    safeAmount(budgetMonth.initialBudget) +
    safeAmount(budgetMonth.carryOver)
  );
}

/**
 * Calcule les dépenses réellement effectuées.
 *
 * Une dépense effective = montant - remboursements.
 */
export function calculateActualExpenses(
  expenses: Expense[]
): number {
  return expenses.reduce(
    (total, expense) => {
      const amount =
        safeAmount(expense.amount);

      const refunded =
        safeAmount(
          expense.refundedAmount
        );

      const effectiveAmount =
        Math.max(
          0,
          amount - refunded
        );

      return total + effectiveAmount;
    },
    0
  );
}

/**
 * Calcule le montant total épargné pendant le mois.
 */
export function calculateSavedAmount(
  savingsTransfers: Array<{
    amount: number;
    budgetMonthId?: string;
  }>,
  budgetMonthId?: string
): number {
  return savingsTransfers
    .filter(
      (transfer) =>
        !budgetMonthId ||
        transfer.budgetMonthId ===
          budgetMonthId
    )
    .reduce(
      (total, transfer) =>
        total +
        safeAmount(transfer.amount),
      0
    );
}

/**
 * Calcule le montant restant après dépenses,
 * réserve et épargne.
 */
export function calculateRemainingAmount(
  totalBudget: number,
  actualExpenses: number,
  reservedAmount: number,
  savedAmount: number
): number {
  return Math.max(
    0,
    safeAmount(totalBudget) -
      safeAmount(actualExpenses) -
      safeAmount(reservedAmount) -
      safeAmount(savedAmount)
  );
}

/**
 * Calcule le montant restant attendu en tenant compte
 * des dépenses planifiées à venir.
 */
export function calculateExpectedRemainingAmount(
  remainingAmount: number,
  plannedFutureExpenses: number
): number {
  return Math.max(
    0,
    safeAmount(remainingAmount) -
      safeAmount(plannedFutureExpenses)
  );
}

/**
 * Calcule le pourcentage du budget utilisé.
 */
export function calculateBudgetUsedPercentage(
  totalBudget: number,
  actualExpenses: number
): number {
  const budget = safeAmount(totalBudget);

  if (budget <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      (safeAmount(actualExpenses) /
        budget) *
        100
    )
  );
}

/**
 * Calcule le pourcentage attendu du budget utilisé
 * après prise en compte des dépenses planifiées.
 */
export function calculateExpectedBudgetUsedPercentage(
  totalBudget: number,
  actualExpenses: number,
  plannedFutureExpenses: number
): number {
  const budget = safeAmount(totalBudget);

  if (budget <= 0) {
    return 0;
  }

  const expectedExpenses =
    safeAmount(actualExpenses) +
    safeAmount(plannedFutureExpenses);

  return Math.min(
    100,
    Math.max(
      0,
      (expectedExpenses / budget) * 100
    )
  );
}

/**
 * Calcule la limite quotidienne normale.
 */
export function calculateDailyLimit(
  remainingAmount: number,
  daysRemaining: number
): number {
  const remaining =
    safeAmount(remainingAmount);

  const days = Math.max(
    1,
    Math.round(daysRemaining)
  );

  return Math.floor(
    remaining / days
  );
}

/**
 * Calcule la limite hebdomadaire normale.
 */
export function calculateWeeklyLimit(
  remainingAmount: number,
  daysRemaining: number
): number {
  const remaining =
    safeAmount(remainingAmount);

  const days = Math.max(
    1,
    Math.round(daysRemaining)
  );

  return Math.floor(
    (remaining / days) * 7
  );
}

/**
 * Calcule une limite quotidienne sécurisée en conservant
 * un minimum de fin de mois.
 */
export function calculateSecuredDailyLimit(
  remainingAmount: number,
  minimumEndBalance: number,
  daysRemaining: number
): number {
  const remaining =
    safeAmount(remainingAmount);

  const minimum =
    safeAmount(minimumEndBalance);

  const days = Math.max(
    1,
    Math.round(daysRemaining)
  );

  const available =
    Math.max(
      0,
      remaining - minimum
    );

  return Math.floor(
    available / days
  );
}

/**
 * Calcule une limite hebdomadaire sécurisée.
 */
export function calculateSecuredWeeklyLimit(
  remainingAmount: number,
  minimumEndBalance: number,
  daysRemaining: number
): number {
  const dailyLimit =
    calculateSecuredDailyLimit(
      remainingAmount,
      minimumEndBalance,
      daysRemaining
    );

  return dailyLimit * 7;
}

/**
 * Calcule la prévision du solde en fin de mois.
 *
 * currentBalance = solde actuellement disponible.
 * currentExpenses = dépenses déjà réalisées.
 * daysElapsed = jours déjà écoulés.
 * daysRemaining = jours restants.
 * plannedFutureExpenses = dépenses futures connues.
 *
 * La moyenne journalière est calculée à partir des dépenses
 * déjà réalisées, puis projetée sur les jours restants.
 */
export function calculateForecastEndBalance(
  currentBalance: number,
  currentExpenses: number,
  daysElapsed: number,
  daysRemaining: number,
  plannedFutureExpenses: number
): number {
  const balance =
    safeAmount(currentBalance);

  const expenses =
    safeAmount(currentExpenses);

  const elapsed = Math.max(
    0,
    Math.round(daysElapsed)
  );

  const remaining = Math.max(
    0,
    Math.round(daysRemaining)
  );

  const planned =
    safeAmount(
      plannedFutureExpenses
    );

  if (remaining <= 0) {
    return Math.max(
      0,
      balance - planned
    );
  }

  const dailyAverage =
    elapsed > 0
      ? expenses / elapsed
      : 0;

  const projectedAdditionalExpenses =
    Math.round(
      dailyAverage * remaining
    );

  return Math.max(
    0,
    balance -
      projectedAdditionalExpenses -
      planned
  );
}

/**
 * Détermine le niveau de risque budgétaire.
 */
export function calculateRiskLevel(
  remainingAmount: number,
  minimumEndBalance: number,
  dailyLimit: number,
  forecastEndBalance: number
): RiskLevel {
  const remaining =
    safeAmount(remainingAmount);

  const minimum =
    safeAmount(minimumEndBalance);

  const daily =
    safeAmount(dailyLimit);

  const forecast =
    safeAmount(forecastEndBalance);

  if (
    remaining <= 0 ||
    forecast < minimum ||
    daily <= 0
  ) {
    return "red";
  }

  if (
    forecast <
      minimum +
        Math.max(
          1,
          Math.round(
            minimum * 0.2
          )
        ) ||
    daily <
      Math.max(
        1,
        Math.round(
          remaining * 0.02
        )
      )
  ) {
    return "orange";
  }

  return "green";
}

/**
 * Calcule toutes les données financières du mois.
 *
 * Signature conservée compatible avec les tests existants :
 *
 * calculateBudget(
 *   budgetMonth,
 *   expenses,
 *   plannedFutureExpenses,
 *   savedAmount,
 *   currentDate,
 *   plannedTotalExpenses?
 * )
 */
export function calculateBudget(
  budgetMonth: BudgetMonth,
  expenses: Expense[],
  plannedFutureExpenses: number,
  savedAmount: number,
  currentDate: Date,
  plannedTotalExpenses?: number
): BudgetCalculation {
  const totalBudget =
    calculateTotalBudget(
      budgetMonth
    );

  const actualExpenses =
    calculateActualExpenses(
      expenses.filter(
        (expense) =>
          expense.budgetMonthId ===
          budgetMonth.id
      )
    );

  const reservedAmount =
    safeAmount(
      budgetMonth.reservedAmount
    );

  const normalizedSavedAmount =
    safeAmount(savedAmount);

  const remainingAmount =
    calculateRemainingAmount(
      totalBudget,
      actualExpenses,
      reservedAmount,
      normalizedSavedAmount
    );

  const normalizedPlannedFuture =
    safeAmount(
      plannedFutureExpenses
    );

  const expectedRemainingAmount =
    calculateExpectedRemainingAmount(
      remainingAmount,
      normalizedPlannedFuture
    );

  const daysInMonth =
    getDaysInMonth(
      parseDate(
        budgetMonth.startDate
      )
    );

  const daysElapsed =
    getDaysElapsed(
      budgetMonth.startDate,
      currentDate
    );

  const daysRemaining =
    getDaysRemaining(
      budgetMonth.endDate,
      currentDate
    );

  const dailyLimit =
    calculateDailyLimit(
      remainingAmount,
      daysRemaining
    );

  const weeklyLimit =
    calculateWeeklyLimit(
      remainingAmount,
      daysRemaining
    );

  const securedDailyLimit =
    calculateSecuredDailyLimit(
      remainingAmount,
      budgetMonth.minimumEndBalance,
      daysRemaining
    );

  const securedWeeklyLimit =
    calculateSecuredWeeklyLimit(
      remainingAmount,
      budgetMonth.minimumEndBalance,
      daysRemaining
    );

  const budgetUsedPercentage =
    calculateBudgetUsedPercentage(
      totalBudget,
      actualExpenses
    );

  const expectedBudgetUsedPercentage =
    calculateExpectedBudgetUsedPercentage(
      totalBudget,
      actualExpenses,
      normalizedPlannedFuture
    );

  const forecastEndBalance =
    calculateForecastEndBalance(
      remainingAmount,
      actualExpenses,
      daysElapsed,
      daysRemaining,
      normalizedPlannedFuture
    );

  const riskLevel =
    calculateRiskLevel(
      remainingAmount,
      budgetMonth.minimumEndBalance,
      dailyLimit,
      forecastEndBalance
    );

  const varianceAmount =
    safeAmount(
      plannedTotalExpenses
    ) > 0
      ? actualExpenses -
        safeAmount(
          plannedTotalExpenses
        )
      : 0;

  const freeMoney =
    Math.max(
      0,
      remainingAmount -
        safeAmount(
          budgetMonth.minimumEndBalance
        )
    );

  return {
    initialBudget: safeAmount(
      budgetMonth.initialBudget
    ),
    carryOver: safeAmount(
      budgetMonth.carryOver
    ),
    totalBudget,
    plannedExpenses:
      safeAmount(
        plannedTotalExpenses
      ),
    actualExpenses,
    reservedAmount,
    savedAmount:
      normalizedSavedAmount,
    remainingAmount,
    expectedRemainingAmount,
    varianceAmount,
    daysInMonth,
    daysElapsed,
    daysRemaining,
    freeMoney,
    dailyLimit,
    weeklyLimit,
    securedDailyLimit,
    securedWeeklyLimit,
    budgetUsedPercentage,
    expectedBudgetUsedPercentage,
    forecastEndBalance,
    riskLevel,
  };
}

/**
 * Génère trois scénarios de prévision.
 */
export function calculateForecastScenarios(
  calculation: BudgetCalculation
): ForecastScenario[] {
  const currentBalance =
    safeAmount(
      calculation.remainingAmount
    );

  const daysRemaining =
    Math.max(
      0,
      calculation.daysRemaining
    );

  const dailyAverage =
    calculation.daysElapsed > 0
      ? calculation.actualExpenses /
        calculation.daysElapsed
      : 0;

  const optimisticAdditionalExpenses =
    Math.round(
      dailyAverage *
        daysRemaining *
        0.75
    );

  const probableAdditionalExpenses =
    Math.round(
      dailyAverage *
        daysRemaining
    );

  const conservativeAdditionalExpenses =
    Math.round(
      dailyAverage *
        daysRemaining *
        1.25
    );

  const optimisticBalance =
    Math.max(
      0,
      currentBalance -
        optimisticAdditionalExpenses
    );

  const probableBalance =
    Math.max(
      0,
      currentBalance -
        probableAdditionalExpenses
    );

  const conservativeBalance =
    Math.max(
      0,
      currentBalance -
        conservativeAdditionalExpenses
    );

  return [
    {
      name: "optimistic",
      projectedEndBalance:
        optimisticBalance,
      projectedAdditionalExpenses:
        optimisticAdditionalExpenses,
      description:
        "Vous dépensez environ 25 % de moins que votre rythme actuel.",
    },
    {
      name: "probable",
      projectedEndBalance:
        probableBalance,
      projectedAdditionalExpenses:
        probableAdditionalExpenses,
      description:
        "Vous continuez à dépenser au rythme moyen observé.",
    },
    {
      name: "conservative",
      projectedEndBalance:
        conservativeBalance,
      projectedAdditionalExpenses:
        conservativeAdditionalExpenses,
      description:
        "Vos dépenses augmentent d'environ 25 % par rapport au rythme actuel.",
    },
  ];
}

/**
 * Calcule le mode économie.
 */
export function calculateEconomyMode(
  calculation: BudgetCalculation,
  minimumEndBalance: number
): EconomyMode {
  const minimum =
    safeAmount(
      minimumEndBalance
    );

  const maxAdditionalSpending =
    Math.max(
      0,
      calculation.remainingAmount -
        minimum
    );

  const progressPercentage =
    maxAdditionalSpending > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (calculation.remainingAmount /
              Math.max(
                calculation.remainingAmount,
                minimum
              )) *
              100
          )
        )
      : calculation.remainingAmount >=
          minimum
        ? 100
        : 0;

  return {
    enabled: true,
    minimumEndBalance:
      minimum,
    maxAdditionalSpending,
    dailyLimit:
      calculation.securedDailyLimit,
    weeklyLimit:
      calculation.securedWeeklyLimit,
    progressPercentage,
    riskLevel:
      calculation.riskLevel,
  };
}