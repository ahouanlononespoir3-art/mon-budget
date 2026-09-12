import { AlertTriangle, Bell, CheckCircle2, Info } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { useBudget } from "../../context/BudgetContext";
import { buildBudgetAlerts } from "../../core/alerts";
import { calculateBudget } from "../../core/financialEngine";
import { getSettings } from "../../services/storage";

export function Notifications() {
  const { budgetMonth, expenses, plannedExpenses, savingsTransfers, recurringExpenses, savingsGoals, futurePurchases } = useBudget();
  const monthExpenses = expenses.filter((expense) => expense.budgetMonthId === budgetMonth.id);
  const monthPlanned = plannedExpenses.filter((expense) => expense.budgetMonthId === budgetMonth.id);
  const calculation = calculateBudget(budgetMonth, monthExpenses, monthPlanned.filter((expense) => expense.status === "planned").reduce((sum, expense) => sum + expense.amount, 0), savingsTransfers.filter((transfer) => transfer.budgetMonthId === budgetMonth.id).reduce((sum, transfer) => sum + transfer.amount, 0), new Date());
  const notifications = buildBudgetAlerts({ calculation, month: budgetMonth, settings: getSettings(), expenses: monthExpenses, plannedExpenses: monthPlanned, recurringExpenses, goals: savingsGoals, futurePurchases });

  return <div className="space-y-6"><header><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Centre de notifications</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Notifications</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Les événements importants de ton budget sont regroupés ici.</p></header><Card>{notifications.length === 0 ? <div className="flex flex-col items-center py-10 text-center"><CheckCircle2 className="text-emerald-500" size={36} /><h2 className="mt-3 font-semibold">Tout est calme</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Aucune notification urgente pour le moment.</p></div> : <div className="space-y-3">{notifications.map((notification) => { const Icon = notification.severity === "info" ? Info : AlertTriangle; return <article key={notification.id} className="flex gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4"><Icon className={notification.severity === "critical" ? "text-red-600 dark:text-red-400" : notification.severity === "warning" ? "text-amber-600 dark:text-amber-400" : "text-blue-600 dark:text-blue-400"} /><div><h2 className="font-semibold text-slate-900 dark:text-slate-100">{notification.title}</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{notification.message}</p></div><Bell className="ml-auto shrink-0 text-slate-300 dark:text-slate-600" size={16} /></article>; })}</div>}</Card></div>;
}
