import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    displayName?: string
  ) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  resetPassword: (
    email: string
  ) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();

  if (normalized.includes("invalid login credentials")) {
    return "Adresse e-mail ou mot de passe incorrect.";
  }

  if (normalized.includes("email not confirmed")) {
    return "Ton adresse e-mail n'est pas encore confirmée.";
  }

  if (normalized.includes("user already registered")) {
    return "Un compte existe déjà avec cette adresse e-mail.";
  }

  if (normalized.includes("password")) {
    return "Le mot de passe doit respecter les exigences de sécurité.";
  }

  if (normalized.includes("rate limit")) {
    return "Trop de tentatives. Réessaie dans quelques minutes.";
  }

  if (normalized.includes("invalid email")) {
    return "L'adresse e-mail n'est pas valide.";
  }

  return message || "Une erreur est survenue.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        console.error("Erreur récupération session:", error);
        setSession(null);
        setUser(null);
      } else {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }

      setLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signUp(email: string, password: string, displayName?: string) {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { display_name: displayName?.trim() || undefined } },
    });

    if (error) {
      return { error: translateAuthError(error.message), needsConfirmation: false };
    }

    return { error: null, needsConfirmation: Boolean(data.user) && !data.session };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    return { error: error ? translateAuthError(error.message) : null };
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error: error ? translateAuthError(error.message) : null };
  }

  async function resetPassword(email: string) {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim().toLowerCase(),
      { redirectTo }
    );
    return { error: error ? translateAuthError(error.message) : null };
  }

  const value = useMemo<AuthContextValue>(
    () => ({ user, session, loading, signUp, signIn, signOut, resetPassword }),
    [user, session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider.");
  }

  return context;
}
