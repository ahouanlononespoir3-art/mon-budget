import type { BudgetSettings } from "../types/finance";
import { defaultBudgetSettings } from "../types/settings";

import type {
  BudgetMonth,
  Category,
  Expense,
  FuturePurchase,
  MonthlySummary,
  PlannedExpense,
  RecurringExpense,
  SavingsGoal,
  SavingsTransfer,
} from "../types/finance";

const STORAGE_KEYS = {
  initialized: "mon-budget:initialized",
  budgetMonth: "mon-budget:budget-month",
  budgetMonths: "mon-budget:budget-months",
  monthlySummaries: "mon-budget:monthly-summaries",
  categories: "mon-budget:categories",
  expenses: "mon-budget:expenses",
  plannedExpenses: "mon-budget:planned-expenses",
  recurringExpenses: "mon-budget:recurring-expenses",
  savingsGoals: "mon-budget:savings-goals",
  savingsTransfers: "mon-budget:savings-transfers",
  futurePurchases: "mon-budget:future-purchases",
  settings: "mon-budget:settings",
  onboardingCompleted: "mon-budget:onboarding-completed",
} as const;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value) as T;
  } catch (error) {
    console.error(`Impossible de lire les données "${key}".`, error);
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("mon-budget:data-changed", {
          detail: { key },
        })
      );
    }
  } catch (error) {
    console.error(`Impossible d'enregistrer les données "${key}".`, error);
  }
}

export function getBudgetMonth(): BudgetMonth | null {
  return readStorage<BudgetMonth | null>(STORAGE_KEYS.budgetMonth, null);
}

export function saveBudgetMonth(budgetMonth: BudgetMonth): void {
  writeStorage(STORAGE_KEYS.budgetMonth, budgetMonth);
}

export function getBudgetMonths(): BudgetMonth[] {
  return readStorage<BudgetMonth[]>(STORAGE_KEYS.budgetMonths, []);
}

export function saveBudgetMonths(months: BudgetMonth[]): void {
  writeStorage(STORAGE_KEYS.budgetMonths, months);
}

export function addBudgetMonth(budgetMonth: BudgetMonth): BudgetMonth[] {
  const months = getBudgetMonths();
  const existingIndex = months.findIndex((month) => month.id === budgetMonth.id);
  const updated = existingIndex >= 0
    ? months.map((month) => month.id === budgetMonth.id ? budgetMonth : month)
    : [...months, budgetMonth];
  saveBudgetMonths(updated);
  return updated;
}

export function getMonthlySummaries(): MonthlySummary[] {
  return readStorage<MonthlySummary[]>(STORAGE_KEYS.monthlySummaries, []);
}

export function saveMonthlySummaries(summaries: MonthlySummary[]): void {
  writeStorage(STORAGE_KEYS.monthlySummaries, summaries);
}

export function saveMonthlySummary(summary: MonthlySummary): MonthlySummary[] {
  const summaries = getMonthlySummaries();
  const existingIndex = summaries.findIndex((item) => item.budgetMonthId === summary.budgetMonthId);
  const updated = existingIndex >= 0
    ? summaries.map((item) => item.budgetMonthId === summary.budgetMonthId ? summary : item)
    : [...summaries, summary];
  saveMonthlySummaries(updated);
  return updated;
}

export function getCategories(): Category[] {
  return readStorage<Category[]>(STORAGE_KEYS.categories, []);
}

export function saveCategories(categories: Category[]): void {
  writeStorage(STORAGE_KEYS.categories, categories);
}

export function getExpenses(): Expense[] {
  return readStorage<Expense[]>(STORAGE_KEYS.expenses, []);
}

export function saveExpenses(expenses: Expense[]): void {
  writeStorage(STORAGE_KEYS.expenses, expenses);
}

export function addExpense(expense: Expense): Expense[] {
  const updated = [...getExpenses(), expense];
  saveExpenses(updated);
  return updated;
}

