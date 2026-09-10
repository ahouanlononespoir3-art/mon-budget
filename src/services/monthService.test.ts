// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { importAllData } from "./dataExport";
import { performAutomaticMonthRollover } from "./monthService";
import { getBudgetMonth, getBudgetMonths, getCategories, saveBudgetMonth, saveBudgetMonths, saveCategories, saveExpenses, savePlannedExpenses, saveSavingsTransfers } from "./storage";
import type { BudgetMonth } from "../types/finance";

const month: BudgetMonth = { id: "month-2026-09", startDate: "2026-09-01", endDate: "2026-09-30", currency: "XOF", initialBudget: 100000, carryOver: 0, totalBudget: 100000, reservedAmount: 0, minimumEndBalance: 20000, status: "open", createdAt: "", updatedAt: "" };

beforeEach(() => { localStorage.clear(); saveBudgetMonth(month); saveBudgetMonths([month]); saveCategories([]); saveExpenses([]); savePlannedExpenses([]); saveSavingsTransfers([]); });

describe("month rollover", () => {
  it("clôture le mois passé et crée le suivant avec report", () => {
    const result = performAutomaticMonthRollover(month, new Date("2026-10-01T12:00:00"));
    expect(result.changed).toBe(true);
    expect(result.previousMonth.status).toBe("closed");
    expect(result.currentMonth.startDate).toBe("2026-10-01");
    expect(result.currentMonth.carryOver).toBe(100000);
    expect(getBudgetMonth()?.status).toBe("open");
    expect(getBudgetMonths()).toHaveLength(2);
  });
});

describe("importAllData", () => {
  it("restaure les collections exportées", () => {
    importAllData({ budgetMonth: month, categories: [{ id: "food", name: "Alimentation", active: true, monthlyLimit: null, createdAt: "", updatedAt: "" }], expenses: [], plannedExpenses: [], recurringExpenses: [], savingsGoals: [], savingsTransfers: [], settings: { currency: "XOF", usualMonthlyAmount: 100000, firstDayOfBudgetMonth: 1, minimumEndBalance: 20000, alertsEnabled: true, alertAt80Percent: true, alertAboveWeeklyAverage: true, alertBelowPlan: true, alertSavedMoreThanExpected: true, alertOverspendingRisk: true, theme: "system", updatedAt: "" } });
    expect(getCategories()).toHaveLength(1);
  });
});
