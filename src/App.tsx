import { Component, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { BudgetProvider } from "./context/BudgetContext";
import { SyncProvider } from "./context/SyncContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AppRoutes } from "./routes/AppRoutes";

class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center dark:bg-slate-900">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Une erreur est survenue</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Recharge la page pour reprendre l'utilisation de Mon Budget.</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white dark:bg-slate-700">Recharger</button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <AppErrorBoundary>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <BudgetProvider>
              <SyncProvider>
                <AppRoutes />
              </SyncProvider>
            </BudgetProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </AppErrorBoundary>
  );
}

export default App;