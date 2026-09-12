import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { MainLayout } from "../layouts/MainLayout";
import { RequireAuth } from "../components/auth/RequireAuth";
import { isOnboardingCompleted } from "../services/storage";

const Auth = lazy(() => import("../pages/Auth/Auth").then((m) => ({ default: m.Auth })));
const Dashboard = lazy(() => import("../pages/Dashboard/Dashboard").then((m) => ({ default: m.Dashboard })));
const Expenses = lazy(() => import("../pages/Expenses/Expenses").then((m) => ({ default: m.Expenses })));
const Goals = lazy(() => import("../pages/Goals/Goals").then((m) => ({ default: m.Goals })));
const Onboarding = lazy(() => import("../pages/Onboarding/Onboarding").then((m) => ({ default: m.Onboarding })));
const Statistics = lazy(() => import("../pages/Statistics/Statistics").then((m) => ({ default: m.Statistics })));
const RecurringExpenses = lazy(() => import("../pages/Recurring/RecurringExpenses").then((m) => ({ default: m.RecurringExpenses })));
const Simulator = lazy(() => import("../pages/Simulator/Simulator").then((m) => ({ default: m.Simulator })));
const Calendar = lazy(() => import("../pages/Calendar/Calendar").then((m) => ({ default: m.Calendar })));
const More = lazy(() => import("../pages/Settings/More").then((m) => ({ default: m.More })));
const BudgetSettings = lazy(() => import("../pages/Settings/BudgetSettings").then((m) => ({ default: m.BudgetSettings })));
const DataSettings = lazy(() => import("../pages/Settings/DataSettings").then((m) => ({ default: m.DataSettings })));
const Categories = lazy(() => import("../pages/Settings/Categories").then((m) => ({ default: m.Categories })));
const PlannedExpenses = lazy(() => import("../pages/Expenses/PlannedExpenses").then((m) => ({ default: m.PlannedExpenses })));
const Assistant = lazy(() => import("../pages/Assistant/Assistant").then((m) => ({ default: m.Assistant })));
const Alerts = lazy(() => import("../pages/Assistant/Alerts").then((m) => ({ default: m.Alerts })));
const FuturePurchases = lazy(() => import("../pages/Purchases/FuturePurchases").then((m) => ({ default: m.FuturePurchases })));
const History = lazy(() => import("../pages/Statistics/History").then((m) => ({ default: m.History })));
const Notifications = lazy(() => import("../pages/Assistant/Notifications").then((m) => ({ default: m.Notifications })));
const Profile = lazy(() => import("../pages/Settings/Profile").then((m) => ({ default: m.Profile })));
const Security = lazy(() => import("../pages/Settings/Security").then((m) => ({ default: m.Security })));

function Protected({ children }: { children: React.ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

function RouteLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-600 dark:border-t-slate-100" />
    </div>
  );
}

function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 px-6 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Erreur 404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">Page introuvable</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Cette page n'existe pas ou a été déplacée.</p>
        <a href="/" className="mt-6 inline-flex rounded-xl bg-slate-900 dark:bg-slate-700 px-4 py-3 font-semibold text-white">Retour à l'accueil</a>
      </div>
    </main>
  );
}

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
    <Suspense fallback={<RouteLoading />}>
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
      <Route path="/notifications" element={<Protected><MainLayout><Notifications /></MainLayout></Protected>} />

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

      <Route path="/settings/profile" element={<Protected><MainLayout><Profile /></MainLayout></Protected>} />
      <Route path="/settings/security" element={<Protected><MainLayout><Security /></MainLayout></Protected>} />

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
    </Suspense>
  );
}