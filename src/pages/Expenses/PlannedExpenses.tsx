import { useMemo, useState } from "react";
import { Check, Plus, RotateCcw, Trash2, X } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useBudget } from "../../context/BudgetContext";
import type { ExpenseStatus, PlannedExpense } from "../../types/finance";
import { createId } from "../../utils/id";
import { formatMoney } from "../../utils/formatMoney";

const statusLabels: Record<ExpenseStatus, string> = {
  planned: "Prévue",
  paid: "Payée",
  postponed: "Reportée",
  cancelled: "Annulée",
};

export function PlannedExpenses() {
  const {
    budgetMonth,
    plannedExpenses,
    categories,
    addPlannedExpense,
    updatePlannedExpense,
    deletePlannedExpense,
    addExpense,
  } = useBudget();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [plannedDate, setPlannedDate] = useState(budgetMonth.startDate);

  const items = useMemo(
    () => plannedExpenses
      .filter((expense) => expense.budgetMonthId === budgetMonth.id)
      .sort((a, b) => a.plannedDate.localeCompare(b.plannedDate)),
    [plannedExpenses, budgetMonth.id]
  );

  const reset = () => {
    setName("");
    setAmount("");
    setCategoryId(categories[0]?.id ?? "");
    setPlannedDate(budgetMonth.startDate);
    setShowForm(false);
  };

  const addPlanned = () => {
    const numericAmount = Math.round(Number(amount));
    if (!name.trim() || numericAmount <= 0 || !categoryId || !plannedDate) return;
    const now = new Date().toISOString();
    addPlannedExpense({
      id: createId("planned"),
      budgetMonthId: budgetMonth.id,
      name: name.trim(),
      amount: numericAmount,
      categoryId,
      plannedDate,
      status: "planned",
      actualAmount: null,
      actualDate: null,
      createdAt: now,
      updatedAt: now,
    });
    reset();
  };

  const updateStatus = (expense: PlannedExpense, status: ExpenseStatus) => {
    updatePlannedExpense({ ...expense, status, updatedAt: new Date().toISOString() });
  };

  const markPaid = (expense: PlannedExpense) => {
    const rawActual = window.prompt("Montant réellement payé", String(expense.amount));
    const actualAmount = Math.round(Number(rawActual));
    if (!Number.isFinite(actualAmount) || actualAmount <= 0) return;
    const now = new Date().toISOString();
    addExpense({
      id: createId("expense"),
      budgetMonthId: budgetMonth.id,
      amount: actualAmount,
      description: expense.name,
      categoryId: expense.categoryId,
      date: expense.plannedDate,
      plannedExpenseId: expense.id,
      refundedAmount: 0,
      createdAt: now,
      updatedAt: now,
    });
    updatePlannedExpense({
      ...expense,
      status: "paid",
      actualAmount,
      actualDate: expense.plannedDate,
      updatedAt: now,
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Prévisionnel</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Dépenses planifiées</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Prépare les sorties d'argent à venir et compare prévu avec réel.</p>
        </div>
        <Button onClick={() => setShowForm((visible) => !visible)}><Plus className="mr-2 h-4 w-4" />Ajouter</Button>
      </header>

      {showForm && (
        <Card title="Nouvelle dépense prévue">
          <div className="grid gap-4 md:grid-cols-2">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom" className="rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3" />
            <input type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Montant prévu" className="rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3" />
            <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input type="date" value={plannedDate} onChange={(event) => setPlannedDate(event.target.value)} className="rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3" />
          </div>
          <div className="mt-4 flex justify-end gap-3"><Button variant="secondary" onClick={reset}>Annuler</Button><Button onClick={addPlanned}>Enregistrer</Button></div>
        </Card>
      )}

      <Card>
        {items.length === 0 ? <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">Aucune dépense planifiée pour ce mois.</p> : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {items.map((expense) => {
              const difference = expense.actualAmount == null ? null : expense.actualAmount - expense.amount;
              return <div key={expense.id} className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{expense.name}</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{expense.plannedDate} · {statusLabels[expense.status]}</p>
                  <p className="mt-1 text-sm">Prévu : <strong>{formatMoney(expense.amount)}</strong>{expense.actualAmount != null && <> · Réel : <strong>{formatMoney(expense.actualAmount)}</strong> · Écart : <strong className={difference && difference > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}>{difference && difference > 0 ? "+" : ""}{formatMoney(difference ?? 0)}</strong></>}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {expense.status === "planned" && <Button size="small" onClick={() => markPaid(expense)}><Check className="mr-1 h-4 w-4" />Payée</Button>}
                  {expense.status === "planned" && <Button size="small" variant="secondary" onClick={() => updateStatus(expense, "postponed")}><RotateCcw className="mr-1 h-4 w-4" />Reporter</Button>}
                  {expense.status === "postponed" && <Button size="small" variant="secondary" onClick={() => updateStatus(expense, "planned")}>Réactiver</Button>}
                  {expense.status !== "paid" && <Button size="small" variant="ghost" onClick={() => updateStatus(expense, "cancelled")}><X className="h-4 w-4" /></Button>}
                  <Button size="small" variant="danger" aria-label={`Supprimer ${expense.name}`} onClick={() => { if (window.confirm(`Voulez-vous vraiment supprimer "${expense.name}" ?`)) deletePlannedExpense(expense.id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>;
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
