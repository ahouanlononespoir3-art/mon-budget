import {
  getBudgetMonth,
  getCategories,
  getExpenses,
  getPlannedExpenses,
  getRecurringExpenses,
  getSavingsGoals,
  getSavingsTransfers,
  getSettings,
  saveBudgetMonth,
  saveCategories,
  saveExpenses,
  savePlannedExpenses,
  saveRecurringExpenses,
  saveSavingsGoals,
  saveSavingsTransfers,
  saveSettings,
} from "./storage";
import type { BudgetSettings } from "../types/finance";

interface ImportData {
  budgetMonth: ReturnType<typeof getBudgetMonth>;
  categories: ReturnType<typeof getCategories>;
  expenses: ReturnType<typeof getExpenses>;
  plannedExpenses: ReturnType<typeof getPlannedExpenses>;
  recurringExpenses: ReturnType<typeof getRecurringExpenses>;
  savingsGoals: ReturnType<typeof getSavingsGoals>;
  savingsTransfers: ReturnType<typeof getSavingsTransfers>;
  settings: BudgetSettings;
}

export function exportAllData(): void {
  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    budgetMonth: getBudgetMonth(),
    categories: getCategories(),
    expenses: getExpenses(),
    plannedExpenses: getPlannedExpenses(),
    recurringExpenses: getRecurringExpenses(),
    savingsGoals: getSavingsGoals(),
    savingsTransfers: getSavingsTransfers(),
    settings: getSettings(),
  };

  const blob = new Blob(
    [JSON.stringify(data, null, 2)],
    {
      type: "application/json",
    }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `mon-budget-${new Date()
    .toISOString()
    .slice(0, 10)}.json`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export function exportExpensesCSV(): void {
  const expenses = getExpenses();

  const header = [
    "Date",
    "Description",
    "Montant",
    "Remboursement",
    "Montant net",
    "Categorie",
  ];

  const categories = getCategories();

  const rows = expenses.map((expense) => {
    const category =
      categories.find(
        (item) => item.id === expense.categoryId
      )?.name ?? "";

    return [
      expense.date,
      expense.description,
      expense.amount,
      expense.refundedAmount,
      Math.max(
        0,
        expense.amount - expense.refundedAmount
      ),
      category,
    ];
  });

  const csv = [
    header,
    ...rows,
  ]
    .map((row) =>
      row
        .map((value) =>
          `"${String(value).replaceAll('"', '""')}"`
        )
        .join(";")
    )
    .join("\n");

  const blob = new Blob(
    ["\uFEFF" + csv],
    {
      type: "text/csv;charset=utf-8",
    }
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `mon-budget-depenses-${new Date()
    .toISOString()
    .slice(0, 10)}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export function importAllData(raw: unknown): void {
  if (!raw || typeof raw !== "object") {
    throw new Error("Le fichier est invalide.");
  }

  const data = raw as Partial<ImportData>;
  if (!data.budgetMonth || !Array.isArray(data.categories) || !Array.isArray(data.expenses)) {
    throw new Error("Le fichier ne contient pas un export Mon Budget valide.");
  }

  saveBudgetMonth(data.budgetMonth);
  saveCategories(data.categories);
  saveExpenses(data.expenses);
  savePlannedExpenses(Array.isArray(data.plannedExpenses) ? data.plannedExpenses : []);
  saveRecurringExpenses(Array.isArray(data.recurringExpenses) ? data.recurringExpenses : []);
  saveSavingsGoals(Array.isArray(data.savingsGoals) ? data.savingsGoals : []);
  saveSavingsTransfers(Array.isArray(data.savingsTransfers) ? data.savingsTransfers : []);
  if (data.settings) saveSettings(data.settings);
}