export function updateExpense(updatedExpense: Expense): Expense[] {
  const updated = getExpenses().map((expense) => expense.id === updatedExpense.id ? updatedExpense : expense);
  saveExpenses(updated);
  return updated;
}

export function deleteExpense(expenseId: string): Expense[] {
  const updated = getExpenses().filter((expense) => expense.id !== expenseId);
  saveExpenses(updated);
  return updated;
}

export function getPlannedExpenses(): PlannedExpense[] {
  return readStorage<PlannedExpense[]>(STORAGE_KEYS.plannedExpenses, []);
}

export function savePlannedExpenses(expenses: PlannedExpense[]): void {
  writeStorage(STORAGE_KEYS.plannedExpenses, expenses);
}

export function addPlannedExpense(expense: PlannedExpense): PlannedExpense[] {
  const updated = [...getPlannedExpenses(), expense];
  savePlannedExpenses(updated);
  return updated;
}

export function updatePlannedExpense(updatedExpense: PlannedExpense): PlannedExpense[] {
  const updated = getPlannedExpenses().map((expense) => expense.id === updatedExpense.id ? updatedExpense : expense);
  savePlannedExpenses(updated);
  return updated;
}

export function deletePlannedExpense(expenseId: string): PlannedExpense[] {
  const updated = getPlannedExpenses().filter((expense) => expense.id !== expenseId);
  savePlannedExpenses(updated);
  return updated;
}

export function getRecurringExpenses(): RecurringExpense[] {
  return readStorage<RecurringExpense[]>(STORAGE_KEYS.recurringExpenses, []);
}

export function saveRecurringExpenses(expenses: RecurringExpense[]): void {
  writeStorage(STORAGE_KEYS.recurringExpenses, expenses);
}

export function addRecurringExpense(expense: RecurringExpense): RecurringExpense[] {
  const updated = [...getRecurringExpenses(), expense];
  saveRecurringExpenses(updated);
  return updated;
}

export function updateRecurringExpense(updatedExpense: RecurringExpense): RecurringExpense[] {
  const updated = getRecurringExpenses().map((expense) => expense.id === updatedExpense.id ? updatedExpense : expense);
  saveRecurringExpenses(updated);
  return updated;
}

export function deleteRecurringExpense(expenseId: string): RecurringExpense[] {
  const updated = getRecurringExpenses().filter((expense) => expense.id !== expenseId);
  saveRecurringExpenses(updated);
  return updated;
}

export function getSavingsGoals(): SavingsGoal[] {
  return readStorage<SavingsGoal[]>(STORAGE_KEYS.savingsGoals, []);
}

export function saveSavingsGoals(goals: SavingsGoal[]): void {
  writeStorage(STORAGE_KEYS.savingsGoals, goals);
}

export function addSavingsGoal(goal: SavingsGoal): SavingsGoal[] {
  const updated = [...getSavingsGoals(), goal];
  saveSavingsGoals(updated);
  return updated;
}

export function updateSavingsGoal(updatedGoal: SavingsGoal): SavingsGoal[] {
  const updated = getSavingsGoals().map((goal) => goal.id === updatedGoal.id ? updatedGoal : goal);
  saveSavingsGoals(updated);
  return updated;
}

export function deleteSavingsGoal(goalId: string): SavingsGoal[] {
  const updated = getSavingsGoals().filter((goal) => goal.id !== goalId);
  saveSavingsGoals(updated);
  return updated;
}

export function getSavingsTransfers(): SavingsTransfer[] {
  return readStorage<SavingsTransfer[]>(STORAGE_KEYS.savingsTransfers, []);
}

export function saveSavingsTransfers(transfers: SavingsTransfer[]): void {
  writeStorage(STORAGE_KEYS.savingsTransfers, transfers);
}

export function addSavingsTransfer(transfer: SavingsTransfer): SavingsTransfer[] {
  const updated = [...getSavingsTransfers(), transfer];
  saveSavingsTransfers(updated);
  return updated;
}

