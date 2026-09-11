import {
  addDays,
  addMonths,
  addWeeks,
  isBefore,
  isEqual,
} from "date-fns";

import type {
  PlannedExpense,
  RecurringExpense,
} from "../types/finance";

interface GenerateRecurringExpensesOptions {
  budgetMonthId: string;
  monthStart: string;
  monthEnd: string;
  existingPlannedExpenses: PlannedExpense[];
}

function createId(prefix: string): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDate(date: string): Date {
  return new Date(`${date}T00:00:00`);
}

function getNextOccurrence(
  date: Date,
  recurringExpense: RecurringExpense
): Date {
  switch (recurringExpense.frequency) {
    case "daily":
      return addDays(date, 1);

    case "weekly":
      return addWeeks(date, 1);

    case "monthly":
      return addMonths(date, 1);

    case "custom": {
      const interval = Math.max(
        1,
        recurringExpense.customInterval ?? 1
      );

      switch (
        recurringExpense.customIntervalUnit
      ) {
        case "weeks":
          return addWeeks(date, interval);

        case "months":
          return addMonths(date, interval);

        case "days":
        default:
          return addDays(date, interval);
      }
    }

    default:
      return date;
  }
}

function isSamePlannedOccurrence(
  existing: PlannedExpense,
  recurringExpenseId: string,
  plannedDate: string
): boolean {
  return (
    existing.recurringExpenseId ===
      recurringExpenseId &&
    existing.plannedDate ===
      plannedDate
  );
}

export function generateRecurringExpenses(
  options: GenerateRecurringExpensesOptions,
  recurringExpenses: RecurringExpense[]
): PlannedExpense[] {
  const {
    budgetMonthId,
    monthStart,
    monthEnd,
    existingPlannedExpenses,
  } = options;

  const start = parseDate(monthStart);
  const end = parseDate(monthEnd);

  const generated: PlannedExpense[] = [];

  for (const recurringExpense of recurringExpenses) {
    if (!recurringExpense.active) {
      continue;
    }

    const recurringStart =
      parseDate(
        recurringExpense.startDate
      );

    const recurringEnd =
      recurringExpense.endDate
        ? parseDate(
            recurringExpense.endDate
          )
        : null;

    if (
      recurringEnd &&
      isBefore(recurringEnd, start)
    ) {
      continue;
    }

    let occurrence =
      parseDate(
        recurringExpense.nextDate
      );

    while (
      isBefore(
        occurrence,
        start
      )
    ) {
      occurrence =
        getNextOccurrence(
          occurrence,
          recurringExpense
        );
    }

    if (
      isBefore(
        occurrence,
        recurringStart
      )
    ) {
      occurrence =
        recurringStart;
    }

    while (
      isBefore(
        occurrence,
        end
      ) ||
      isEqual(
        occurrence,
        end
      )
    ) {
      if (
        recurringEnd &&
        isBefore(
          recurringEnd,
          occurrence
        )
      ) {
        break;
      }

      const plannedDate =
        formatDate(
          occurrence
        );

      const alreadyExists =
        existingPlannedExpenses.some(
          (expense) =>
            isSamePlannedOccurrence(
              expense,
              recurringExpense.id,
              plannedDate
            )
        ) ||
        generated.some(
          (expense) =>
            isSamePlannedOccurrence(
              expense,
              recurringExpense.id,
              plannedDate
            )
        );

      if (!alreadyExists) {
        const now =
          new Date().toISOString();

        generated.push({
          id: createId("planned"),
          recurringExpenseId:
            recurringExpense.id,
          budgetMonthId,
          name:
            recurringExpense.name,
          amount: Math.max(
            0,
            Math.round(
              recurringExpense.amount
            )
          ),
          categoryId:
            recurringExpense.categoryId,
          plannedDate,
          status: "planned",
          actualAmount: null,
          actualDate: null,
          note:
            recurringExpense.note ||
            undefined,
          createdAt: now,
          updatedAt: now,
        });
      }

      occurrence =
        getNextOccurrence(
          occurrence,
          recurringExpense
        );
    }
  }

  return generated;
}