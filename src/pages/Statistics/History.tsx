import { useMemo } from "react";
import { Archive, CalendarDays, TrendingDown, TrendingUp } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { useBudget } from "../../context/BudgetContext";
import { getBudgetMonths } from "../../services/storage";
import { formatMoney } from "../../utils/formatMoney";

export function History() {
  const { budgetMonth, expenses, plannedExpenses, savingsTransfers } = useBudget();
  const months = useMemo(() => {
    const all = [...getBudgetMonths(), budgetMonth];
    return [...new Map(all.map((month) => [month.id, month])).values()].sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [budgetMonth]);

  const totalSpent = expenses.reduce((sum, expense) => sum + Math.max(0, expense.amount - expense.refundedAmount), 0);
  const totalSaved = savingsTransfers.reduce((sum, transfer) => sum + Math.max(0, transfer.amount), 0);

  return <div className="space-y-6">
    <header><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Archives</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Historique</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Compare tes périodes budgétaires enregistrées.</p></header>
    <div className="grid gap-4 sm:grid-cols-3"><Card><Archive className="text-blue-600 dark:text-blue-400" size={20} /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Mois enregistrés</p><p className="text-xl font-bold">{months.length}</p></Card><Card><TrendingDown className="text-blue-600 dark:text-blue-400" size={20} /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Total dépensé</p><p className="text-xl font-bold">{formatMoney(totalSpent)}</p></Card><Card><TrendingUp className="text-emerald-600 dark:text-emerald-400" size={20} /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Total épargné</p><p className="text-xl font-bold">{formatMoney(totalSaved)}</p></Card></div>
    <Card title="Historique des mois"><div className="space-y-3">{months.map((month) => { const actual = expenses.filter((expense) => expense.budgetMonthId === month.id).reduce((sum, expense) => sum + Math.max(0, expense.amount - expense.refundedAmount), 0); const saved = savingsTransfers.filter((transfer) => transfer.budgetMonthId === month.id).reduce((sum, transfer) => sum + Math.max(0, transfer.amount), 0); const planned = plannedExpenses.filter((expense) => expense.budgetMonthId === month.id && expense.status !== "cancelled" && expense.status !== "postponed").reduce((sum, expense) => sum + Math.max(0, expense.actualAmount ?? expense.amount), 0); const remaining = month.totalBudget - actual - month.reservedAmount - saved; return <div key={month.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-2"><h2 className="font-bold">{new Date(`${month.startDate}T00:00:00`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}</h2>{month.id === budgetMonth.id && <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-1 text-xs text-blue-700 dark:text-blue-300">Mois actuel</span>}</div><p className="mt-2 text-xs text-slate-500 dark:text-slate-400"><CalendarDays className="mr-1 inline" size={14} />{month.startDate} → {month.endDate}</p></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4"><div><p className="text-xs text-slate-400 dark:text-slate-500">Budget</p><p className="font-semibold">{formatMoney(month.totalBudget)}</p></div><div><p className="text-xs text-slate-400 dark:text-slate-500">Dépensé</p><p className="font-semibold">{formatMoney(actual)}</p></div><div><p className="text-xs text-slate-400 dark:text-slate-500">Prévu</p><p className="font-semibold">{formatMoney(planned)}</p></div><div><p className="text-xs text-slate-400 dark:text-slate-500">Solde</p><p className={`font-bold ${remaining < 0 ? "text-red-600 dark:text-red-400" : ""}`}>{formatMoney(remaining)}</p></div></div></div></div>; })}</div></Card>
  </div>;
}
