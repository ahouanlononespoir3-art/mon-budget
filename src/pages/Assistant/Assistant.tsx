import { BrainCircuit, Lightbulb, ShieldAlert } from "lucide-react";

import { Card } from "../../components/ui/Card";
import { useBudget } from "../../context/BudgetContext";
import { calculateBudget, calculateForecastScenarios } from "../../core/financialEngine";
import { formatMoney } from "../../utils/formatMoney";

export function Assistant() {
  const { budgetMonth, expenses, plannedExpenses, savingsTransfers, categories, futurePurchases } = useBudget();
  const monthExpenses = expenses.filter((expense) => expense.budgetMonthId === budgetMonth.id);
  const futureExpenses = plannedExpenses.filter((expense) => expense.budgetMonthId === budgetMonth.id && expense.status === "planned");
  const saved = savingsTransfers.filter((transfer) => transfer.budgetMonthId === budgetMonth.id).reduce((sum, transfer) => sum + transfer.amount, 0);
  const calculation = calculateBudget(budgetMonth, monthExpenses, futureExpenses.reduce((sum, expense) => sum + expense.amount, 0), saved, new Date());
  const scenarios = calculateForecastScenarios(calculation);
  const advice: string[] = [];
  if (calculation.forecastEndBalance < budgetMonth.minimumEndBalance) advice.push(`Au rythme actuel, le solde prévu est de ${formatMoney(calculation.forecastEndBalance)}, sous ta réserve minimale.`);
  if (calculation.daysRemaining > 0) advice.push(`Tu peux dépenser environ ${formatMoney(calculation.securedDailyLimit)} par jour tout en conservant ta réserve.`);
  if (calculation.budgetUsedPercentage >= 80) advice.push(`Tu as utilisé ${calculation.budgetUsedPercentage.toFixed(0)} % du budget. Mets les achats non nécessaires en pause.`);
  const topCategory = categories.map((category) => ({ category, total: monthExpenses.filter((expense) => expense.categoryId === category.id).reduce((sum, expense) => sum + Math.max(0, expense.amount - expense.refundedAmount), 0) })).sort((a, b) => b.total - a.total)[0];
  if (topCategory?.total) advice.push(`${topCategory.category.name} est ta catégorie la plus dépensée avec ${formatMoney(topCategory.total)}.`);
  const nextPurchase = futurePurchases.filter((purchase) => !purchase.purchased).sort((a, b) => ({ high: 1, medium: 2, low: 3 }[a.priority] - ({ high: 1, medium: 2, low: 3 }[b.priority])))[0];
  if (nextPurchase) advice.push(`Priorité recommandée : ${nextPurchase.name} (${formatMoney(nextPurchase.estimatedAmount)}), à vérifier avec le simulateur avant achat.`);
  if (advice.length === 0) advice.push("Ta trajectoire budgétaire est saine. Continue à enregistrer tes opérations au fil de l'eau.");

  return <div className="space-y-6"><header><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Analyse personnelle</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Assistant budgétaire</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Des recommandations calculées à partir de tes données.</p></header><Card><div className="flex items-start gap-3"><BrainCircuit className="mt-1 text-blue-600 dark:text-blue-400" /><div><h2 className="font-semibold">Lecture du mois</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Prévision : {formatMoney(calculation.forecastEndBalance)} en fin de mois · Risque : {calculation.riskLevel}</p></div></div></Card><div className="grid gap-4 md:grid-cols-2">{advice.map((item) => <Card key={item}><div className="flex gap-3"><Lightbulb className="shrink-0 text-amber-500" size={20} /><p className="text-sm leading-6 text-slate-700 dark:text-slate-300">{item}</p></div></Card>)}</div><Card title="Scénarios de fin de mois"><div className="grid gap-3 md:grid-cols-3">{scenarios.map((scenario) => <div key={scenario.name} className="rounded-xl bg-slate-50 dark:bg-slate-900 p-4"><p className="font-semibold capitalize">{scenario.name}</p><p className="mt-2 text-lg font-bold">{formatMoney(scenario.projectedEndBalance)}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{scenario.description}</p></div>)}</div></Card><Card><div className="flex gap-3"><ShieldAlert className="text-blue-600 dark:text-blue-400" size={20} /><p className="text-sm text-slate-600 dark:text-slate-300">La limite sécurisée tient compte de la réserve minimale ; les dépenses planifiées restent à honorer avant les achats facultatifs.</p></div></Card></div>;
}
