import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { Category } from "../../types/finance";
import { getCurrencyLabel, getStoredCurrency } from "../../utils/currency";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

const expenseSchema = z.object({
  amount: z
    .number({
      error: "Le montant est obligatoire.",
    })
    .positive("Le montant doit être supérieur à 0."),

  description: z
    .string()
    .trim()
    .min(2, "La description doit contenir au moins 2 caractères.")
    .max(100, "La description est trop longue."),

  categoryId: z
    .string()
    .min(1, "Veuillez sélectionner une catégorie."),

  date: z
    .string()
    .min(1, "La date est obligatoire."),

  note: z
    .string()
    .trim()
    .max(300, "La note est trop longue.")
    .optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => void;
  initialValues?: Partial<ExpenseFormData>;
  title?: string;
}

function getTodayDate(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function ExpenseForm({
  categories,
  onClose,
  onSubmit,
  initialValues,
  title = "Ajouter une dépense",
}: ExpenseFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: initialValues?.amount,
      description: initialValues?.description ?? "",
      categoryId:
        initialValues?.categoryId ??
        categories.find((category) => category.active)?.id ??
        "",
      date: initialValues?.date ?? getTodayDate(),
      note: initialValues?.note ?? "",
    },
  });

  const activeCategories = categories.filter(
    (category) => category.active
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
      <Card className="w-full rounded-b-none p-5 sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Nouvelle opération
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enregistrez une dépense réellement effectuée.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {activeCategories.length === 0 ? (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">
              Aucune catégorie disponible
            </p>

            <p className="mt-1 text-sm text-amber-700">
              Activez au moins une catégorie avant d&apos;enregistrer
              une dépense.
            </p>

            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="mt-6 space-y-5"
          >
            <div>
              <label
                htmlFor="expense-amount"
                className="text-sm font-semibold text-slate-700"
              >
                Montant
              </label>

              <div className="mt-2 flex items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">
                <input
                  id="expense-amount"
                  type="number"
                  min="1"
                  step="1"
                  inputMode="numeric"
                  placeholder="Ex. 5000"
                  {...register("amount", {
                    valueAsNumber: true,
                  })}
                  className="w-full bg-transparent py-3 text-lg font-semibold outline-none"
                />

                <span className="text-sm font-semibold text-slate-500">
                    {getCurrencyLabel(getStoredCurrency()).split(" — ")[0]}
                </span>
              </div>

              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="expense-description"
                className="text-sm font-semibold text-slate-700"
              >
                Description
              </label>

              <input
                id="expense-description"
                type="text"
                placeholder="Ex. Déjeuner"
                {...register("description")}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="expense-category"
                className="text-sm font-semibold text-slate-700"
              >
                Catégorie
              </label>

              <select
                id="expense-category"
                {...register("categoryId")}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                {activeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.categoryId.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="expense-date"
                className="text-sm font-semibold text-slate-700"
              >
                Date
              </label>

              <div className="relative mt-2">
                <CalendarDays
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="expense-date"
                  type="date"
                  {...register("date")}
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              {errors.date && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.date.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="expense-note"
                className="text-sm font-semibold text-slate-700"
              >
                Note
                <span className="ml-1 font-normal text-slate-400">
                  (facultatif)
                </span>
              </label>

              <textarea
                id="expense-note"
                rows={3}
                placeholder="Ajoutez une précision si nécessaire..."
                {...register("note")}
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />

              {errors.note && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.note.message}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Annuler
              </Button>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Enregistrement..."
                  : "Enregistrer la dépense"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}