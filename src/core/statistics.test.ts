import { describe, expect, it } from "vitest";
import { buildBalanceEvolution, buildCategoryStatistics, buildDailyStatistics, buildMonthlyStatistics, buildWeeklyStatistics } from "./statistics";
import type { BudgetMonth, Category, Expense, SavingsTransfer } from "../types/finance";

const month: BudgetMonth = { id: "month-1", startDate: "2026-09-01", endDate: "2026-09-30", currency: "XOF", initialBudget: 100000, carryOver: 0, totalBudget: 100000, reservedAmount: 10000, minimumEndBalance: 20000, status: "open", createdAt: "2026-09-01", updatedAt: "2026-09-01" };
const categories: Category[] = [{ id: "food", name: "Alimentation", active: true, monthlyLimit: null, createdAt: "", updatedAt: "" }];
const expenses: Expense[] = [{ id: "e1", budgetMonthId: "month-1", amount: 20000, description: "Repas", categoryId: "food", date: "2026-09-10", refundedAmount: 2000, createdAt: "", updatedAt: "" }];
const transfers: SavingsTransfer[] = [{ id: "t1", budgetMonthId: "month-1", goalId: "g1", amount: 5000, date: "2026-09-12", createdAt: "" }];

describe("statistics", () => {
  it("agrège les catégories avec les remboursements", () => {
    expect(buildCategoryStatistics(expenses, categories)[0]).toMatchObject({ name: "Alimentation", total: 18000, percentage: 100 });
  });
  it("produit les vues jour, semaine et mois", () => {
    expect(buildDailyStatistics(expenses)).toHaveLength(1);
    expect(buildWeeklyStatistics(expenses)[0].total).toBe(18000);
    expect(buildMonthlyStatistics(expenses)[0].label).toBe("2026-09");
  });
  it("calcule l'évolution du solde", () => {
    expect(buildBalanceEvolution(month, expenses, transfers)).toEqual([{ label: "2026-09-10", balance: 72000 }, { label: "2026-09-12", balance: 67000 }]);
  });
});
