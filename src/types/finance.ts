export type Currency = "XOF";

export type ExpenseFrequency =
  | "daily"
  | "weekly"
  | "monthly"
  | "custom";

export type ExpenseStatus =
  | "planned"
  | "paid"
  | "postponed"
  | "cancelled";

export type GoalStatus =
  | "active"
  | "paused"
  | "achieved"
  | "purchased"
  | "cancelled";

export type MonthStatus =
  | "open"
  | "closed"
  | "modified";

export type RiskLevel =
  | "green"
  | "orange"
  | "red";

export interface Money {
  /**
   * Montant exprimé en unité mineure.
   *
   * Pour le FCFA, 250000 FCFA est donc représenté
   * par 250000 et non par 250000.00.
   *
   * Cette approche évite les erreurs liées aux nombres
   * décimaux JavaScript.
   */
  amount: number;

  currency: Currency;
}

export interface BudgetMonth {
  id: string;

  /**
   * Premier jour du mois budgétaire.
   * Format ISO : YYYY-MM-DD
   */
  startDate: string;

  /**
   * Dernier jour du mois budgétaire.
   * Format ISO : YYYY-MM-DD
   */
  endDate: string;

  currency: Currency;

  /**
   * Argent disponible au début du mois.
   */
  initialBudget: number;

  /**
   * Argent provenant du mois précédent.
   */
  carryOver: number;

  /**
   * Argent total disponible pour le mois.
   */
  totalBudget: number;

  /**
   * Argent volontairement mis de côté.
   */
  reservedAmount: number;

  /**
   * Montant minimum que l'utilisateur souhaite
   * idéalement conserver à la fin du mois.
   */
  minimumEndBalance: number;

  status: MonthStatus;

  createdAt: string;

  updatedAt: string;
}

export interface Category {
  id: string;

  name: string;

  /**
   * Exemple :
   * alimentation, transport, logement...
   */
  color?: string;

  icon?: string;

  active: boolean;

  /**
   * Budget maximum recommandé pour cette catégorie.
   * null signifie qu'aucune limite n'est définie.
   */
  monthlyLimit: number | null;

  createdAt: string;

  updatedAt: string;
}

export interface RecurringExpense {
  id: string;

  name: string;

  amount: number;

  categoryId: string;

  frequency: ExpenseFrequency;

  /**
   * Pour les dépenses personnalisées.
   *
   * Exemple :
   * customInterval = 15
   * customIntervalUnit = "days"
   */
  customInterval?: number;

  customIntervalUnit?: "days" | "weeks" | "months";

  /**
   * Date de la prochaine occurrence.
   */
  nextDate: string;

  /**
   * Date de début de la règle.
   */
  startDate: string;

  /**
   * Date de fin facultative.
   */
  endDate?: string | null;

  mandatory: boolean;

  active: boolean;

  note?: string;

  createdAt: string;

  updatedAt: string;
}

export interface PlannedExpense {
  id: string;

  recurringExpenseId?: string;

  budgetMonthId: string;

  name: string;

  amount: number;

  categoryId: string;

  plannedDate: string;

  status: ExpenseStatus;

  /**
   * Montant réellement payé si la dépense
   * a finalement été différente du montant prévu.
   */
  actualAmount?: number | null;

  /**
   * Date réelle de paiement.
   */
  actualDate?: string | null;

  note?: string;

  createdAt: string;

  updatedAt: string;
}

export interface Expense {
  id: string;

  budgetMonthId: string;

  amount: number;

  description: string;

  categoryId: string;

  date: string;

  note?: string;

  /**
   * Identifie éventuellement la dépense prévue
   * dont cette dépense réelle provient.
   */
  plannedExpenseId?: string | null;

  /**
   * Une dépense remboursée n'est pas supprimée.
   * Le remboursement est enregistré séparément.
   */
  refundedAmount: number;

  createdAt: string;

  updatedAt: string;
}

export interface Refund {
  id: string;

  expenseId: string;

  amount: number;

  date: string;

  note?: string;

  createdAt: string;
}

export interface SavingsGoal {
  id: string;

  name: string;

  targetAmount: number;

  savedAmount: number;

  /**
   * Position dans la file de priorité.
   * 1 = objectif prioritaire.
   */
  priority: number;

  status: GoalStatus;

  targetDate?: string | null;

  note?: string;

  createdAt: string;

  updatedAt: string;
}

export interface SavingsTransfer {
  id: string;

  budgetMonthId: string;

  goalId: string;

  amount: number;

  date: string;

  note?: string;

  createdAt: string;
}

export interface ReserveTransaction {
  id: string;

  budgetMonthId: string;

  amount: number;

  date: string;

  note?: string;

  createdAt: string;
}

export interface MonthlySummary {
  budgetMonthId: string;

  initialBudget: number;

  carryOver: number;

  totalBudget: number;

  plannedExpenses: number;

  actualExpenses: number;

  reservedAmount: number;

  savedAmount: number;

  remainingAmount: number;

  expectedRemainingAmount: number;

  varianceAmount: number;

  expenseCount: number;

  topCategoryId?: string | null;

  highestSpendingDay?: string | null;

  status: RiskLevel;

  closedAt?: string | null;
}

export interface BudgetCalculation {
  initialBudget: number;

  carryOver: number;

  totalBudget: number;

  plannedExpenses: number;

  actualExpenses: number;

  reservedAmount: number;

  savedAmount: number;

  remainingAmount: number;

  expectedRemainingAmount: number;

  varianceAmount: number;

  daysInMonth: number;

  daysElapsed: number;

  daysRemaining: number;

  freeMoney: number;

  dailyLimit: number;

  weeklyLimit: number;

  securedDailyLimit: number;

  securedWeeklyLimit: number;

  budgetUsedPercentage: number;

  expectedBudgetUsedPercentage: number;

  forecastEndBalance: number;

  riskLevel: RiskLevel;
}

export interface ForecastScenario {
  name: "optimistic" | "probable" | "conservative";

  projectedEndBalance: number;

  projectedAdditionalExpenses: number;

  description: string;
}

export interface BudgetForecast {
  currentBalance: number;

  scenarios: ForecastScenario[];

  probableEndBalance: number;

  generatedAt: string;
}

export interface SimulationResult {
  simulatedExpense: number;

  balanceBefore: number;

  balanceAfter: number;

  forecastEndBalance: number;

  dailyLimitAfter: number;

  weeklyLimitAfter: number;

  riskLevel: RiskLevel;

  isAffordable: boolean;

  generatedAt: string;
}

export interface EconomyMode {
  enabled: boolean;

  /**
   * Montant minimum que l'utilisateur veut
   * conserver à la fin du mois.
   */
  minimumEndBalance: number;

  maxAdditionalSpending: number;

  dailyLimit: number;

  weeklyLimit: number;

  progressPercentage: number;

  riskLevel: RiskLevel;
}

export interface BudgetSettings {
  currency: Currency;

  usualMonthlyAmount: number;

  firstDayOfBudgetMonth: number;

  minimumEndBalance: number;

  alertsEnabled: boolean;

  alertAt80Percent: boolean;

  alertAboveWeeklyAverage: boolean;

  alertBelowPlan: boolean;

  alertSavedMoreThanExpected: boolean;

  alertOverspendingRisk: boolean;

  theme: "light" | "dark" | "system";

  updatedAt: string;
}

export interface DashboardData {
  month: BudgetMonth;

  calculation: BudgetCalculation;

  forecast: BudgetForecast;

  activeGoals: SavingsGoal[];

  upcomingExpenses: PlannedExpense[];

  recentExpenses: Expense[];

  economyMode: EconomyMode;
}