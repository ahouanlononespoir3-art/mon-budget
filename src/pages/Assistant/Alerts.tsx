import { AlertTriangle, Bell, CheckCircle2, Info } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { useBudget } from "../../context/BudgetContext";
import { buildBudgetAlerts } from "../../core/alerts";
import { calculateBudget } from "../../core/financialEngine";
import { getSettings } from "../../services/storage";

export function Alerts() {
  const { budgetMonth, expenses, plannedExpenses, savingsTransfers, recurringExpenses, savingsGoals, futurePurchases } = useBudget();
  const currentExpenses = expenses.filter((expense) => expense.budgetMonthId === budgetMonth.id);
  const currentPlanned = plannedExpenses.filter((expense) => expense.budgetMonthId === budgetMonth.id);
  const calculation = calculateBudget(budgetMonth, currentExpenses, currentPlanned.filter((expense) => expense.status === "planned").reduce((sum, expense) => sum + expense.amount, 0), savingsTransfers.filter((transfer) => transfer.budgetMonthId === budgetMonth.id).reduce((sum, transfer) => sum + transfer.amount, 0), new Date());
  const alerts = buildBudgetAlerts({ calculation, month: budgetMonth, settings: getSettings(), expenses: currentExpenses, plannedExpenses: currentPlanned, recurringExpenses, goals: savingsGoals, futurePurchases });
  return <div className="space-y-6"><header><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Surveillance intelligente</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Alertes</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Les signaux sont recalculés à partir de tes opérations actuelles.</p></header><Card>{alerts.length === 0 ? <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-300"><CheckCircle2 /><p>Aucune alerte active.</p></div> : <div className="space-y-3">{alerts.map((alert) => <div key={alert.id} className={`flex items-start gap-3 rounded-xl border p-4 ${alert.severity === "critical" ? "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 text-red-900" : alert.severity === "warning" ? "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-300" : "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 text-blue-900"}`}>{alert.severity === "info" ? <Info className="shrink-0" size={20} /> : <AlertTriangle className="shrink-0" size={20} />}<div><p className="font-semibold">{alert.title}</p><p className="mt-1 text-sm">{alert.message}</p></div></div>)}</div>}</Card><Card title="Règles surveillées"><div className="space-y-3 text-sm text-slate-600 dark:text-slate-300"><p><Bell className="mr-2 inline" size={16} />Seuil de budget, réserve et limite quotidienne</p><p><Bell className="mr-2 inline" size={16} />Écarts prévu/réel et moyenne hebdomadaire</p><p><Bell className="mr-2 inline" size={16} />Factures récurrentes, objectifs et achats futurs</p></div></Card></div>;
}
