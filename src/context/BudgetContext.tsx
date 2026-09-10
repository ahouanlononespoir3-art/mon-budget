import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  addExpense as storageAddExpense,
  addFuturePurchase as storageAddFuturePurchase,
  addPlannedExpense as storageAddPlannedExpense,
  addRecurringExpense as storageAddRecurringExpense,
  addSavingsGoal as storageAddSavingsGoal,
  addSavingsTransfer as storageAddSavingsTransfer,
  deleteExpense as storageDeleteExpense,
  deleteFuturePurchase as storageDeleteFuturePurchase,
  deletePlannedExpense as storageDeletePlannedExpense,
  deleteRecurringExpense as storageDeleteRecurringExpense,
  deleteSavingsGoal as storageDeleteSavingsGoal,
  deleteSavingsTransfer as storageDeleteSavingsTransfer,
  getBudgetMonth,
  getCategories,
  getExpenses,
  getFuturePurchases,
  getPlannedExpenses,
  getRecurringExpenses,
  getSavingsGoals,
  getSavingsTransfers,
  getSettings,
  initializeDemoData,
  savePlannedExpenses,
  saveBudgetMonth,
  saveCategories,
  updateExpense as storageUpdateExpense,
  updateFuturePurchase as storageUpdateFuturePurchase,
  updatePlannedExpense as storageUpdatePlannedExpense,
  updateRecurringExpense as storageUpdateRecurringExpense,
  updateSavingsGoal as storageUpdateSavingsGoal,
  updateSavingsTransfer as storageUpdateSavingsTransfer,
} from "../services/storage";

import { performAutomaticMonthRollover } from "../services/monthService";

import { generateRecurringExpenses } from "../services/recurringExpenseService";

import {
  demoBudgetMonth,
  demoCategories,
  demoExpenses,
  demoPlannedExpenses,
  demoRecurringExpenses,
  demoSavingsGoals,
  demoSavingsTransfers,
} from "../data/demoData";

import type {
  BudgetMonth,
  Category,
  Expense,
  FuturePurchase,
  PlannedExpense,
  RecurringExpense,
  SavingsGoal,
  SavingsTransfer,
} from "../types/finance";

interface BudgetContextValue {
  budgetMonth: BudgetMonth;
  categories: Category[];
  expenses: Expense[];
  plannedExpenses: PlannedExpense[];
  recurringExpenses: RecurringExpense[];
  savingsGoals: SavingsGoal[];
  savingsTransfers: SavingsTransfer[];
  futurePurchases: FuturePurchase[];

  updateBudgetMonth: (
    budgetMonth: BudgetMonth
  ) => void;

  updateCategories: (
    categories: Category[]
  ) => void;

  addExpense: (
    expense: Expense
  ) => void;

  updateExpense: (
    expense: Expense
  ) => void;

  deleteExpense: (
    expenseId: string
  ) => void;

  addPlannedExpense: (
    expense: PlannedExpense
  ) => void;

  updatePlannedExpense: (
    expense: PlannedExpense
  ) => void;

  deletePlannedExpense: (
    expenseId: string
  ) => void;

  addRecurringExpense: (
    expense: RecurringExpense
  ) => void;

  updateRecurringExpense: (
    expense: RecurringExpense
  ) => void;

  deleteRecurringExpense: (
    expenseId: string
  ) => void;

  addSavingsGoal: (
    goal: SavingsGoal
  ) => void;

  updateSavingsGoal: (
    goal: SavingsGoal
  ) => void;

  deleteSavingsGoal: (
    goalId: string
  ) => void;

  addSavingsTransfer: (
    transfer: SavingsTransfer
  ) => void;

  updateSavingsTransfer: (
    transfer: SavingsTransfer
  ) => void;

  deleteSavingsTransfer: (
    transferId: string
  ) => void;

  addFuturePurchase: (purchase: FuturePurchase) => void;
  updateFuturePurchase: (purchase: FuturePurchase) => void;
  deleteFuturePurchase: (purchaseId: string) => void;

  refreshData: () => void;
}

const BudgetContext =
  createContext<
    BudgetContextValue | undefined
  >(undefined);

