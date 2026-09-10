import type {
  BudgetCalculation,
  BudgetMonth,
  EconomyMode,
  Expense,
  ForecastScenario,
  PlannedExpense,
  SavingsTransfer,
  SimulationResult,
} from "../types/finance";

/* =========================================================
   UTILITAIRES
   ========================================================= */

function safeAmount(value: number): number {
  return Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0;
}

function parseDate(date: string): Date {
  const parsed = new Date(`${date}T00:00:00`);

  return parsed;
}

function clamp(
  value: number,
  min: number,
  max: number
): number {
  return Math.min(Math.max(value, min), max);
}

/* =========================================================
   DATES
   ========================================================= */

export function getDaysInMonth(date: Date): number {
  if (Number.isNaN(date.getTime())) {
    return 0;
  }

  return new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();
}

/**
 * Nombre de jours écoulés depuis le début du mois.
 *
 * Le premier jour compte comme 1.
 *
 * Exemple :
 * 01/09 -> 1 jour
 * 10/09 -> 10 jours
 *
 * Le résultat est limité à la durée du mois.
 */
export function getDaysElapsed(
  monthStart: string,
  currentDate: Date
): number {
  const start = parseDate(monthStart);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(currentDate.getTime())
  ) {
    return 0;
  }

  const daysInMonth = getDaysInMonth(start);

  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const currentDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const elapsedMilliseconds =
    currentDay.getTime() -
    startDay.getTime();

  const elapsedDays =
    Math.floor(
      elapsedMilliseconds /
        (1000 * 60 * 60 * 24)
    ) + 1;

  return clamp(
    elapsedDays,
    0,
    daysInMonth
  );
}

/**
 * Nombre de jours restant jusqu'à la fin du mois.
 *
 * Exemple :
 * 20/09 -> 10 jours restants jusqu'au 30/09
 * après le 30/09 -> 0
 */
export function getDaysRemaining(
  monthEnd: string,
  currentDate: Date
): number {
  const end = parseDate(monthEnd);

  if (
    Number.isNaN(end.getTime()) ||
    Number.isNaN(currentDate.getTime())
  ) {
    return 0;
  }

  const endDay = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate()
  );

  const currentDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const difference =
    Math.ceil(
      (endDay.getTime() -
        currentDay.getTime()) /
        (1000 * 60 * 60 * 24)
    );

  return Math.max(0, difference);
}

/* =========================================================
   ALIAS DE COMPATIBILITÉ
   ========================================================= */

export function calculateDaysElapsed(
  monthStart: string,
  currentDate: Date
): number {
  return getDaysElapsed(
    monthStart,
    currentDate
  );
}

export function calculateDaysRemaining(
  monthEnd: string,
  currentDate: Date
): number {
  return getDaysRemaining(
    monthEnd,
    currentDate
  );
}

/* =========================================================
   BUDGET
   ========================================================= */

export function calculateTotalBudget(
  budgetMonth: BudgetMonth
): number {
  return (
    safeAmount(
      budgetMonth.initialBudget
    ) +
    safeAmount(
      budgetMonth.carryOver
    )
  );
}

export function calculateActualExpenses(
  expenses: Expense[]
): number {
  if (!Array.isArray(expenses)) {
    return 0;
  }

  return expenses.reduce(
    (total, expense) => {
      const amount =
        safeAmount(expense.amount);

      const refund =
        safeAmount(
          expense.refundedAmount
        );

      return (
        total +
        Math.max(
          0,
          amount - refund
        )
      );
    },
    0
  );
}

export function calculateSavedAmount(
  transfers: SavingsTransfer[],
  budgetMonthId?: string
): number {
  if (!Array.isArray(transfers)) {
    return 0;
  }

  return transfers.reduce(
    (total, transfer) => {
      if (
        budgetMonthId !== undefined &&
        transfer.budgetMonthId !== budgetMonthId
      ) {
        return total;
      }

      return total + safeAmount(transfer.amount);
    },
    0
  );
}

