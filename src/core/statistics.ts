import type { BudgetMonth, Category, Expense, PlannedExpense, SavingsTransfer } from "../types/finance";

export interface CategoryStatistic {
  categoryId: string;
  name: string;
  total: number;
  percentage: number;
}

export interface TimeStatistic {
  label: string;
  total: number;
}

export interface BalancePoint {
  label: string;
  balance: number;
}

function netAmount(expense: Expense): number {
  return Math.max(0, Math.round(expense.amount - expense.refundedAmount));
}

export function selectMonthExpenses(expenses: Expense[], month: BudgetMonth): Expense[] {
  return expenses.filter((expense) => expense.budgetMonthId === month.id && expense.date >= month.startDate && expense.date <= month.endDate);
}

export function buildCategoryStatistics(expenses: Expense[], categories: Category[]): CategoryStatistic[] {
  const totals = new Map<string, number>();
  expenses.forEach((expense) => totals.set(expense.categoryId, (totals.get(expense.categoryId) ?? 0) + netAmount(expense)));
  const total = [...totals.values()].reduce((sum, amount) => sum + amount, 0);
  return [...totals.entries()].map(([categoryId, amount]) => ({
    categoryId,
    name: categories.find((category) => category.id === categoryId)?.name ?? "Sans catégorie",
    total: amount,
    percentage: total > 0 ? (amount / total) * 100 : 0,
  })).sort((a, b) => b.total - a.total);
}

export function buildDailyStatistics(expenses: Expense[]): TimeStatistic[] {
  const totals = new Map<string, number>();
  expenses.forEach((expense) => totals.set(expense.date, (totals.get(expense.date) ?? 0) + netAmount(expense)));
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, total]) => ({ label, total }));
}

export function buildWeeklyStatistics(expenses: Expense[]): TimeStatistic[] {
  const totals = new Map<string, number>();
  expenses.forEach((expense) => {
    const date = new Date(`${expense.date}T00:00:00`);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
    const label = date.toISOString().slice(0, 10);
    totals.set(label, (totals.get(label) ?? 0) + netAmount(expense));
  });
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, total]) => ({ label, total }));
}

export function buildMonthlyStatistics(expenses: Expense[]): TimeStatistic[] {
  const totals = new Map<string, number>();
  expenses.forEach((expense) => {
    const label = expense.date.slice(0, 7);
    totals.set(label, (totals.get(label) ?? 0) + netAmount(expense));
  });
  return [...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, total]) => ({ label, total }));
}

export function buildBalanceEvolution(month: BudgetMonth, expenses: Expense[], transfers: SavingsTransfer[]): BalancePoint[] {
  const monthExpenses = selectMonthExpenses(expenses, month);
  const days = new Set([...monthExpenses.map((expense) => expense.date), ...transfers.filter((transfer) => transfer.budgetMonthId === month.id).map((transfer) => transfer.date)]);
  let balance = month.totalBudget - month.reservedAmount;
  return [...days].sort().map((label) => {
    balance -= monthExpenses.filter((expense) => expense.date === label).reduce((sum, expense) => sum + netAmount(expense), 0);
    balance -= transfers.filter((transfer) => transfer.budgetMonthId === month.id && transfer.date === label).reduce((sum, transfer) => sum + Math.max(0, transfer.amount), 0);
    return { label, balance };
  });
}

export function calculatePlannedVariance(plannedExpenses: PlannedExpense[]): number {
  return plannedExpenses.filter((expense) => expense.status !== "cancelled" && expense.status !== "postponed").reduce((sum, expense) => sum + Math.max(0, (expense.actualAmount ?? expense.amount) - expense.amount), 0);
}
