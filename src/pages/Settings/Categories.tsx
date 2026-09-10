import { useState } from "react";
import { Pencil, Plus, Power, Trash2 } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useBudget } from "../../context/BudgetContext";
import type { Category } from "../../types/finance";
import { createId } from "../../utils/id";
import { formatMoney } from "../../utils/formatMoney";

export function Categories() {
  const { categories, expenses, plannedExpenses, updateCategories } = useBudget();
  const [name, setName] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const save = () => {
    if (!name.trim()) return;
    const now = new Date().toISOString();
    if (editingId) {
      updateCategories(categories.map((category) => category.id === editingId ? { ...category, name: name.trim(), monthlyLimit: monthlyLimit ? Math.max(0, Math.round(Number(monthlyLimit))) : null, updatedAt: now } : category));
    } else {
      const category: Category = { id: createId("category"), name: name.trim(), monthlyLimit: monthlyLimit ? Math.max(0, Math.round(Number(monthlyLimit))) : null, active: true, createdAt: now, updatedAt: now };
      updateCategories([...categories, category]);
    }
    setName("");
    setMonthlyLimit("");
    setEditingId(null);
  };

  const edit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setMonthlyLimit(category.monthlyLimit == null ? "" : String(category.monthlyLimit));
  };

  const remove = (category: Category) => {
    if (expenses.some((expense) => expense.categoryId === category.id) || plannedExpenses.some((expense) => expense.categoryId === category.id)) return;
    updateCategories(categories.filter((item) => item.id !== category.id));
  };

  return <div className="space-y-6">
    <header><p className="text-sm font-medium text-slate-500">Organisation</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Catégories</h1><p className="mt-1 text-sm text-slate-500">Classe tes dépenses et surveille les budgets par catégorie.</p></header>
    <Card title={editingId ? "Modifier la catégorie" : "Ajouter une catégorie"}>
      <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom de la catégorie" className="rounded-xl border border-slate-300 px-4 py-3" />
        <input type="number" min="0" value={monthlyLimit} onChange={(event) => setMonthlyLimit(event.target.value)} placeholder="Budget mensuel (facultatif)" className="rounded-xl border border-slate-300 px-4 py-3" />
        <Button onClick={save}><Plus className="mr-2 h-4 w-4" />{editingId ? "Modifier" : "Ajouter"}</Button>
      </div>
    </Card>
    <div className="grid gap-4 md:grid-cols-2">
      {categories.map((category) => {
        const actual = expenses.filter((expense) => expense.categoryId === category.id).reduce((sum, expense) => sum + Math.max(0, expense.amount - expense.refundedAmount), 0);
        const planned = plannedExpenses.filter((expense) => expense.categoryId === category.id && expense.status === "planned").reduce((sum, expense) => sum + expense.amount, 0);
        const exceeded = category.monthlyLimit != null && actual + planned > category.monthlyLimit;
        return <Card key={category.id}>
          <div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-slate-900">{category.name}</h2><p className="mt-1 text-sm text-slate-500">{category.active ? "Active" : "Inactive"}</p></div><div className="flex gap-1"><Button size="small" variant="ghost" onClick={() => edit(category)} aria-label={`Modifier ${category.name}`}><Pencil className="h-4 w-4" /></Button><Button size="small" variant="ghost" onClick={() => updateCategories(categories.map((item) => item.id === category.id ? { ...item, active: !item.active, updatedAt: new Date().toISOString() } : item))} aria-label={`Activer ou désactiver ${category.name}`}><Power className="h-4 w-4" /></Button><Button size="small" variant="danger" onClick={() => remove(category)} aria-label={`Supprimer ${category.name}`}><Trash2 className="h-4 w-4" /></Button></div></div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><p className="text-slate-500">Réel</p><strong>{formatMoney(actual)}</strong></div><div><p className="text-slate-500">Prévu</p><strong>{formatMoney(planned)}</strong></div></div>
          {category.monthlyLimit != null && <p className={`mt-3 text-sm font-semibold ${exceeded ? "text-red-600" : "text-emerald-600"}`}>Budget : {formatMoney(category.monthlyLimit)}{exceeded ? " · Dépassement" : ""}</p>}
        </Card>;
      })}
    </div>
  </div>;
}
