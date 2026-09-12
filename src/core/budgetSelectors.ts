import type {
  BudgetMonth,
  BudgetCalculation,
  BudgetForecast,
  Category,
  DashboardData,
  EconomyMode,
  Expense,
  PlannedExpense,
  SavingsGoal,
  SavingsTransfer,
} from "../types/finance";

import {
  calculateActualExpenses,
  calculateBudget,
  calculateEconomyMode,
  calculateForecastScenarios,
  calculateSavedAmount,
} from "./financialEngine";

export interface BudgetDataSet {
  budgetMonth: BudgetMonth;
  expenses: Expense[];
  plannedExpenses: PlannedExpense[];
  savingsTransfers: SavingsTransfer[];
  savingsGoals: SavingsGoal[];
  categories: Category[];
}

export interface CategoryBudgetStatus {
  category: Category;
  spent: number;
  limit: number;
  percentage: number;
  remaining: number;
}

export interface BudgetViewModel {
  month: BudgetMonth;

  calculation: BudgetCalculation;

  forecast: BudgetForecast;

  economyMode: EconomyMode;

  monthExpenses: Expense[];

  categoryBudgets: CategoryBudgetStatus[];

  recentExpenses: Expense[];

  upcomingExpenses: PlannedExpense[];

  futurePlannedExpenses: PlannedExpense[];

  completedPlannedExpenses: PlannedExpense[];

  pendingPlannedExpenses: PlannedExpense[];

  savingsTransfers: SavingsTransfer[];

  activeGoals: SavingsGoal[];

  totalActualExpenses: number;

  totalPlannedMonthExpenses: number;

  totalFuturePlannedExpenses: number;
}

function isDateInMonth(
  date: string,
  month: BudgetMonth
): boolean {
  return (
    date >= month.startDate &&
    date <= month.endDate
  );
}

export function selectMonthExpenses(
  data: BudgetDataSet
): Expense[] {
  return data.expenses.filter(
    (expense) =>
      expense.budgetMonthId ===
        data.budgetMonth.id &&
      isDateInMonth(
        expense.date,
        data.budgetMonth
      )
  );
}

export function selectMonthPlannedExpenses(
  data: BudgetDataSet
): PlannedExpense[] {
  return data.plannedExpenses.filter(
    (expense) =>
      expense.budgetMonthId ===
        data.budgetMonth.id &&
      isDateInMonth(
        expense.plannedDate,
        data.budgetMonth
      )
  );
}

export function selectFuturePlannedExpenses(
  data: BudgetDataSet
): PlannedExpense[] {
  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  return selectMonthPlannedExpenses(
    data
  )
    .filter(
      (expense) =>
        expense.status === "planned" &&
        expense.plannedDate >= today
    )
    .sort((a, b) =>
      a.plannedDate.localeCompare(
        b.plannedDate
      )
    );
}

export function selectCompletedPlannedExpenses(
  data: BudgetDataSet
): PlannedExpense[] {
  return selectMonthPlannedExpenses(
    data
  )
    .filter(
      (expense) =>
        expense.status === "paid"
    )
    .sort((a, b) =>
      a.plannedDate.localeCompare(
        b.plannedDate
      )
    );
}

export function selectPendingPlannedExpenses(
  data: BudgetDataSet
): PlannedExpense[] {
  return selectMonthPlannedExpenses(
    data
  )
    .filter(
      (expense) =>
        expense.status === "planned" ||
        expense.status === "postponed"
    )
    .sort((a, b) =>
      a.plannedDate.localeCompare(
        b.plannedDate
      )
    );
}

export function selectActiveGoals(
  data: BudgetDataSet
): SavingsGoal[] {
  return data.savingsGoals
    .filter(
      (goal) =>
        goal.status === "active"
    )
    .sort(
      (a, b) =>
        a.priority - b.priority
    );
}

export function calculateTotalPlannedMonthExpenses(
  plannedExpenses: PlannedExpense[]
): number {
  return plannedExpenses
    .filter(
      (expense) =>
        expense.status !==
          "cancelled" &&
        expense.status !==
          "postponed"
    )
    .reduce(
      (total, expense) =>
        total +
        Math.max(
          0,
          Math.round(
            expense.actualAmount ??
              expense.amount
          )
        ),
      0
    );
}

