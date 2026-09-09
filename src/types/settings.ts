import type { BudgetSettings } from "./finance";

export interface AppSettings {
  budget: BudgetSettings;
  onboardingCompleted: boolean;
}

export const defaultBudgetSettings: BudgetSettings = {
  currency: "XOF",
  usualMonthlyAmount: 250000,
  firstDayOfBudgetMonth: 1,
  minimumEndBalance: 30000,
  alertsEnabled: true,
  alertAt80Percent: true,
  alertAboveWeeklyAverage: true,
  alertBelowPlan: true,
  alertSavedMoreThanExpected: true,
  alertOverspendingRisk: true,
  theme: "system",
  updatedAt: new Date().toISOString(),
};