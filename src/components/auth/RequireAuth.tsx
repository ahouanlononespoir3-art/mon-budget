import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 px-6">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-blue-600" />
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Chargement de ton espace...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
