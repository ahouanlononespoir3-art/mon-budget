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

export type FuturePurchasePriority =
  | "high"
  | "medium"
  | "low";

export type FuturePurchaseNeedType =
  | "necessary"
  | "useful"
  | "want";

export interface Money {
  amount: number;
  currency: Currency;
}

export interface BudgetMonth {
  id: string;
  startDate: string;
  endDate: string;
  currency: Currency;
  initialBudget: number;
  carryOver: number;
  totalBudget: number;
  reservedAmount: number;
  minimumEndBalance: number;
  status: MonthStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  icon?: string;
  active: boolean;
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
  customInterval?: number;
  customIntervalUnit?: "days" | "weeks" | "months";
  nextDate: string;
  startDate: string;
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
  actualAmount?: number | null;
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
  plannedExpenseId?: string | null;
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

export interface FuturePurchase {
  id: string;
  name: string;
  estimatedAmount: number;
  priority: FuturePurchasePriority;
  needType: FuturePurchaseNeedType;
  targetDate?: string | null;
  categoryId?: string | null;
  note?: string;
  purchased: boolean;
  createdAt: string;
  updatedAt: string;
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
