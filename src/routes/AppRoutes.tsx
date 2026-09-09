import { Navigate, Route, Routes } from "react-router-dom";

import { MainLayout } from "../layouts/MainLayout";
import { Dashboard } from "../pages/Dashboard/Dashboard";
import { Expenses } from "../pages/Expenses/Expenses";
import { Goals } from "../pages/Goals/Goals";
import { RecurringExpenses } from "../pages/Recurring/RecurringExpenses";
import { Statistics } from "../pages/Statistics/Statistics";
import { More } from "../pages/Settings/More";

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        }
      />

      <Route
        path="/expenses"
        element={
          <MainLayout>
            <Expenses />
          </MainLayout>
        }
      />

      <Route
        path="/recurring"
        element={
          <MainLayout>
            <RecurringExpenses />
          </MainLayout>
        }
      />

      <Route
        path="/goals"
        element={
          <MainLayout>
            <Goals />
          </MainLayout>
        }
      />

      <Route
        path="/statistics"
        element={
          <MainLayout>
            <Statistics />
          </MainLayout>
        }
      />

      <Route
        path="/more"
        element={
          <MainLayout>
            <More />
          </MainLayout>
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}