export function calculateTotalFuturePlannedExpenses(
  plannedExpenses: PlannedExpense[]
): number {
  return plannedExpenses
    .filter(
      (expense) =>
        expense.status === "planned"
    )
    .reduce(
      (total, expense) =>
        total +
        Math.max(
          0,
          Math.round(
            expense.amount
          )
        ),
      0
    );
}

export function selectRecentExpenses(
  expenses: Expense[]
): Expense[] {
  return [...expenses].sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      b.createdAt.localeCompare(
        a.createdAt
      )
  );
}

export function selectCategoryBudgetStatuses(
  categories: Category[],
  monthExpenses: Expense[]
): CategoryBudgetStatus[] {
  return categories
    .filter(
      (category) =>
        category.active &&
        category.monthlyLimit != null &&
        category.monthlyLimit > 0
    )
    .map((category) => {
      const limit = category.monthlyLimit as number;

      const spent = monthExpenses
        .filter(
          (expense) =>
            expense.categoryId === category.id
        )
        .reduce(
          (total, expense) =>
            total +
            Math.max(
              0,
              expense.amount - expense.refundedAmount
            ),
          0
        );

      return {
        category,
        spent,
        limit,
        percentage: Math.round((spent / limit) * 100),
        remaining: limit - spent,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);
}

export function selectBudgetViewModel(
  data: BudgetDataSet,
  currentDate: Date = new Date()
): BudgetViewModel {
  const monthExpenses =
    selectMonthExpenses(data);

  const monthPlannedExpenses =
    selectMonthPlannedExpenses(data);

  const futurePlannedExpenses =
    selectFuturePlannedExpenses(data);

  const completedPlannedExpenses =
    selectCompletedPlannedExpenses(
      data
    );

  const pendingPlannedExpenses =
    selectPendingPlannedExpenses(
      data
    );

  const activeGoals =
    selectActiveGoals(data);

  const totalActualExpenses =
    calculateActualExpenses(
      monthExpenses
    );

  const totalPlannedMonthExpenses =
    calculateTotalPlannedMonthExpenses(
      monthPlannedExpenses
    );

  const totalFuturePlannedExpenses =
    calculateTotalFuturePlannedExpenses(
      futurePlannedExpenses
    );

  const savedAmount =
    calculateSavedAmount(
      data.savingsTransfers,
      data.budgetMonth.id
    );

  const calculation =
    calculateBudget(
      data.budgetMonth,
      monthExpenses,
      totalFuturePlannedExpenses,
      savedAmount,
      currentDate,
      totalPlannedMonthExpenses
    );

  const scenarios =
    calculateForecastScenarios(
      calculation
    );

  const forecast: BudgetForecast = {
    currentBalance:
      calculation.remainingAmount,

    scenarios,

    probableEndBalance:
      scenarios.find(
        (scenario) =>
          scenario.name ===
          "probable"
      )?.projectedEndBalance ??
      calculation.forecastEndBalance,

    generatedAt:
      new Date().toISOString(),
  };

  const economyMode =
    calculateEconomyMode(
      calculation,
      data.budgetMonth
        .minimumEndBalance
    );

  const recentExpenses =
    selectRecentExpenses(
      monthExpenses
    );

  const categoryBudgets =
    selectCategoryBudgetStatuses(
      data.categories,
      monthExpenses
    );

  return {
    month:
      data.budgetMonth,

    calculation,

    forecast,

    economyMode,

    monthExpenses,

    categoryBudgets,

    recentExpenses,

    upcomingExpenses:
      futurePlannedExpenses,

    futurePlannedExpenses,

    completedPlannedExpenses,

    pendingPlannedExpenses,

    savingsTransfers:
      data.savingsTransfers,

    activeGoals,

    totalActualExpenses,

    totalPlannedMonthExpenses,

    totalFuturePlannedExpenses,
  };
}

export function buildDashboardData(
  data: BudgetDataSet,
  currentDate: Date = new Date()
): DashboardData {
  const viewModel =
    selectBudgetViewModel(
      data,
      currentDate
    );

  return {
    month:
      viewModel.month,

    calculation:
      viewModel.calculation,

    forecast:
      viewModel.forecast,

    activeGoals:
      viewModel.activeGoals,

    upcomingExpenses:
      viewModel.upcomingExpenses,

    recentExpenses:
      viewModel.recentExpenses,

    economyMode:
      viewModel.economyMode,
  };
}