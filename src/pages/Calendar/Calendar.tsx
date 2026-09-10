import { useMemo, useState } from "react";
import { CalendarDays, Plus } from "lucide-react";

import { ExpenseForm, type ExpenseFormData } from "../../components/expenses/ExpenseForm";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useBudget } from "../../context/BudgetContext";
import type { Expense } from "../../types/finance";
import { createId } from "../../utils/id";
import { formatMoney } from "../../utils/formatMoney";

function dateKey(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

export function Calendar() {
  const { expenses, plannedExpenses, budgetMonth, categories, addExpense } = useBudget();
  const [selectedDay, setSelectedDay] = useState(budgetMonth.startDate);
  const [formOpen, setFormOpen] = useState(false);
  const days = useMemo(() => { const result: string[] = []; const current = new Date(`${budgetMonth.startDate}T00:00:00`); const end = new Date(`${budgetMonth.endDate}T00:00:00`); while (current <= end) { result.push(dateKey(current)); current.setDate(current.getDate() + 1); } return result; }, [budgetMonth]);
  const monthExpenses = expenses.filter((expense) => expense.budgetMonthId === budgetMonth.id && expense.date >= budgetMonth.startDate && expense.date <= budgetMonth.endDate);
  const monthPlanned = plannedExpenses.filter((expense) => expense.budgetMonthId === budgetMonth.id && expense.plannedDate >= budgetMonth.startDate && expense.plannedDate <= budgetMonth.endDate);
  const selectedExpenses = monthExpenses.filter((expense) => expense.date === selectedDay);
  const selectedPlanned = monthPlanned.filter((expense) => expense.plannedDate === selectedDay);
  const submitExpense = (data: ExpenseFormData) => { const now = new Date().toISOString(); const expense: Expense = { id: createId("expense"), budgetMonthId: budgetMonth.id, amount: Math.round(data.amount), description: data.description.trim(), categoryId: data.categoryId, date: selectedDay, note: data.note?.trim() || undefined, refundedAmount: 0, createdAt: now, updatedAt: now }; addExpense(expense); setFormOpen(false); };
  const categoryName = (id: string) => categories.find((category) => category.id === id)?.name ?? "Sans catégorie";

  return <div className="space-y-6"><header><p className="text-sm font-medium text-slate-500">Planification</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Calendrier financier</h1><p className="mt-1 text-sm text-slate-500">Sélectionne un jour pour voir ou ajouter une opération.</p></header><div className="grid gap-6 lg:grid-cols-[1fr_340px]"><Card title="Mois en cours" description={`${budgetMonth.startDate} au ${budgetMonth.endDate}`}><div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">{["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => <span key={day}>{day}</span>)}</div><div className="mt-3 grid grid-cols-7 gap-2">{days.map((day) => { const real = monthExpenses.filter((expense) => expense.date === day).reduce((sum, expense) => sum + Math.max(0, expense.amount - expense.refundedAmount), 0); const planned = monthPlanned.filter((expense) => expense.plannedDate === day && expense.status === "planned").reduce((sum, expense) => sum + expense.amount, 0); const risk = real + planned > budgetMonth.minimumEndBalance; return <button type="button" key={day} onClick={() => setSelectedDay(day)} className={`min-h-16 rounded-xl border p-2 text-left transition ${selectedDay === day ? "border-blue-600 bg-blue-50" : "border-slate-200 hover:border-blue-300"}`}><span className="text-xs font-semibold text-slate-700">{Number(day.slice(8))}</span>{real > 0 && <span className="mt-2 block truncate text-[10px] text-red-600">Réel {formatMoney(real)}</span>}{planned > 0 && <span className="block truncate text-[10px] text-blue-600">Prévu {formatMoney(planned)}</span>}{risk && <span className="mt-1 block h-1 rounded bg-amber-400" />}</button>; })}</div></Card><Card title={`Opérations du ${selectedDay}`}><div className="mb-4 flex justify-end"><Button size="small" onClick={() => setFormOpen(true)}><Plus className="mr-1 h-4 w-4" />Ajouter</Button></div>{selectedExpenses.length === 0 && selectedPlanned.length === 0 ? <div className="py-8 text-center text-sm text-slate-500"><CalendarDays className="mx-auto mb-2 text-slate-300" />Aucune opération ce jour.</div> : <div className="space-y-3">{selectedExpenses.map((expense) => <div key={expense.id} className="rounded-xl bg-red-50 p-3"><p className="font-semibold">{expense.description}</p><p className="text-sm text-red-700">Réel · {categoryName(expense.categoryId)} · {formatMoney(Math.max(0, expense.amount - expense.refundedAmount))}</p></div>)}{selectedPlanned.map((expense) => <div key={expense.id} className="rounded-xl bg-blue-50 p-3"><p className="font-semibold">{expense.name}</p><p className="text-sm text-blue-700">{expense.recurringExpenseId ? "Récurrente" : "Prévue"} · {formatMoney(expense.amount)}</p></div>)}</div>}</Card></div>{formOpen && <ExpenseForm categories={categories} onClose={() => setFormOpen(false)} onSubmit={submitExpense} initialValues={{ date: selectedDay }} title="Ajouter une dépense au calendrier" />}</div>;
}
