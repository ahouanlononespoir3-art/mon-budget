import { Navigate, Route, Routes } from "react-router-dom";

import { MainLayout } from "../layouts/MainLayout";
import { RequireAuth } from "../components/auth/RequireAuth";

import { Auth } from "../pages/Auth/Auth";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { Expenses } from "../pages/Expenses/Expenses";
import { Goals } from "../pages/Goals/Goals";
import { Onboarding } from "../pages/Onboarding/Onboarding";
import { Statistics } from "../pages/Statistics/Statistics";
import { RecurringExpenses } from "../pages/Recurring/RecurringExpenses";
import { Simulator } from "../pages/Simulator/Simulator";
import { Calendar } from "../pages/Calendar/Calendar";
import { More } from "../pages/Settings/More";
import { BudgetSettings } from "../pages/Settings/BudgetSettings";
import { DataSettings } from "../pages/Settings/DataSettings";
import { Categories } from "../pages/Settings/Categories";
import { PlannedExpenses } from "../pages/Expenses/PlannedExpenses";
import { Assistant } from "../pages/Assistant/Assistant";
import { Alerts } from "../pages/Assistant/Alerts";
import { FuturePurchases } from "../pages/Purchases/FuturePurchases";
import { History } from "../pages/Statistics/History";

function Protected({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Erreur 404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Page introuvable</h1>
        <p className="mt-2 text-slate-500">Cette page n'existe pas ou a été déplacée.</p>
        <a href="/" className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">Retour à l'accueil</a>
      </div>
    </main>
  );
}
import { isOnboardingCompleted } from "../services/storage";

function AppEntry() {
  return (
    <Protected>
      {isOnboardingCompleted() ? (
      <MainLayout>
        <Dashboard />
      </MainLayout>
      ) : (
        <Navigate to="/onboarding" replace />
      )}
    </Protected>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />

      <Route
        path="/onboarding"
        element={
          <Protected>
            <Onboarding />
          </Protected>
        }
      />

      <Route
        path="/"
        element={<AppEntry />}
      />

      <Route
        path="/expenses"
        element={
          <Protected><MainLayout><Expenses /></MainLayout></Protected>
        }
      />

      <Route
        path="/expenses/planned"
        element={
          <Protected><MainLayout><PlannedExpenses /></MainLayout></Protected>
        }
      />

      <Route
        path="/goals"
        element={
          <Protected><MainLayout><Goals /></MainLayout></Protected>
        }
      />

      <Route
        path="/future-purchases"
        element={
          <Protected><MainLayout><FuturePurchases /></MainLayout></Protected>
        }
      />

      <Route
        path="/purchases"
        element={
          <Protected><MainLayout><FuturePurchases /></MainLayout></Protected>
        }
      />

      <Route path="/assistant" element={<Protected><MainLayout><Assistant /></MainLayout></Protected>} />
      <Route path="/alerts" element={<Protected><MainLayout><Alerts /></MainLayout></Protected>} />

      <Route
        path="/statistics"
        element={
          <Protected><MainLayout><Statistics /></MainLayout></Protected>
        }
      />

      <Route
        path="/history"
        element={
          <Protected><MainLayout><History /></MainLayout></Protected>
        }
      />

      <Route
        path="/recurring"
        element={
          <Protected><MainLayout><RecurringExpenses /></MainLayout></Protected>
        }
      />

      <Route
        path="/simulator"
        element={
          <Protected><MainLayout><Simulator /></MainLayout></Protected>
        }
      />

      <Route
        path="/calendar"
        element={
          <Protected><MainLayout><Calendar /></MainLayout></Protected>
        }
      />

      <Route
        path="/settings/budget"
        element={
          <Protected><MainLayout><BudgetSettings /></MainLayout></Protected>
        }
      />

      <Route
        path="/settings/data"
        element={
          <Protected><MainLayout><DataSettings /></MainLayout></Protected>
        }
      />

      <Route
        path="/settings/categories"
        element={
          <Protected><MainLayout><Categories /></MainLayout></Protected>
        }
      />

      <Route
        path="/more"
        element={
          <Protected><MainLayout><More /></MainLayout></Protected>
        }
      />

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}