export function calculateRemainingAmount(
  totalBudget: number,
  actualExpenses: number,
  reservedAmount: number,
  savedAmount: number
): number {
  return (
    safeAmount(totalBudget) -
    safeAmount(actualExpenses) -
    safeAmount(reservedAmount) -
    safeAmount(savedAmount)
  );
}

export function calculateBudgetUsedPercentage(
  totalBudget: number,
  actualExpenses: number
): number {
  const safeTotal =
    safeAmount(totalBudget);

  if (safeTotal <= 0) {
    return 0;
  }

  return clamp(
    (safeAmount(actualExpenses) /
      safeTotal) *
      100,
    0,
    100
  );
}

/* =========================================================
   DÉPENSES PLANIFIÉES
   ========================================================= */

export function calculatePlannedExpenses(
  plannedExpenses: number
): number {
  return safeAmount(plannedExpenses);
}

/* =========================================================
   PRÉVISION DE FIN DE MOIS
   ========================================================= */

/**
 * Prévision de fin de mois.
 *
 * Signature utilisée par les tests :
 *
 * calculateForecastEndBalance(
 *   remainingAmount,
 *   actualExpenses,
 *   daysElapsed,
 *   daysRemaining,
 *   plannedFutureExpenses
 * )
 *
 * Le rythme actuel de dépense est estimé à partir
 * des dépenses réelles déjà effectuées.
 */
export function calculateForecastEndBalance(
  remainingAmount: number,
  actualExpenses: number,
  daysElapsed: number,
  daysRemaining: number,
  plannedFutureExpenses: number
): number {
  const safeRemaining =
    safeAmount(remainingAmount);

  const safeActual =
    safeAmount(actualExpenses);

  const safeElapsed =
    Math.max(
      0,
      Math.round(daysElapsed)
    );

  const safeRemainingDays =
    Math.max(
      0,
      Math.round(daysRemaining)
    );

  const safePlanned =
    safeAmount(
      plannedFutureExpenses
    );

  if (safeRemainingDays <= 0) {
    return Math.max(
      0,
      safeRemaining - safePlanned
    );
  }

  const averageDailyExpense =
    safeElapsed > 0
      ? safeActual / safeElapsed
      : 0;

  const projectedAdditionalExpenses =
    averageDailyExpense *
    safeRemainingDays;

  return Math.round(
    safeRemaining -
      projectedAdditionalExpenses -
      safePlanned
  );
}

/* =========================================================
   RISQUE
   ========================================================= */

export function calculateRiskLevel(
  remainingAmount: number,
  minimumEndBalance: number,
  forecastEndBalance: number
): "green" | "orange" | "red" {
  if (
    remainingAmount < 0 ||
    forecastEndBalance < 0
  ) {
    return "red";
  }

  if (
    remainingAmount <
      safeAmount(minimumEndBalance) ||
    forecastEndBalance <
      safeAmount(minimumEndBalance)
  ) {
    return "orange";
  }

  return "green";
}

/* =========================================================
   LIMITES DE DÉPENSE
   ========================================================= */

export function calculateDailyLimit(
  remainingAmount: number,
  daysRemaining: number
): number {
  if (daysRemaining <= 0) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      remainingAmount /
        daysRemaining
    )
  );
}

export function calculateWeeklyLimit(
  dailyLimit: number
): number {
  return Math.max(
    0,
    Math.floor(
      dailyLimit * 7
    )
  );
}

export function calculateSecuredDailyLimit(
  remainingAmount: number,
  minimumEndBalance: number,
  daysRemaining: number
): number {
  if (daysRemaining <= 0) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      (
        remainingAmount -
        safeAmount(
          minimumEndBalance
        )
      ) /
        daysRemaining
    )
  );
}

export function calculateSecuredWeeklyLimit(
  securedDailyLimit: number
): number {
  return Math.max(
    0,
    Math.floor(
      securedDailyLimit * 7
    )
  );
}

/* =========================================================
   BUDGET COMPLET
   ========================================================= */

