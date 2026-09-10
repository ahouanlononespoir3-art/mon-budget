import type { BudgetCalculation, BudgetMonth, BudgetSettings, Expense, FuturePurchase, PlannedExpense, RecurringExpense, SavingsGoal } from "../types/finance";

export type AlertSeverity = "info" | "warning" | "critical";
export interface BudgetAlert { id: string; severity: AlertSeverity; title: string; message: string; }

export function buildBudgetAlerts(input: { calculation: BudgetCalculation; month: BudgetMonth; settings: BudgetSettings; expenses: Expense[]; plannedExpenses: PlannedExpense[]; recurringExpenses: RecurringExpense[]; goals: SavingsGoal[]; futurePurchases: FuturePurchase[]; today?: Date }): BudgetAlert[] {
  const { calculation, month, settings, expenses, plannedExpenses, recurringExpenses, goals, futurePurchases } = input;
  const today = input.today ?? new Date();
  const alerts: BudgetAlert[] = [];
  if (settings.alertAt80Percent && calculation.budgetUsedPercentage >= 80) alerts.push({ id: "budget-80", severity: "warning", title: "Budget presque atteint", message: `Tu as utilisé ${calculation.budgetUsedPercentage.toFixed(0)} % de ton budget.` });
  if (settings.alertOverspendingRisk && calculation.forecastEndBalance < month.minimumEndBalance) alerts.push({ id: "reserve-risk", severity: "critical", title: "Réserve menacée", message: `Le solde prévu est de ${Math.max(0, calculation.forecastEndBalance).toLocaleString("fr-FR")} FCFA, sous la réserve minimale.` });
  if (settings.alertAboveWeeklyAverage && calculation.daysRemaining > 0 && calculation.dailyLimit < calculation.securedDailyLimit) alerts.push({ id: "daily-limit", severity: "warning", title: "Limite quotidienne basse", message: "Le rythme actuel réduit ta marge de dépense quotidienne." });
  const variance = plannedExpenses.filter((expense) => expense.actualAmount != null).reduce((sum, expense) => sum + Math.max(0, (expense.actualAmount ?? 0) - expense.amount), 0);
  if (settings.alertBelowPlan && variance > 0) alerts.push({ id: "planned-variance", severity: "warning", title: "Dépenses supérieures au prévu", message: `Les écarts défavorables représentent ${variance.toLocaleString("fr-FR")} FCFA.` });
  const weekExpenses = expenses.filter((expense) => { const date = new Date(`${expense.date}T00:00:00`); const start = new Date(today); start.setDate(today.getDate() - 6); return date >= start && date <= today; });
  if (settings.alertAboveWeeklyAverage && weekExpenses.length > 0) { const average = calculation.daysElapsed > 0 ? calculation.actualExpenses / calculation.daysElapsed : 0; const weekTotal = weekExpenses.reduce((sum, expense) => sum + Math.max(0, expense.amount - expense.refundedAmount), 0); if (weekTotal > average * 7) alerts.push({ id: "weekly-average", severity: "warning", title: "Semaine au-dessus de la moyenne", message: "Tes dépenses des sept derniers jours dépassent ton rythme moyen." }); }
  recurringExpenses.filter((expense) => expense.active).forEach((expense) => { const due = new Date(`${expense.nextDate}T00:00:00`); const days = Math.ceil((due.getTime() - today.getTime()) / 86400000); if (days >= 0 && days <= 7) alerts.push({ id: `recurring-${expense.id}`, severity: "info", title: "Échéance récurrente proche", message: `${expense.name} est prévue dans ${days} jour${days > 1 ? "s" : ""}.` }); });
  goals.filter((goal) => goal.status === "active" && goal.targetAmount > 0 && goal.savedAmount / goal.targetAmount >= 0.8 && goal.savedAmount < goal.targetAmount).forEach((goal) => alerts.push({ id: `goal-${goal.id}`, severity: "info", title: "Objectif bientôt atteint", message: `${goal.name} est atteint à ${(goal.savedAmount / goal.targetAmount * 100).toFixed(0)} %.` }));
  futurePurchases.filter((purchase) => !purchase.purchased && purchase.targetDate && purchase.targetDate < today.toISOString().slice(0, 10)).forEach((purchase) => alerts.push({ id: `purchase-${purchase.id}`, severity: "warning", title: "Achat futur en retard", message: `${purchase.name} dépasse sa date souhaitée.` }));
  return alerts;
}
