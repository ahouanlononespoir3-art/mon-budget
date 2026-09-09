import type {
  BudgetMonth,
  Category,
  Expense,
  PlannedExpense,
  RecurringExpense,
  SavingsGoal,
  SavingsTransfer,
} from "../types/finance";

/**
 * Catégories de démonstration
 */
export const demoCategories: Category[] = [
  {
    id: "housing",
    name: "Logement",
    active: true,
    monthlyLimit: 60000,
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "food",
    name: "Alimentation",
    active: true,
    monthlyLimit: 50000,
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "transport",
    name: "Transport",
    active: true,
    monthlyLimit: 30000,
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "internet",
    name: "Internet",
    active: true,
    monthlyLimit: 15000,
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "utilities",
    name: "Électricité",
    active: true,
    monthlyLimit: 20000,
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T08:00:00Z",
  },
];

/**
 * Mois budgétaire de démonstration
 */
export const demoBudgetMonth: BudgetMonth = {
  id: "month-2026-09",
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  currency: "XOF",
  initialBudget: 250000,
  carryOver: 20000,
  totalBudget: 270000,
  reservedAmount: 10000,
  minimumEndBalance: 30000,
  status: "open",
  createdAt: "2026-09-01T08:00:00Z",
  updatedAt: "2026-09-01T08:00:00Z",
};

/**
 * Dépenses récurrentes de démonstration.
 *
 * Une dépense récurrente est une RÈGLE.
 * Elle sert à générer automatiquement des dépenses prévues.
 *
 * Elle ne devient une dépense réelle que lorsqu'elle est effectivement payée.
 */
export const demoRecurringExpenses: RecurringExpense[] = [
  {
    id: "recurring-rent",
    name: "Loyer",
    amount: 50000,
    categoryId: "housing",
    frequency: "monthly",
    nextDate: "2026-10-05",
    startDate: "2026-09-05",
    mandatory: true,
    active: true,
    note: "Loyer mensuel",
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "recurring-internet",
    name: "Internet",
    amount: 10000,
    categoryId: "internet",
    frequency: "monthly",
    nextDate: "2026-09-20",
    startDate: "2026-09-20",
    mandatory: true,
    active: true,
    note: "Abonnement internet mensuel",
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "recurring-electricity",
    name: "Électricité",
    amount: 15000,
    categoryId: "utilities",
    frequency: "monthly",
    nextDate: "2026-09-25",
    startDate: "2026-09-25",
    mandatory: true,
    active: true,
    note: "Estimation de la facture mensuelle",
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T08:00:00Z",
  },
];

/**
 * Dépenses réelles déjà effectuées
 */
export const demoExpenses: Expense[] = [
  {
    id: "expense-1",
    budgetMonthId: "month-2026-09",
    amount: 50000,
    description: "Loyer",
    categoryId: "housing",
    date: "2026-09-05",
    refundedAmount: 0,
    createdAt: "2026-09-05T10:00:00Z",
    updatedAt: "2026-09-05T10:00:00Z",
  },
  {
    id: "expense-2",
    budgetMonthId: "month-2026-09",
    amount: 20000,
    description: "Transport",
    categoryId: "transport",
    date: "2026-09-08",
    refundedAmount: 0,
    createdAt: "2026-09-08T08:30:00Z",
    updatedAt: "2026-09-08T08:30:00Z",
  },
  {
    id: "expense-3",
    budgetMonthId: "month-2026-09",
    amount: 5000,
    description: "Déjeuner",
    categoryId: "food",
    date: "2026-09-09",
    refundedAmount: 0,
    createdAt: "2026-09-09T12:30:00Z",
    updatedAt: "2026-09-09T12:30:00Z",
  },
];

/**
 * Dépenses prévues pour le reste du mois.
 *
 * IMPORTANT :
 * Elles ne sont PAS considérées comme des dépenses réelles
 * tant qu'elles ne sont pas effectivement payées.
 */
export const demoPlannedExpenses: PlannedExpense[] = [
  {
    id: "planned-1",
    recurringExpenseId: "recurring-internet",
    budgetMonthId: "month-2026-09",
    name: "Internet",
    amount: 10000,
    categoryId: "internet",
    plannedDate: "2026-09-20",
    status: "planned",
    actualAmount: null,
    actualDate: null,
    note: "Abonnement mensuel",
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "planned-2",
    recurringExpenseId: "recurring-electricity",
    budgetMonthId: "month-2026-09",
    name: "Électricité",
    amount: 15000,
    categoryId: "utilities",
    plannedDate: "2026-09-25",
    status: "planned",
    actualAmount: null,
    actualDate: null,
    note: "Estimation de la facture",
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T08:00:00Z",
  },
];

/**
 * Objectifs d'épargne
 */
export const demoSavingsGoals: SavingsGoal[] = [
  {
    id: "goal-computer",
    name: "Ordinateur",
    targetAmount: 400000,
    savedAmount: 250000,
    priority: 1,
    status: "active",
    targetDate: "2027-03-01",
    note: "Objectif principal",
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T08:00:00Z",
  },
  {
    id: "goal-phone",
    name: "Téléphone",
    targetAmount: 150000,
    savedAmount: 50000,
    priority: 2,
    status: "active",
    targetDate: "2027-06-01",
    note: "Objectif secondaire",
    createdAt: "2026-09-01T08:00:00Z",
    updatedAt: "2026-09-01T08:00:00Z",
  },
];

/**
 * Épargne mise de côté pendant le mois
 */
export const demoSavingsTransfers: SavingsTransfer[] = [
  {
    id: "transfer-1",
    budgetMonthId: "month-2026-09",
    goalId: "goal-computer",
    amount: 20000,
    date: "2026-09-10",
    note: "Épargne du mois",
    createdAt: "2026-09-10T18:00:00Z",
  },
];