export function calculateBudget(
  budgetMonth: BudgetMonth,
  expenses: Expense[],
  plannedFutureExpenses: number,
  savedAmount: number,
  currentDate: Date,
  totalPlannedMonthExpenses?: number
): BudgetCalculation {
  const totalBudget =
    calculateTotalBudget(
      budgetMonth
    );

  const actualExpenses =
    calculateActualExpenses(
      expenses
    );

  /*
   * Dépenses planifiées du mois utilisées
   * pour calculer la variance.
   *
   * Si aucune valeur spécifique n'est fournie,
   * on utilise les dépenses futures.
   */
  const plannedExpenses =
    safeAmount(
      totalPlannedMonthExpenses ??
        plannedFutureExpenses
    );

  const reservedAmount =
    safeAmount(
      budgetMonth.reservedAmount
    );

  const safeSavedAmount =
    safeAmount(savedAmount);

  const remainingAmount =
    calculateRemainingAmount(
      totalBudget,
      actualExpenses,
      reservedAmount,
      safeSavedAmount
    );

  const monthStart =
    parseDate(
      budgetMonth.startDate
    );

  const daysInMonth =
    getDaysInMonth(monthStart);

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
      dailyLimit
    );

  const securedDailyLimit =
    calculateSecuredDailyLimit(
      remainingAmount,
      budgetMonth.minimumEndBalance,
      daysRemaining
    );

  const securedWeeklyLimit =
    calculateSecuredWeeklyLimit(
      securedDailyLimit
    );

  const budgetUsedPercentage =
    calculateBudgetUsedPercentage(
      totalBudget,
      actualExpenses
    );

  /*
   * Montant restant après les dépenses
   * qui sont encore prévues.
   *
   * Important :
   * on ne soustrait pas les dépenses réelles
   * une deuxième fois.
   */
  const expectedRemainingAmount =
    Math.max(
      0,
      remainingAmount -
        safeAmount(
          plannedFutureExpenses
        )
    );

  const expectedBudgetUsedPercentage =
    totalBudget > 0
      ? clamp(
          (
            (
              totalBudget -
              expectedRemainingAmount
            ) /
            totalBudget
          ) *
            100,
          0,
          100
        )
      : 0;

  /*
   * Prévision réelle basée sur le rythme
   * actuel des dépenses + dépenses futures.
   */
  const forecastEndBalance =
    calculateForecastEndBalance(
      remainingAmount,
      actualExpenses,
      daysElapsed,
      daysRemaining,
      plannedFutureExpenses
    );

  const freeMoney =
    Math.max(
      0,
      remainingAmount -
        safeAmount(
          budgetMonth.minimumEndBalance
        )
    );

  const riskLevel =
    calculateRiskLevel(
      remainingAmount,
      budgetMonth.minimumEndBalance,
      forecastEndBalance
    );

  const varianceAmount =
    actualExpenses -
    plannedExpenses;

  return {
    initialBudget:
      safeAmount(
        budgetMonth.initialBudget
      ),

    carryOver:
      safeAmount(
        budgetMonth.carryOver
      ),

    totalBudget,

    plannedExpenses,

    actualExpenses,

    reservedAmount,

    savedAmount:
      safeSavedAmount,

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

/* =========================================================
   SCÉNARIOS
   ========================================================= */

export function calculateForecastScenarios(
  calculation: BudgetCalculation
): ForecastScenario[] {
  const currentBalance =
    calculation.remainingAmount;

  const daysRemaining =
    Math.max(
      0,
      calculation.daysRemaining
    );

  const dailyLimit =
    Math.max(
      0,
      calculation.dailyLimit
    );

  const probableAdditional =
    Math.max(
      0,
      dailyLimit * daysRemaining
    );

  const optimisticAdditional =
    Math.max(
      0,
      probableAdditional * 0.7
    );

  const conservativeAdditional =
    Math.max(
      0,
      probableAdditional * 1.3
    );

  return [
    {
      name: "optimistic",

      projectedEndBalance:
        Math.round(
          currentBalance -
            optimisticAdditional
        ),

      projectedAdditionalExpenses:
        Math.round(
          optimisticAdditional
        ),

      description:
        "Dépenses maîtrisées et rythme inférieur à la limite quotidienne.",
    },

    {
      name: "probable",

      projectedEndBalance:
        Math.round(
          currentBalance -
            probableAdditional
        ),

      projectedAdditionalExpenses:
        Math.round(
          probableAdditional
        ),

      description:
        "Maintien du rythme de dépense actuel.",
    },

    {
      name: "conservative",

      projectedEndBalance:
        Math.round(
          currentBalance -
            conservativeAdditional
        ),

      projectedAdditionalExpenses:
        Math.round(
          conservativeAdditional
        ),

      description:
        "Rythme de dépense plus élevé que prévu.",
    },
  ];
}

/* =========================================================
   MODE ÉCONOMIE
   ========================================================= */

export function calculateEconomyMode(
  calculation: BudgetCalculation,
  minimumEndBalance: number
): EconomyMode {
  const safeMinimumEndBalance = safeAmount(minimumEndBalance);
  const remainingAmount = safeAmount(calculation.remainingAmount);
  const maxAdditionalSpending = Math.max(
    0,
    remainingAmount - safeMinimumEndBalance
  );
  const dailyLimit = calculateDailyLimit(
    maxAdditionalSpending,
    calculation.daysRemaining
  );

  return {
    enabled: remainingAmount >= safeMinimumEndBalance,
    minimumEndBalance: safeMinimumEndBalance,
    maxAdditionalSpending,
    dailyLimit,
    weeklyLimit: calculateWeeklyLimit(dailyLimit),
    progressPercentage:
      remainingAmount > 0
        ? clamp(
            (maxAdditionalSpending / remainingAmount) * 100,
            0,
            100
          )
        : 0,
    riskLevel: calculateRiskLevel(
      remainingAmount,
      safeMinimumEndBalance,
      calculation.forecastEndBalance
    ),
  };
}

export function calculateSimulation(
  budgetMonth: BudgetMonth,
  expenses: Expense[],
  plannedExpenses: PlannedExpense[],
  savingsTransfers: SavingsTransfer[],
  simulatedExpense: number,
  currentDate: Date
): SimulationResult {
  const safeSimulatedExpense = safeAmount(simulatedExpense);
  const savedAmount = calculateSavedAmount(
    savingsTransfers,
    budgetMonth.id
  );
  const plannedFutureExpenses = Array.isArray(
    plannedExpenses
  )
    ? plannedExpenses
        .filter(
          (expense) =>
            expense.status === "planned"
        )
        .reduce(
          (total, expense) =>
            total + safeAmount(expense.amount),
          0
        )
    : 0;
  const calculation = calculateBudget(
    budgetMonth,
    expenses,
    plannedFutureExpenses,
    savedAmount,
    currentDate
  );
  const balanceBefore = calculation.remainingAmount;
  const balanceAfter = Math.max(
    0,
    balanceBefore - safeSimulatedExpense
  );
  const forecastEndBalance = calculateForecastEndBalance(
    balanceAfter,
    calculation.actualExpenses + safeSimulatedExpense,
    calculation.daysElapsed,
    calculation.daysRemaining,
    plannedFutureExpenses
  );
  const dailyLimitAfter = calculateDailyLimit(
    balanceAfter,
    calculation.daysRemaining
  );
  const weeklyLimitAfter = calculateWeeklyLimit(
    dailyLimitAfter
  );

  return {
    simulatedExpense: safeSimulatedExpense,
    balanceBefore,
    balanceAfter,
    forecastEndBalance,
    dailyLimitAfter,
    weeklyLimitAfter,
    riskLevel: calculateRiskLevel(
      balanceAfter,
      budgetMonth.minimumEndBalance,
      forecastEndBalance
    ),
    isAffordable:
      balanceAfter >=
        safeAmount(budgetMonth.minimumEndBalance) &&
      forecastEndBalance >=
        safeAmount(budgetMonth.minimumEndBalance),
    generatedAt: new Date().toISOString(),
  };
}