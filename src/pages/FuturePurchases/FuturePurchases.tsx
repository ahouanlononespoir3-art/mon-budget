import { useMemo, useState } from "react";
import { Check, Pencil, Plus, ShoppingCart, Trash2, X } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useBudget } from "../../context/BudgetContext";
import type { FuturePurchase, FuturePurchaseNeedType, FuturePurchasePriority } from "../../types/finance";
import { formatMoney } from "../../utils/formatMoney";
import { createId } from "../../utils/id";

const priorityLabels: Record<FuturePurchasePriority, string> = { high: "Priorité haute", medium: "Priorité moyenne", low: "Priorité basse" };
const needLabels: Record<FuturePurchaseNeedType, string> = { necessary: "Nécessaire", useful: "Utile", want: "Envie" };

export function FuturePurchases() {
  const { futurePurchases, addFuturePurchase, updateFuturePurchase, deleteFuturePurchase, categories } = useBudget();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FuturePurchase | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [priority, setPriority] = useState<FuturePurchasePriority>("medium");
  const [needType, setNeedType] = useState<FuturePurchaseNeedType>("useful");
  const [targetDate, setTargetDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [note, setNote] = useState("");

  const pending = useMemo(() => [...futurePurchases].filter((purchase) => !purchase.purchased).sort((a, b) => ({ high: 1, medium: 2, low: 3 }[a.priority] - ({ high: 1, medium: 2, low: 3 }[b.priority]) || a.createdAt.localeCompare(b.createdAt))), [futurePurchases]);
  const completed = useMemo(() => futurePurchases.filter((purchase) => purchase.purchased), [futurePurchases]);

  const openForm = (purchase?: FuturePurchase) => {
    setEditing(purchase ?? null);
    setName(purchase?.name ?? "");
    setAmount(purchase?.estimatedAmount ?? 0);
    setPriority(purchase?.priority ?? "medium");
    setNeedType(purchase?.needType ?? "useful");
    setTargetDate(purchase?.targetDate ?? "");
    setCategoryId(purchase?.categoryId ?? "");
    setNote(purchase?.note ?? "");
    setOpen(true);
  };

  const closeForm = () => { setOpen(false); setEditing(null); };
  const save = () => {
    const safeName = name.trim();
    const safeAmount = Math.max(0, Math.round(amount));
    if (!safeName || safeAmount <= 0) return;
    const now = new Date().toISOString();
    const value = { name: safeName, estimatedAmount: safeAmount, priority, needType, targetDate: targetDate || null, categoryId: categoryId || null, note: note.trim() || undefined, updatedAt: now };
    if (editing) updateFuturePurchase({ ...editing, ...value });
    else addFuturePurchase({ id: createId("purchase"), ...value, purchased: false, createdAt: now });
    closeForm();
  };
  const togglePurchased = (purchase: FuturePurchase) => updateFuturePurchase({ ...purchase, purchased: !purchase.purchased, updatedAt: new Date().toISOString() });

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Priorités</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Achats futurs</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Planifie tes prochains achats sans perdre de vue ton budget.</p></div><Button onClick={() => openForm()}><Plus className="mr-2 h-4 w-4" />Ajouter un achat</Button></header>
    <div className="grid gap-4 sm:grid-cols-3"><Card><ShoppingCart className="text-blue-600 dark:text-blue-400" size={20} /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Achats planifiés</p><p className="text-xl font-bold">{pending.length}</p></Card><Card><p className="text-sm text-slate-500 dark:text-slate-400">Montant estimé</p><p className="mt-1 text-xl font-bold">{formatMoney(pending.reduce((sum, purchase) => sum + purchase.estimatedAmount, 0))}</p></Card><Card><Check className="text-emerald-600 dark:text-emerald-400" size={20} /><p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Déjà réalisés</p><p className="text-xl font-bold">{completed.length}</p></Card></div>
    <Card title="File des achats" description="Les priorités hautes apparaissent en premier.">{pending.length === 0 ? <p className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">Aucun achat futur.</p> : <div className="space-y-3">{pending.map((purchase) => <div key={purchase.id} className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap gap-2"><h2 className="font-bold">{purchase.name}</h2><span className="rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-1 text-xs">{priorityLabels[purchase.priority]}</span><span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-1 text-xs text-blue-700 dark:text-blue-300">{needLabels[purchase.needType]}</span></div><p className="mt-2 font-bold">{formatMoney(purchase.estimatedAmount)}</p>{purchase.targetDate && <p className="text-xs text-slate-500 dark:text-slate-400">Date souhaitée : {purchase.targetDate}</p>}{purchase.note && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{purchase.note}</p>}</div><div className="flex gap-2"><Button size="small" variant="secondary" onClick={() => togglePurchased(purchase)}><Check className="mr-1 h-4 w-4" />Fait</Button><Button size="small" variant="ghost" onClick={() => openForm(purchase)} aria-label={`Modifier ${purchase.name}`}><Pencil size={16} /></Button><Button size="small" variant="danger" onClick={() => { if (window.confirm(`Voulez-vous vraiment supprimer "${purchase.name}" ?`)) deleteFuturePurchase(purchase.id); }} aria-label={`Supprimer ${purchase.name}`}><Trash2 size={16} /></Button></div></div></div>)}</div>}</Card>
    {completed.length > 0 && <Card title="Achats réalisés"><div className="space-y-2">{completed.map((purchase) => <div key={purchase.id} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-900 p-3"><p className="font-semibold line-through">{purchase.name}</p><Button size="small" variant="ghost" onClick={() => togglePurchased(purchase)}>Restaurer</Button></div>)}</div></Card>}
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"><div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white dark:bg-slate-800 p-5"><div className="flex items-center justify-between"><h2 className="text-xl font-bold">{editing ? "Modifier l'achat" : "Nouvel achat"}</h2><button type="button" onClick={closeForm} aria-label="Fermer"><X /></button></div><div className="mt-5 space-y-4"><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nom" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3" /><input type="number" min="1" value={amount} onChange={(event) => setAmount(Number(event.target.value))} placeholder="Montant estimé" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3" /><div className="grid gap-4 sm:grid-cols-2"><select value={priority} onChange={(event) => setPriority(event.target.value as FuturePurchasePriority)} className="rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3"><option value="high">Haute</option><option value="medium">Moyenne</option><option value="low">Basse</option></select><select value={needType} onChange={(event) => setNeedType(event.target.value as FuturePurchaseNeedType)} className="rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3"><option value="necessary">Nécessaire</option><option value="useful">Utile</option><option value="want">Envie</option></select></div><input type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3" /><select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3"><option value="">Aucune catégorie</option>{categories.filter((category) => category.active).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Note" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3" /><div className="flex justify-end gap-3"><Button variant="secondary" onClick={closeForm}>Annuler</Button><Button onClick={save} disabled={!name.trim() || amount <= 0}>Enregistrer</Button></div></div></div></div>}
  </div>;
}
