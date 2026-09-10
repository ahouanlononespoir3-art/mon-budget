import { addMonths, endOfMonth, startOfMonth } from "date-fns";

import type { BudgetMonth, Expense, MonthlySummary, PlannedExpense, SavingsTransfer } from "../types/finance";
import { addBudgetMonth, getBudgetMonths, getExpenses, getMonthlySummaries, getPlannedExpenses, getSavingsTransfers, saveBudgetMonth, saveBudgetMonths, saveMonthlySummaries } from "./storage";

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getEffectiveExpenseAmount(expense: Expense): number {
  return Math.max(0, Math.round(expense.amount - expense.refundedAmount));
}

function getMonthExpenses(month: BudgetMonth, expenses: Expense[]): Expense[] {
  return expenses.filter((expense) => expense.budgetMonthId === month.id && expense.date >= month.startDate && expense.date <= month.endDate);
}

function getMonthPlannedExpenses(month: BudgetMonth, expenses: PlannedExpense[]): PlannedExpense[] {
  return expenses.filter((expense) => expense.budgetMonthId === month.id && expense.plannedDate >= month.startDate && expense.plannedDate <= month.endDate);
}

function calculateRisk(remaining: number, minimumEndBalance: number): "green" | "orange" | "red" {
  if (remaining < 0) return "red";
  if (remaining < minimumEndBalance) return "orange";
  return "green";
}

export function createMonthlySummary(month: BudgetMonth, expenses: Expense[], plannedExpenses: PlannedExpense[], savingsTransfers: SavingsTransfer[]): MonthlySummary {
  const monthExpenses = getMonthExpenses(month, expenses);
  const monthPlannedExpenses = getMonthPlannedExpenses(month, plannedExpenses);
  const actualExpenses = monthExpenses.reduce((total, expense) => total + getEffectiveExpenseAmount(expense), 0);
  const plannedAmount = monthPlannedExpenses.filter((expense) => expense.status !== "cancelled" && expense.status !== "postponed").reduce((total, expense) => total + Math.max(0, Math.round(expense.actualAmount ?? expense.amount)), 0);
  const savedAmount = savingsTransfers.filter((transfer) => transfer.budgetMonthId === month.id).reduce((total, transfer) => total + Math.max(0, Math.round(transfer.amount)), 0);
  const remainingAmount = month.totalBudget - actualExpenses - month.reservedAmount - savedAmount;
  const categoryTotals = new Map<string, number>();
  const dailyTotals = new Map<string, number>();
  for (const expense of monthExpenses) {
    const amount = getEffectiveExpenseAmount(expense);
    categoryTotals.set(expense.categoryId, (categoryTotals.get(expense.categoryId) ?? 0) + amount);
    dailyTotals.set(expense.date, (dailyTotals.get(expense.date) ?? 0) + amount);
  }
  const topCategoryId = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const highestSpendingDay = [...dailyTotals.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  return {
    budgetMonthId: month.id,
    initialBudget: month.initialBudget,
    carryOver: month.carryOver,
    totalBudget: month.totalBudget,
    plannedExpenses: plannedAmount,
    actualExpenses,
    reservedAmount: month.reservedAmount,
    savedAmount,
    remainingAmount,
    expectedRemainingAmount: Math.max(0, remainingAmount),
    varianceAmount: actualExpenses - plannedAmount,
    expenseCount: monthExpenses.length,
    topCategoryId,
    highestSpendingDay,
    status: calculateRisk(remainingAmount, month.minimumEndBalance),
    closedAt: new Date().toISOString(),
  };
}

function createNextMonth(currentMonth: BudgetMonth, carryOver: number): BudgetMonth {
  const nextStart = startOfMonth(addMonths(new Date(`${currentMonth.startDate}T00:00:00`), 1));
  const nextEnd = endOfMonth(nextStart);
  const now = new Date().toISOString();
  const initialBudget = Math.max(0, Math.round(currentMonth.initialBudget));
  const safeCarryOver = Math.max(0, Math.round(carryOver));
  return {
    id: `month-${toISODate(nextStart).slice(0, 7)}`,
    startDate: toISODate(nextStart),
    endDate: toISODate(nextEnd),
    currency: currentMonth.currency,
    initialBudget,
    carryOver: safeCarryOver,
    totalBudget: initialBudget + safeCarryOver,
    reservedAmount: 0,
    minimumEndBalance: currentMonth.minimumEndBalance,
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
}

export interface RolloverResult {
  changed: boolean;
  previousMonth: BudgetMonth;
  currentMonth: BudgetMonth;
  summary?: MonthlySummary;
}

export function performAutomaticMonthRollover(currentMonth: BudgetMonth, currentDate = new Date()): RolloverResult {
  if (toISODate(currentDate) <= currentMonth.endDate) {
    return { changed: false, previousMonth: currentMonth, currentMonth };
  }
  const summary = createMonthlySummary(currentMonth, getExpenses(), getPlannedExpenses(), getSavingsTransfers());
  const summaries = getMonthlySummaries();
  const updatedSummaries = summaries.some((item) => item.budgetMonthId === currentMonth.id)
    ? summaries.map((item) => item.budgetMonthId === currentMonth.id ? summary : item)
    : [...summaries, summary];
  saveMonthlySummaries(updatedSummaries);
  const closedMonth: BudgetMonth = { ...currentMonth, status: "closed", updatedAt: new Date().toISOString() };
  saveBudgetMonth(closedMonth);
  const months = getBudgetMonths().map((month) => month.id === closedMonth.id ? closedMonth : month);
  const nextMonth = createNextMonth(closedMonth, Math.max(0, summary.remainingAmount));
  const updatedMonths = months.some((month) => month.id === nextMonth.id) ? months : [...months, nextMonth];
  saveBudgetMonths(updatedMonths);
  addBudgetMonth(nextMonth);
  saveBudgetMonth(nextMonth);
  return { changed: true, previousMonth: closedMonth, currentMonth: nextMonth, summary };
}
