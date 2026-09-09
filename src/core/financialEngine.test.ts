import { describe, expect, it } from "vitest";

import {
  calculateActualExpenses,
  calculateBudget,
  calculateBudgetUsedPercentage,
  calculateEconomyMode,
  calculateForecastEndBalance,
  calculateForecastScenarios,
  calculateRemainingAmount,
  calculateSecuredDailyLimit,
  calculateTotalBudget,
  getDaysElapsed,
  getDaysInMonth,
  getDaysRemaining,
} from "./financialEngine";

import type {
  BudgetMonth,
  Expense,
} from "../types/finance";

const budgetMonth: BudgetMonth = {
  id: "month-1",
  startDate: "2026-09-01",
  endDate: "2026-09-30",
  currency: "XOF",
  initialBudget: 250000,
  carryOver: 20000,
  totalBudget: 270000,
  reservedAmount: 10000,
  minimumEndBalance: 30000,
  status: "open",
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
};

function createExpense(
  overrides: Partial<Expense> = {}
): Expense {
  return {
    id: "expense-1",
    budgetMonthId: "month-1",
    amount: 10000,
    description: "Test",
    categoryId: "food",
    date: "2026-09-10",
    refundedAmount: 0,
    createdAt: "2026-09-10T00:00:00.000Z",
    updatedAt: "2026-09-10T00:00:00.000Z",
    ...overrides,
  };
}