export function updateSavingsTransfer(updatedTransfer: SavingsTransfer): SavingsTransfer[] {
  const updated = getSavingsTransfers().map((transfer) => transfer.id === updatedTransfer.id ? updatedTransfer : transfer);
  saveSavingsTransfers(updated);
  return updated;
}

export function deleteSavingsTransfer(transferId: string): SavingsTransfer[] {
  const updated = getSavingsTransfers().filter((transfer) => transfer.id !== transferId);
  saveSavingsTransfers(updated);
  return updated;
}

export function getFuturePurchases(): FuturePurchase[] {
  return readStorage<FuturePurchase[]>(STORAGE_KEYS.futurePurchases, []);
}

export function saveFuturePurchases(purchases: FuturePurchase[]): void {
  writeStorage(STORAGE_KEYS.futurePurchases, purchases);
}

export function addFuturePurchase(purchase: FuturePurchase): FuturePurchase[] {
  const updated = [...getFuturePurchases(), purchase];
  saveFuturePurchases(updated);
  return updated;
}

export function updateFuturePurchase(updatedPurchase: FuturePurchase): FuturePurchase[] {
  const updated = getFuturePurchases().map((purchase) => purchase.id === updatedPurchase.id ? updatedPurchase : purchase);
  saveFuturePurchases(updated);
  return updated;
}

export function deleteFuturePurchase(purchaseId: string): FuturePurchase[] {
  const updated = getFuturePurchases().filter((purchase) => purchase.id !== purchaseId);
  saveFuturePurchases(updated);
  return updated;
}

export interface DemoStorageData {
  budgetMonth: BudgetMonth;
  categories: Category[];
  expenses: Expense[];
  plannedExpenses: PlannedExpense[];
  recurringExpenses?: RecurringExpense[];
  savingsGoals: SavingsGoal[];
  savingsTransfers: SavingsTransfer[];
}

export function initializeDemoData(data: DemoStorageData): void {
  if (localStorage.getItem(STORAGE_KEYS.initialized) === "true") return;
  if (!getBudgetMonth()) saveBudgetMonth(data.budgetMonth);
  if (localStorage.getItem(STORAGE_KEYS.categories) === null) saveCategories(data.categories);
  if (localStorage.getItem(STORAGE_KEYS.expenses) === null) saveExpenses(data.expenses);
  if (localStorage.getItem(STORAGE_KEYS.plannedExpenses) === null) savePlannedExpenses(data.plannedExpenses);
  if (localStorage.getItem(STORAGE_KEYS.recurringExpenses) === null) saveRecurringExpenses(data.recurringExpenses ?? []);
  if (localStorage.getItem(STORAGE_KEYS.savingsGoals) === null) saveSavingsGoals(data.savingsGoals);
  if (localStorage.getItem(STORAGE_KEYS.savingsTransfers) === null) saveSavingsTransfers(data.savingsTransfers);
  if (localStorage.getItem(STORAGE_KEYS.futurePurchases) === null) saveFuturePurchases([]);
  const months = getBudgetMonths();
  if (!months.some((month) => month.id === data.budgetMonth.id)) saveBudgetMonths([...months, data.budgetMonth]);
  localStorage.setItem(STORAGE_KEYS.initialized, "true");
}

export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
}

export function getSettings(): BudgetSettings {
  const stored = localStorage.getItem(STORAGE_KEYS.settings);
  if (!stored) return defaultBudgetSettings;
  try {
    return { ...defaultBudgetSettings, ...(JSON.parse(stored) as Partial<BudgetSettings>) };
  } catch {
    return defaultBudgetSettings;
  }
}

export function saveSettings(settings: BudgetSettings): void {
  writeStorage(STORAGE_KEYS.settings, settings);
}

export function isOnboardingCompleted(): boolean {
  return localStorage.getItem(STORAGE_KEYS.onboardingCompleted) === "true";
}

export function setOnboardingCompleted(completed: boolean): void {
  localStorage.setItem(STORAGE_KEYS.onboardingCompleted, String(completed));
}
