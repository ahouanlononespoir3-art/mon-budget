import { describe, expect, it } from "vitest";
import { buildBudgetAlerts } from "./alerts";
import type { BudgetCalculation, BudgetMonth, BudgetSettings } from "../types/finance";

const month: BudgetMonth = { id: "m1", startDate: "2026-09-01", endDate: "2026-09-30", currency: "XOF", initialBudget: 100000, carryOver: 0, totalBudget: 100000, reservedAmount: 0, minimumEndBalance: 30000, status: "open", createdAt: "", updatedAt: "" };
const calculation: BudgetCalculation = { initialBudget: 100000, carryOver: 0, totalBudget: 100000, plannedExpenses: 0, actualExpenses: 85000, reservedAmount: 0, savedAmount: 0, remainingAmount: 15000, expectedRemainingAmount: 15000, varianceAmount: 0, daysInMonth: 30, daysElapsed: 10, daysRemaining: 20, freeMoney: 0, dailyLimit: 750, weeklyLimit: 5250, securedDailyLimit: 0, securedWeeklyLimit: 0, budgetUsedPercentage: 85, expectedBudgetUsedPercentage: 85, forecastEndBalance: 10000, riskLevel: "red" };
const settings: BudgetSettings = { currency: "XOF", usualMonthlyAmount: 100000, firstDayOfBudgetMonth: 1, minimumEndBalance: 30000, alertsEnabled: true, alertAt80Percent: true, alertAboveWeeklyAverage: true, alertBelowPlan: true, alertSavedMoreThanExpected: true, alertOverspendingRisk: true, theme: "system", updatedAt: "" };

describe("buildBudgetAlerts", () => {
  it("détecte le budget et la réserve menacés", () => {
    const alerts = buildBudgetAlerts({ calculation, month, settings, expenses: [], plannedExpenses: [], recurringExpenses: [], goals: [], futurePurchases: [] });
    expect(alerts.map((alert) => alert.id)).toEqual(expect.arrayContaining(["budget-80", "reserve-risk"]));
  });
});