describe("financialEngine", () => {
  it("calcule correctement le nombre de jours d'un mois", () => {
    expect(
      getDaysInMonth(
        new Date("2026-09-15T12:00:00")
      )
    ).toBe(30);

    expect(
      getDaysInMonth(
        new Date("2026-02-15T12:00:00")
      )
    ).toBe(28);
  });

  it("calcule les jours écoulés depuis le début du mois", () => {
    expect(
      getDaysElapsed(
        "2026-09-01",
        new Date("2026-09-10T12:00:00")
      )
    ).toBe(10);
  });

  it("ne dépasse pas le nombre de jours du mois", () => {
    expect(
      getDaysElapsed(
        "2026-09-01",
        new Date("2026-10-15T12:00:00")
      )
    ).toBe(30);
  });

  it("calcule les jours restants", () => {
    expect(
      getDaysRemaining(
        "2026-09-30",
        new Date("2026-09-20T12:00:00")
      )
    ).toBe(10);
  });

  it("retourne zéro après la fin du mois", () => {
    expect(
      getDaysRemaining(
        "2026-09-30",
        new Date("2026-10-01T12:00:00")
      )
    ).toBe(0);
  });

  it("calcule le budget total avec le report", () => {
    expect(
      calculateTotalBudget(
        budgetMonth
      )
    ).toBe(270000);
  });

  it("calcule les dépenses réelles", () => {
    const expenses = [
      createExpense({
        id: "1",
        amount: 50000,
      }),
      createExpense({
        id: "2",
        amount: 20000,
      }),
      createExpense({
        id: "3",
        amount: 5000,
      }),
    ];

    expect(
      calculateActualExpenses(expenses)
    ).toBe(75000);
  });

  it("déduit correctement les remboursements", () => {
    const expenses = [
      createExpense({
        amount: 20000,
        refundedAmount: 5000,
      }),
      createExpense({
        id: "2",
        amount: 10000,
        refundedAmount: 12000,
      }),
    ];

    expect(
      calculateActualExpenses(expenses)
    ).toBe(15000);
  });

  it("calcule correctement le montant restant", () => {
    expect(
      calculateRemainingAmount(
        270000,
        75000,
        10000,
        20000
      )
    ).toBe(165000);
  });

  it("calcule le pourcentage du budget utilisé", () => {
    expect(
      calculateBudgetUsedPercentage(
        200000,
        50000
      )
    ).toBe(25);
  });

  it("calcule une limite quotidienne sécurisée", () => {
    expect(
      calculateSecuredDailyLimit(
        100000,
        30000,
        10
      )
    ).toBe(7000);
  });

  it("calcule la prévision avec les dépenses planifiées", () => {
    expect(
      calculateForecastEndBalance(
        165000,
        75000,
        15,
        15,
        25000
      )
    ).toBe(65000);
  });

  it("calcule correctement le budget complet", () => {
    const expenses = [
      createExpense({
        id: "1",
        amount: 50000,
      }),
      createExpense({
        id: "2",
        amount: 20000,
      }),
      createExpense({
        id: "3",
        amount: 5000,
      }),
    ];

    const result = calculateBudget(
      budgetMonth,
      expenses,
      25000,
      20000,
      new Date(
        "2026-09-15T12:00:00"
      )
    );

    expect(
      result.totalBudget
    ).toBe(270000);

    expect(
      result.actualExpenses
    ).toBe(75000);

    expect(
      result.remainingAmount
    ).toBe(165000);

    expect(
      result.expectedRemainingAmount
    ).toBe(140000);

    expect(
      result.daysInMonth
    ).toBe(30);

    expect(
      result.daysElapsed
    ).toBe(15);

    expect(
      result.daysRemaining
    ).toBe(15);
  });

  it("utilise les dates du mois budgétaire", () => {
    const result = calculateBudget(
      budgetMonth,
      [],
      0,
      0,
      new Date(
        "2026-10-10T12:00:00"
      )
    );

    expect(
      result.daysInMonth
    ).toBe(30);

    expect(
      result.daysElapsed
    ).toBe(30);

    expect(
      result.daysRemaining
    ).toBe(0);
  });

  it("calcule la variance comme écart réel-planifié", () => {
    const result = calculateBudget(
      budgetMonth,
      [
        createExpense({
          amount: 18500,
        }),
      ],
      15000,
      0,
      new Date(
        "2026-09-10T12:00:00"
      ),
      15000
    );

    expect(
      result.varianceAmount
    ).toBe(3500);
  });

  it("génère trois scénarios de prévision", () => {
    const calculation =
      calculateBudget(
        budgetMonth,
        [
          createExpense({
            amount: 10000,
          }),
        ],
        5000,
        0,
        new Date(
          "2026-09-10T12:00:00"
        )
      );

    const scenarios =
      calculateForecastScenarios(
        calculation
      );

    expect(scenarios).toHaveLength(3);

    expect(
      scenarios[0].name
    ).toBe("optimistic");

    expect(
      scenarios[1].name
    ).toBe("probable");

    expect(
      scenarios[2].name
    ).toBe("conservative");
  });

  it("calcule le mode économie", () => {
    const calculation =
      calculateBudget(
        budgetMonth,
        [],
        10000,
        0,
        new Date(
          "2026-09-10T12:00:00"
        )
      );

    const economyMode =
      calculateEconomyMode(
        calculation,
        30000
      );

    expect(
      economyMode.enabled
    ).toBe(true);

    expect(
      economyMode.minimumEndBalance
    ).toBe(30000);

    expect(
      economyMode.maxAdditionalSpending
    ).toBe(
      calculation.remainingAmount -
        30000
    );
  });

  it("empêche les valeurs négatives de devenir des dépenses", () => {
    const expenses = [
      createExpense({
        amount: -5000,
        refundedAmount: 0,
      }),
    ];

    expect(
      calculateActualExpenses(expenses)
    ).toBe(0);
  });

  it("gère un budget nul", () => {
    const zeroBudget = {
      ...budgetMonth,
      initialBudget: 0,
      carryOver: 0,
      totalBudget: 0,
    };

    const result = calculateBudget(
      zeroBudget,
      [],
      0,
      0,
      new Date(
        "2026-09-10T12:00:00"
      )
    );

    expect(
      result.totalBudget
    ).toBe(0);

    expect(
      result.riskLevel
    ).toBe("red");
  });
});