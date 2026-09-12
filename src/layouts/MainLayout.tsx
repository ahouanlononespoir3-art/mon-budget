import {
  BarChart3,
  Home,
  Menu,
  Plus,
  Receipt,
  ShoppingCart,
  Target,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import {
  ExpenseForm,
  type ExpenseFormData,
} from "../components/expenses/ExpenseForm";
import { OfflineBanner } from "../components/ui/OfflineBanner";
import { InstallPrompt } from "../components/ui/InstallPrompt";

import { useBudget } from "../context/BudgetContext";

import type { Expense } from "../types/finance";
import { isOnboardingCompleted } from "../services/storage";

interface MainLayoutProps {
  children: ReactNode;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: typeof Home;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Accueil",
    path: "/",
    icon: Home,
  },
  {
    label: "Dépenses",
    path: "/expenses",
    icon: Receipt,
  },
  {
    label: "Objectifs",
    path: "/goals",
    icon: Target,
  },
  {
    label: "Statistiques",
    path: "/statistics",
    icon: BarChart3,
  },
];

function createExpenseId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `expense-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function MainLayout({
  children,
}: MainLayoutProps) {
  const location = useLocation();

  const {
    addExpense,
    budgetMonth,
    categories,
  } = useBudget();

  const [
    isExpenseFormOpen,
    setIsExpenseFormOpen,
  ] = useState(false);

  const handleExpenseSubmit = (
    data: ExpenseFormData
  ) => {
    const now = new Date().toISOString();

    const expense: Expense = {
      id: createExpenseId(),
      budgetMonthId: budgetMonth.id,
      amount: Math.round(data.amount),
      description: data.description.trim(),
      categoryId: data.categoryId,
      date: data.date,
      note: data.note?.trim() || undefined,
      refundedAmount: 0,
      createdAt: now,
      updatedAt: now,
    };

    addExpense(expense);

    setIsExpenseFormOpen(false);
  };

  const isActive = (
    path: string
  ): boolean => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  if (!isOnboardingCompleted()) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <OfflineBanner />
      <InstallPrompt />
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-700 text-white">
              <WalletIcon />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Mon Budget
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assistant budgétaire
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navigationItems.map(
              (item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                      isActive(item.path)
                        ? "bg-slate-900 dark:bg-slate-700 text-white"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              }
            )}

            <Link
              to="/future-purchases"
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive("/future-purchases")
                  ? "bg-slate-900 dark:bg-slate-700 text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <ShoppingCart size={18} />
              Achats
            </Link>

            <Link
              to="/more"
              className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                isActive("/more")
                  ? "bg-slate-900 dark:bg-slate-700 text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              Plus
            </Link>
          </nav>

          <button
            type="button"
            onClick={() =>
              setIsExpenseFormOpen(true)
            }
            className="hidden items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:hover:bg-slate-600 md:flex"
          >
            <Plus size={18} />
            Ajouter
          </button>

        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8">
        {children}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800/95 backdrop-blur md:hidden">
        <div className="relative mx-auto flex h-16 max-w-lg items-center justify-around px-2">
          <MobileNavigationLink
            to="/"
            label="Accueil"
            icon={Home}
            active={isActive("/")}
          />

          <MobileNavigationLink
            to="/expenses"
            label="Dépenses"
            icon={Receipt}
            active={isActive("/expenses")}
          />

          <button
            type="button"
            onClick={() =>
              setIsExpenseFormOpen(true)
            }
            aria-label="Ajouter une dépense"
            className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-700 text-white shadow-lg ring-4 ring-white dark:ring-slate-800"
          >
            <Plus size={25} />
          </button>

          <div className="w-16" />

          <MobileNavigationLink
            to="/goals"
            label="Objectifs"
            icon={Target}
            active={isActive("/goals")}
          />

          <MobileNavigationLink
            to="/more"
            label="Plus"
            icon={Menu}
            active={isActive("/more")}
          />
        </div>
      </div>

      {isExpenseFormOpen && (
        <ExpenseForm
          categories={categories}
          onClose={() =>
            setIsExpenseFormOpen(false)
          }
          onSubmit={handleExpenseSubmit}
        />
      )}
    </div>
  );
}

interface MobileNavigationLinkProps {
  to: string;
  label: string;
  icon: typeof Home;
  active: boolean;
}

function MobileNavigationLink({
  to,
  label,
  icon: Icon,
  active,
}: MobileNavigationLinkProps) {
  return (
    <Link
      to={to}
      className={`flex min-w-16 flex-col items-center gap-1 rounded-xl px-2 py-1 text-[11px] font-medium ${
        active
          ? "text-slate-900 dark:text-slate-100"
          : "text-slate-400 dark:text-slate-500"
      }`}
    >
      <Icon size={19} />
      <span>{label}</span>
    </Link>
  );
}

function WalletIcon() {
  return (
    <div className="relative h-5 w-6 rounded-md border-2 border-white">
      <div className="absolute -right-1 top-1 h-2 w-2 rounded-full bg-white dark:bg-slate-800" />
    </div>
  );
}