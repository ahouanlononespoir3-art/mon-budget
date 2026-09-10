import { Component, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { BudgetProvider } from "./context/BudgetContext";
import { SyncProvider } from "./context/SyncContext";
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
        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Une erreur est survenue</h1>
            <p className="mt-2 text-slate-500">Recharge la page pour reprendre l'utilisation de Mon Budget.</p>
            <button type="button" onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white">Recharger</button>
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
      <BrowserRouter>
        <AuthProvider>
          <BudgetProvider>
            <SyncProvider>
              <AppRoutes />
            </SyncProvider>
          </BudgetProvider>
        </AuthProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

export default App;