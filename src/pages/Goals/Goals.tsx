import { useMemo, useState } from "react";
import { Plus, Trash2, Pencil, CheckCircle2, PauseCircle } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { useBudget } from "../../context/BudgetContext";
import type { GoalStatus, SavingsGoal } from "../../types/finance";
import { formatMoney } from "../../utils/formatMoney";
import { createId } from "../../utils/id";

const statusLabels: Record<GoalStatus, string> = {
  active: "Actif",
  paused: "En pause",
  achieved: "Atteint",
  purchased: "Acheté",
  cancelled: "Annulé",
};

export function Goals() {
  const {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
  } = useBudget();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [savedAmount, setSavedAmount] = useState("");
  const [priority, setPriority] = useState("1");
  const [targetDate, setTargetDate] = useState("");
  const [note, setNote] = useState("");

  const activeGoals = useMemo(
    () =>
      savingsGoals
        .filter((goal) => goal.status === "active" || goal.status === "paused")
        .sort((a, b) => a.priority - b.priority),
    [savingsGoals]
  );

  const resetForm = () => {
    setName("");
    setTargetAmount("");
    setSavedAmount("");
    setPriority("1");
    setTargetDate("");
    setNote("");
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (goal: SavingsGoal) => {
    setEditingId(goal.id);
    setName(goal.name);
    setTargetAmount(String(goal.targetAmount));
    setSavedAmount(String(goal.savedAmount));
    setPriority(String(goal.priority));
    setTargetDate(goal.targetDate ?? "");
    setNote(goal.note ?? "");
    setShowForm(true);
  };

  const handleSubmit = () => {
    const target = Math.max(0, Math.round(Number(targetAmount)));
    const saved = Math.max(0, Math.min(target, Math.round(Number(savedAmount))));
    const parsedPriority = Math.max(1, Math.round(Number(priority)));

    if (!name.trim() || target <= 0) {
      return;
    }

    const now = new Date().toISOString();

    if (editingId) {
      const current = savingsGoals.find((goal) => goal.id === editingId);

      if (!current) {
        return;
      }

      updateSavingsGoal({
        ...current,
        name: name.trim(),
        targetAmount: target,
        savedAmount: saved,
        priority: parsedPriority,
        targetDate: targetDate || null,
        note: note.trim() || undefined,
        status: saved >= target ? "achieved" : current.status,
        updatedAt: now,
      });
    } else {
      addSavingsGoal({
        id: createId("goal"),
        name: name.trim(),
        targetAmount: target,
        savedAmount: saved,
        priority: parsedPriority,
        status: saved >= target ? "achieved" : "active",
        targetDate: targetDate || null,
        note: note.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      });
    }

    resetForm();
    setShowForm(false);
  };

  const togglePause = (goal: SavingsGoal) => {
    updateSavingsGoal({
      ...goal,
      status: goal.status === "paused" ? "active" : "paused",
      updatedAt: new Date().toISOString(),
    });
  };

  const markAchieved = (goal: SavingsGoal) => {
    updateSavingsGoal({
      ...goal,
      savedAmount: goal.targetAmount,
      status: "achieved",
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Objectifs
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Construis progressivement ton épargne.
          </p>
        </div>

        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un objectif
        </Button>
      </div>

      {showForm && (
        <Card
          title={editingId ? "Modifier l'objectif" : "Nouvel objectif"}
          description="Définis précisément ce que tu souhaites financer."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nom
              </label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ex. Ordinateur"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Montant cible
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={targetAmount}
                onChange={(event) => setTargetAmount(event.target.value)}
                placeholder="400000"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Déjà épargné
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={savedAmount}
                onChange={(event) => setSavedAmount(event.target.value)}
                placeholder="0"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Priorité
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Date cible
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Note
              </label>
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optionnel"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
            >
              Annuler
            </Button>

            <Button onClick={handleSubmit}>
              Enregistrer
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {activeGoals.map((goal) => {
          const percentage =
            goal.targetAmount > 0
              ? Math.min((goal.savedAmount / goal.targetAmount) * 100, 100)
              : 0;

          const remaining = Math.max(
            0,
            goal.targetAmount - goal.savedAmount
          );

          return (
            <Card key={goal.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      {goal.name}
                    </h2>

                    <span className="rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                      Priorité {goal.priority}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {statusLabels[goal.status]}
                  </p>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="small"
                    aria-label={`Modifier ${goal.name}`}
                    onClick={() => openEdit(goal)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="danger"
                    size="small"
                    aria-label={`Supprimer ${goal.name}`}
                    onClick={() => {
                      const confirmed = window.confirm(
                        `Voulez-vous vraiment supprimer l'objectif "${goal.name}" ? L'épargne déjà enregistrée sera perdue.`
                      );
                      if (confirmed) {
                        deleteSavingsGoal(goal.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    {formatMoney(goal.savedAmount)}
                  </span>
                  <strong className="text-slate-900 dark:text-slate-100">
                    {formatMoney(goal.targetAmount)}
                  </strong>
                </div>

                <ProgressBar value={percentage} />

                <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{percentage.toFixed(1)} %</span>
                  <span>Reste {formatMoney(remaining)}</span>
                </div>
              </div>

              {goal.targetDate && (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Date cible : {goal.targetDate}
                </p>
              )}

              {goal.note && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {goal.note}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {goal.status !== "achieved" && (
                  <>
                    <Button
                      size="small"
                      onClick={() => markAchieved(goal)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Atteint
                    </Button>

                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => togglePause(goal)}
                    >
                      <PauseCircle className="mr-2 h-4 w-4" />
                      {goal.status === "paused" ? "Reprendre" : "Pause"}
                    </Button>
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {activeGoals.length === 0 && (
        <Card>
          <div className="py-10 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              Aucun objectif pour le moment.
            </p>
            <Button className="mt-4" onClick={openCreate}>
              Créer mon premier objectif
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}