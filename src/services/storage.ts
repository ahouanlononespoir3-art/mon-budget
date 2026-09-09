import type {
  BudgetMonth,
  Category,
  Expense,
  PlannedExpense,
  RecurringExpense,
  SavingsGoal,
  SavingsTransfer,
} from "../types/finance";

const STORAGE_KEYS = {
  initialized: "mon-budget:initialized",
  budgetMonth: "mon-budget:budget-month",
  categories: "mon-budget:categories",
  expenses: "mon-budget:expenses",
  plannedExpenses: "mon-budget:planned-expenses",
  recurringExpenses: "mon-budget:recurring-expenses",
  savingsGoals: "mon-budget:savings-goals",
  savingsTransfers: "mon-budget:savings-transfers",
} as const;

function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    console.error(
      `Impossible de lire les données "${key}".`,
      error
    );

    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(
      `Impossible d'enregistrer les données "${key}".`,
      error
    );
  }
}

export function getBudgetMonth(): BudgetMonth | null {
  return readStorage<BudgetMonth | null>(
    STORAGE_KEYS.budgetMonth,
    null
  );
}

export function saveBudgetMonth(
  budgetMonth: BudgetMonth
): void {
  writeStorage(
    STORAGE_KEYS.budgetMonth,
    budgetMonth
  );
}

export function getCategories(): Category[] {
  return readStorage<Category[]>(
    STORAGE_KEYS.categories,
    []
  );
}

export function saveCategories(
  categories: Category[]
): void {
  writeStorage(
    STORAGE_KEYS.categories,
    categories
  );
}

export function getExpenses(): Expense[] {
  return readStorage<Expense[]>(
    STORAGE_KEYS.expenses,
    []
  );
}

export function saveExpenses(
  expenses: Expense[]
): void {
  writeStorage(
    STORAGE_KEYS.expenses,
    expenses
  );
}

export function addExpense(
  expense: Expense
): Expense[] {
  const expenses = getExpenses();

  const updatedExpenses = [
    ...expenses,
    expense,
  ];

  saveExpenses(updatedExpenses);

  return updatedExpenses;
}

export function updateExpense(
  updatedExpense: Expense
): Expense[] {
  const expenses = getExpenses();

  const updatedExpenses = expenses.map(
    (expense) =>
      expense.id === updatedExpense.id
        ? updatedExpense
        : expense
  );

  saveExpenses(updatedExpenses);

  return updatedExpenses;
}

export function deleteExpense(
  expenseId: string
): Expense[] {
  const expenses = getExpenses();

  const updatedExpenses = expenses.filter(
    (expense) =>
      expense.id !== expenseId
  );

  saveExpenses(updatedExpenses);

  return updatedExpenses;
}

export function getPlannedExpenses(): PlannedExpense[] {
  return readStorage<PlannedExpense[]>(
    STORAGE_KEYS.plannedExpenses,
    []
  );
}

export function savePlannedExpenses(
  expenses: PlannedExpense[]
): void {
  writeStorage(
    STORAGE_KEYS.plannedExpenses,
    expenses
  );
}

export function addPlannedExpense(
  expense: PlannedExpense
): PlannedExpense[] {
  const expenses = getPlannedExpenses();

  const updatedExpenses = [
    ...expenses,
    expense,
  ];

  savePlannedExpenses(updatedExpenses);

  return updatedExpenses;
}

export function updatePlannedExpense(
  updatedExpense: PlannedExpense
): PlannedExpense[] {
  const expenses = getPlannedExpenses();

  const updatedExpenses = expenses.map(
    (expense) =>
      expense.id === updatedExpense.id
        ? updatedExpense
        : expense
  );

  savePlannedExpenses(updatedExpenses);

  return updatedExpenses;
}

export function deletePlannedExpense(
  expenseId: string
): PlannedExpense[] {
  const expenses = getPlannedExpenses();

  const updatedExpenses = expenses.filter(
    (expense) =>
      expense.id !== expenseId
  );

  savePlannedExpenses(updatedExpenses);

  return updatedExpenses;
}

export function getRecurringExpenses(): RecurringExpense[] {
  return readStorage<RecurringExpense[]>(
    STORAGE_KEYS.recurringExpenses,
    []
  );
}

export function saveRecurringExpenses(
  expenses: RecurringExpense[]
): void {
  writeStorage(
    STORAGE_KEYS.recurringExpenses,
    expenses
  );
}

export function addRecurringExpense(
  expense: RecurringExpense
): RecurringExpense[] {
  const expenses =
    getRecurringExpenses();

  const updatedExpenses = [
    ...expenses,
    expense,
  ];

  saveRecurringExpenses(
    updatedExpenses
  );

  return updatedExpenses;
}

