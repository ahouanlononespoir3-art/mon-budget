import { useMemo, useState } from "react";
import { BarChart3, TrendingUp, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useBudget } from "../../context/BudgetContext";
import { calculateBudget } from "../../core/financialEngine";
import { buildBalanceEvolution, buildCategoryStatistics, buildDailyStatistics, buildMonthlyStatistics, buildWeeklyStatistics, selectMonthExpenses } from "../../core/statistics";
import { formatMoney } from "../../utils/formatMoney";

export function Statistics() {
  const { expenses, plannedExpenses, savingsTransfers, budgetMonth, categories } = useBudget();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const monthExpenses = useMemo(() => selectMonthExpenses(expenses, budgetMonth), [expenses, budgetMonth]);
  const calculation = useMemo(() => calculateBudget(budgetMonth, monthExpenses, plannedExpenses.filter((expense) => expense.budgetMonthId === budgetMonth.id && expense.status === "planned").reduce((sum, expense) => sum + expense.amount, 0), savingsTransfers.filter((transfer) => transfer.budgetMonthId === budgetMonth.id).reduce((sum, transfer) => sum + transfer.amount, 0), new Date()), [budgetMonth, monthExpenses, plannedExpenses, savingsTransfers]);
  const categoryData = useMemo(() => buildCategoryStatistics(monthExpenses, categories), [monthExpenses, categories]);
  const chartData = useMemo(() => period === "daily" ? buildDailyStatistics(monthExpenses) : period === "weekly" ? buildWeeklyStatistics(monthExpenses) : buildMonthlyStatistics(expenses), [period, monthExpenses, expenses]);
  const balanceData = useMemo(() => buildBalanceEvolution(budgetMonth, expenses, savingsTransfers), [budgetMonth, expenses, savingsTransfers]);
  const averageDaily = calculation.daysElapsed > 0 ? calculation.actualExpenses / calculation.daysElapsed : 0;
  const averageWeekly = averageDaily * 7;
  const topCategory = categoryData[0];

  return <div className="space-y-6">
    <header><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Analyse</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Statistiques</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Une lecture complète des dépenses, du solde et de l'épargne.</p></header>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Card><Wallet className="text-blue-600 dark:text-blue-400" size={20} /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Dépenses du mois</p><p className="text-xl font-bold">{formatMoney(calculation.actualExpenses)}</p></Card><Card><TrendingUp className="text-blue-600 dark:text-blue-400" size={20} /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Moyenne quotidienne</p><p className="text-xl font-bold">{formatMoney(averageDaily)}</p></Card><Card><BarChart3 className="text-blue-600 dark:text-blue-400" size={20} /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Moyenne hebdomadaire</p><p className="text-xl font-bold">{formatMoney(averageWeekly)}</p></Card><Card><p className="text-sm text-slate-500 dark:text-slate-400">Solde restant</p><p className="mt-1 text-xl font-bold">{formatMoney(calculation.remainingAmount)}</p></Card></div>
    <div className="grid gap-6 xl:grid-cols-2"><Card title="Dépenses par catégorie"><div className="space-y-4">{categoryData.length === 0 ? <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Aucune dépense enregistrée.</p> : categoryData.map((item) => <div key={item.categoryId}><div className="flex justify-between text-sm"><span>{item.name}</span><strong>{formatMoney(item.total)}</strong></div><ProgressBar value={item.percentage} /><p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{item.percentage.toFixed(1)} %</p></div>)}</div></Card><Card title="Répartition dans le temps"><div className="mb-4 flex gap-2">{(["daily", "weekly", "monthly"] as const).map((value) => <button key={value} type="button" onClick={() => setPeriod(value)} className={`rounded-lg px-3 py-2 text-sm font-semibold ${period === value ? "bg-slate-900 dark:bg-slate-700 text-white" : "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"}`}>{value === "daily" ? "Jour" : value === "weekly" ? "Semaine" : "Mois"}</button>)}</div><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip formatter={(value) => formatMoney(Number(value))} /><Bar dataKey="total" name="Dépenses" fill="#2563eb" /></BarChart></ResponsiveContainer></div></Card></div>
    <Card title="Évolution du solde"><div className="h-72">{balanceData.length === 0 ? <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Les données apparaîtront après les premières opérations.</p> : <ResponsiveContainer width="100%" height="100%"><LineChart data={balanceData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis /><Tooltip formatter={(value) => formatMoney(Number(value))} /><Line type="monotone" dataKey="balance" name="Solde" stroke="#059669" strokeWidth={3} /></LineChart></ResponsiveContainer>}</div></Card>
    <Card title="Synthèse"><div className="grid gap-4 sm:grid-cols-3"><div><p className="text-sm text-slate-500 dark:text-slate-400">Catégorie principale</p><p className="font-bold">{topCategory?.name ?? "Aucune"}</p></div><div><p className="text-sm text-slate-500 dark:text-slate-400">Pourcentage utilisé</p><p className="font-bold">{calculation.budgetUsedPercentage.toFixed(1)} %</p></div><div><p className="text-sm text-slate-500 dark:text-slate-400">Risque</p><p className="font-bold">{calculation.riskLevel}</p></div></div></Card>
  </div>;
}