export function BudgetProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [budgetMonth, setBudgetMonth] =
    useState<BudgetMonth>(
      demoBudgetMonth
    );

  const [categories, setCategories] =
    useState<Category[]>(
      demoCategories
    );

  const [expenses, setExpenses] =
    useState<Expense[]>(
      demoExpenses
    );

  const [
    plannedExpenses,
    setPlannedExpenses,
  ] = useState<PlannedExpense[]>(
    demoPlannedExpenses
  );

  const [
    recurringExpenses,
    setRecurringExpenses,
  ] = useState<RecurringExpense[]>(
    demoRecurringExpenses
  );

  const [
    savingsGoals,
    setSavingsGoals,
  ] = useState<SavingsGoal[]>(
    demoSavingsGoals
  );

  const [
    savingsTransfers,
    setSavingsTransfers,
  ] = useState<SavingsTransfer[]>(
    demoSavingsTransfers
  );

  const [futurePurchases, setFuturePurchases] =
    useState<FuturePurchase[]>([]);

  const loadData = useCallback(() => {
    const storedBudgetMonth = getBudgetMonth();
    const settings = getSettings();
    const baseBudgetMonth =
      storedBudgetMonth ?? demoBudgetMonth;
    let configuredBudgetMonth: BudgetMonth = {
      ...baseBudgetMonth,
      currency: settings.currency,
      initialBudget: settings.usualMonthlyAmount,
      minimumEndBalance: settings.minimumEndBalance,
      totalBudget:
        settings.usualMonthlyAmount +
        Math.max(0, baseBudgetMonth.carryOver),
    };

    const rollover = performAutomaticMonthRollover(configuredBudgetMonth);
    if (rollover.changed) {
      configuredBudgetMonth = rollover.currentMonth;
    }

    const storedCategories =
      getCategories();

    const storedExpenses =
      getExpenses();

    const storedPlannedExpenses =
      getPlannedExpenses();

    const storedRecurringExpenses =
      getRecurringExpenses();

    const storedSavingsGoals =
      getSavingsGoals();

    const storedSavingsTransfers =
      getSavingsTransfers();

    const storedFuturePurchases =
      getFuturePurchases();

    setBudgetMonth(configuredBudgetMonth);
    saveBudgetMonth(configuredBudgetMonth);

    setCategories(
      storedCategories.length > 0
        ? storedCategories
        : demoCategories
    );

    setExpenses(
      storedExpenses
    );

    const generatedPlannedExpenses = generateRecurringExpenses(
      {
        budgetMonthId: configuredBudgetMonth.id,
        monthStart: configuredBudgetMonth.startDate,
        monthEnd: configuredBudgetMonth.endDate,
        existingPlannedExpenses: storedPlannedExpenses,
      },
      storedRecurringExpenses
    );
    const allPlannedExpenses = [
      ...storedPlannedExpenses,
      ...generatedPlannedExpenses,
    ];
    savePlannedExpenses(allPlannedExpenses);
    setPlannedExpenses(allPlannedExpenses);

    setRecurringExpenses(
      storedRecurringExpenses
    );

    setSavingsGoals(
      storedSavingsGoals
    );

    setSavingsTransfers(
      storedSavingsTransfers
    );

    setFuturePurchases(storedFuturePurchases);
  }, []);

  useEffect(() => {
    initializeDemoData({
      budgetMonth: demoBudgetMonth,
      categories: demoCategories,
      expenses: demoExpenses,
      plannedExpenses:
        demoPlannedExpenses,
      recurringExpenses:
        demoRecurringExpenses,
      savingsGoals:
        demoSavingsGoals,
      savingsTransfers:
        demoSavingsTransfers,
    });

    loadData();
  }, [loadData]);

  const updateBudgetMonth =
    useCallback(
      (updatedBudgetMonth: BudgetMonth) => {
        setBudgetMonth(
          updatedBudgetMonth
        );

        saveBudgetMonth(
          updatedBudgetMonth
        );
      },
      []
    );

  const updateCategories =
    useCallback(
      (updatedCategories: Category[]) => {
        setCategories(
          updatedCategories
        );

        saveCategories(
          updatedCategories
        );
      },
      []
    );

  const addExpense = useCallback(
    (expense: Expense) => {
      setExpenses(
        storageAddExpense(expense)
      );
    },
    []
  );

  const updateExpense =
    useCallback(
      (expense: Expense) => {
        setExpenses(
          storageUpdateExpense(expense)
        );
      },
      []
    );

  const deleteExpense =
    useCallback(
      (expenseId: string) => {
        setExpenses(
          storageDeleteExpense(
            expenseId
          )
        );
      },
      []
    );

  const addPlannedExpense =
    useCallback(
      (expense: PlannedExpense) => {
        setPlannedExpenses(
          storageAddPlannedExpense(
            expense
          )
        );
      },
      []
    );

  const updatePlannedExpense =
    useCallback(
      (expense: PlannedExpense) => {
        setPlannedExpenses(
          storageUpdatePlannedExpense(
            expense
          )
        );
      },
      []
    );

  const deletePlannedExpense =
    useCallback(
      (expenseId: string) => {
        setPlannedExpenses(
          storageDeletePlannedExpense(
            expenseId
          )
        );
      },
      []
    );

  const addRecurringExpense =
    useCallback(
      (expense: RecurringExpense) => {
        setRecurringExpenses(
          storageAddRecurringExpense(
            expense
          )
        );
      },
      []
    );

  const updateRecurringExpense =
    useCallback(
      (expense: RecurringExpense) => {
        setRecurringExpenses(
          storageUpdateRecurringExpense(
            expense
          )
        );
      },
      []
    );

  const deleteRecurringExpense =
    useCallback(
      (expenseId: string) => {
        setRecurringExpenses(
          storageDeleteRecurringExpense(
            expenseId
          )
        );
      },
      []
    );

  const addSavingsGoal =
    useCallback(
      (goal: SavingsGoal) => {
        setSavingsGoals(
          storageAddSavingsGoal(goal)
        );
      },
      []
    );

  const updateSavingsGoal =
    useCallback(
      (goal: SavingsGoal) => {
        setSavingsGoals(
          storageUpdateSavingsGoal(goal)
        );
      },
      []
    );

  const deleteSavingsGoal =
    useCallback(
      (goalId: string) => {
        setSavingsGoals(
          storageDeleteSavingsGoal(
            goalId
          )
        );
      },
      []
    );

  const addSavingsTransfer =
    useCallback(
      (transfer: SavingsTransfer) => {
        setSavingsTransfers(
          storageAddSavingsTransfer(
            transfer
          )
        );
      },
      []
    );

  const updateSavingsTransfer =
    useCallback(
      (transfer: SavingsTransfer) => {
        setSavingsTransfers(
          storageUpdateSavingsTransfer(
            transfer
          )
        );
      },
      []
    );

  const deleteSavingsTransfer =
    useCallback(
      (transferId: string) => {
        setSavingsTransfers(
          storageDeleteSavingsTransfer(
            transferId
          )
        );
      },
      []
    );

  const addFuturePurchase = useCallback(
    (purchase: FuturePurchase) => {
      setFuturePurchases(storageAddFuturePurchase(purchase));
    },
    []
  );

  const updateFuturePurchase = useCallback(
    (purchase: FuturePurchase) => {
      setFuturePurchases(storageUpdateFuturePurchase(purchase));
    },
    []
  );

  const deleteFuturePurchase = useCallback(
    (purchaseId: string) => {
      setFuturePurchases(storageDeleteFuturePurchase(purchaseId));
    },
    []
  );

  const refreshData =
    useCallback(() => {
      loadData();
    }, [loadData]);

  const value =
    useMemo<BudgetContextValue>(
      () => ({
        budgetMonth,
        categories,
        expenses,
        plannedExpenses,
        recurringExpenses,
        savingsGoals,
        savingsTransfers,
        futurePurchases,

        updateBudgetMonth,
        updateCategories,

        addExpense,
        updateExpense,
        deleteExpense,

        addPlannedExpense,
        updatePlannedExpense,
        deletePlannedExpense,

        addRecurringExpense,
        updateRecurringExpense,
        deleteRecurringExpense,

        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,

        addSavingsTransfer,
        updateSavingsTransfer,
        deleteSavingsTransfer,

        addFuturePurchase,
        updateFuturePurchase,
        deleteFuturePurchase,

        refreshData,
      }),
      [
        budgetMonth,
        categories,
        expenses,
        plannedExpenses,
        recurringExpenses,
        savingsGoals,
        savingsTransfers,
        futurePurchases,

        updateBudgetMonth,
        updateCategories,

        addExpense,
        updateExpense,
        deleteExpense,

        addPlannedExpense,
        updatePlannedExpense,
        deletePlannedExpense,

        addRecurringExpense,
        updateRecurringExpense,
        deleteRecurringExpense,

        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,

        addSavingsTransfer,
        updateSavingsTransfer,
        deleteSavingsTransfer,

        addFuturePurchase,
        updateFuturePurchase,
        deleteFuturePurchase,

        refreshData,
      ]
    );

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget(): BudgetContextValue {
  const context =
    useContext(BudgetContext);

  if (!context) {
    throw new Error(
      "useBudget doit être utilisé à l'intérieur de BudgetProvider."
    );
  }

  return context;
}