export function updateRecurringExpense(
  updatedExpense: RecurringExpense
): RecurringExpense[] {
  const expenses =
    getRecurringExpenses();

  const updatedExpenses =
    expenses.map((expense) =>
      expense.id === updatedExpense.id
        ? updatedExpense
        : expense
    );

  saveRecurringExpenses(
    updatedExpenses
  );

  return updatedExpenses;
}

export function deleteRecurringExpense(
  expenseId: string
): RecurringExpense[] {
  const expenses =
    getRecurringExpenses();

  const updatedExpenses =
    expenses.filter(
      (expense) =>
        expense.id !== expenseId
    );

  saveRecurringExpenses(
    updatedExpenses
  );

  return updatedExpenses;
}

export function getSavingsGoals(): SavingsGoal[] {
  return readStorage<SavingsGoal[]>(
    STORAGE_KEYS.savingsGoals,
    []
  );
}

export function saveSavingsGoals(
  goals: SavingsGoal[]
): void {
  writeStorage(
    STORAGE_KEYS.savingsGoals,
    goals
  );
}

export function addSavingsGoal(
  goal: SavingsGoal
): SavingsGoal[] {
  const goals = getSavingsGoals();

  const updatedGoals = [
    ...goals,
    goal,
  ];

  saveSavingsGoals(updatedGoals);

  return updatedGoals;
}

export function updateSavingsGoal(
  updatedGoal: SavingsGoal
): SavingsGoal[] {
  const goals = getSavingsGoals();

  const updatedGoals = goals.map(
    (goal) =>
      goal.id === updatedGoal.id
        ? updatedGoal
        : goal
  );

  saveSavingsGoals(updatedGoals);

  return updatedGoals;
}

export function deleteSavingsGoal(
  goalId: string
): SavingsGoal[] {
  const goals = getSavingsGoals();

  const updatedGoals = goals.filter(
    (goal) => goal.id !== goalId
  );

  saveSavingsGoals(updatedGoals);

  return updatedGoals;
}

export function getSavingsTransfers(): SavingsTransfer[] {
  return readStorage<SavingsTransfer[]>(
    STORAGE_KEYS.savingsTransfers,
    []
  );
}

export function saveSavingsTransfers(
  transfers: SavingsTransfer[]
): void {
  writeStorage(
    STORAGE_KEYS.savingsTransfers,
    transfers
  );
}

export function addSavingsTransfer(
  transfer: SavingsTransfer
): SavingsTransfer[] {
  const transfers =
    getSavingsTransfers();

  const updatedTransfers = [
    ...transfers,
    transfer,
  ];

  saveSavingsTransfers(
    updatedTransfers
  );

  return updatedTransfers;
}

export function updateSavingsTransfer(
  updatedTransfer: SavingsTransfer
): SavingsTransfer[] {
  const transfers =
    getSavingsTransfers();

  const updatedTransfers =
    transfers.map((transfer) =>
      transfer.id === updatedTransfer.id
        ? updatedTransfer
        : transfer
    );

  saveSavingsTransfers(
    updatedTransfers
  );

  return updatedTransfers;
}

export function deleteSavingsTransfer(
  transferId: string
): SavingsTransfer[] {
  const transfers =
    getSavingsTransfers();

  const updatedTransfers =
    transfers.filter(
      (transfer) =>
        transfer.id !== transferId
    );

  saveSavingsTransfers(
    updatedTransfers
  );

  return updatedTransfers;
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

export function initializeDemoData(
  data: DemoStorageData
): void {
  const alreadyInitialized =
    localStorage.getItem(
      STORAGE_KEYS.initialized
    );

  if (alreadyInitialized === "true") {
    return;
  }

  if (!getBudgetMonth()) {
    saveBudgetMonth(data.budgetMonth);
  }

  if (
    localStorage.getItem(
      STORAGE_KEYS.categories
    ) === null
  ) {
    saveCategories(data.categories);
  }

  if (
    localStorage.getItem(
      STORAGE_KEYS.expenses
    ) === null
  ) {
    saveExpenses(data.expenses);
  }

  if (
    localStorage.getItem(
      STORAGE_KEYS.plannedExpenses
    ) === null
  ) {
    savePlannedExpenses(
      data.plannedExpenses
    );
  }

  if (
    localStorage.getItem(
      STORAGE_KEYS.recurringExpenses
    ) === null
  ) {
    saveRecurringExpenses(
      data.recurringExpenses ?? []
    );
  }

  if (
    localStorage.getItem(
      STORAGE_KEYS.savingsGoals
    ) === null
  ) {
    saveSavingsGoals(
      data.savingsGoals
    );
  }

  if (
    localStorage.getItem(
      STORAGE_KEYS.savingsTransfers
    ) === null
  ) {
    saveSavingsTransfers(
      data.savingsTransfers
    );
  }

  localStorage.setItem(
    STORAGE_KEYS.initialized,
    "true"
  );
}

export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach(
    (key) => {
      localStorage.removeItem(key);
    }
  );
}