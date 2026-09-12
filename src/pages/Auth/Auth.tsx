import { useState, type FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

type Mode = "login" | "signup" | "reset";

export function Auth() {
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setPassword("");
    setPasswordConfirmation("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      if (mode === "reset") {
        if (!email.trim()) {
          setError("Entre ton adresse e-mail.");
          return;
        }
        const result = await resetPassword(email);
        if (result.error) setError(result.error);
        else setMessage("Si cette adresse possède un compte, un e-mail de récupération a été envoyé.");
        return;
      }

      if (mode === "signup") {
        if (password.length < 8) {
          setError("Le mot de passe doit contenir au moins 8 caractères.");
          return;
        }
        if (password !== passwordConfirmation) {
          setError("Les deux mots de passe ne correspondent pas.");
          return;
        }
        const result = await signUp(email, password, name);
        if (result.error) setError(result.error);
        else if (result.needsConfirmation) setMessage("Compte créé. Consulte ton e-mail pour confirmer ton adresse avant de te connecter.");
        else navigate("/", { replace: true });
        return;
      }

      const result = await signIn(email, password);
      if (result.error) setError(result.error);
      else navigate("/", { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  const title = mode === "login" ? "Bon retour" : mode === "signup" ? "Créer ton compte" : "Mot de passe oublié";
  const subtitle = mode === "login" ? "Connecte-toi pour retrouver ton budget." : mode === "signup" ? "Commence à gérer ton argent intelligemment." : "Entre ton e-mail pour recevoir un lien de récupération.";

  return <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 px-4 py-8"><div className="w-full max-w-md"><div className="mb-8 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-700 text-white shadow-lg"><span className="text-2xl font-black">MB</span></div><h1 className="mt-5 text-3xl font-bold text-slate-900 dark:text-slate-100">Mon Budget</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p></div><div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 shadow-sm sm:p-8"><h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h2><form onSubmit={handleSubmit} className="mt-6 space-y-4">
    {mode === "signup" && <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nom</span><div className="relative"><UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" /><input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Ton nom" autoComplete="name" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></label>}
    <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Adresse e-mail</span><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="exemple@email.com" autoComplete="email" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 py-3 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></div></label>
    {mode !== "reset" && <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Mot de passe</span><div className="relative"><LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" /><input required type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Minimum 8 caractères" autoComplete={mode === "signup" ? "new-password" : "current-password"} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 py-3 pl-11 pr-12 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></div></label>}
    {mode === "signup" && <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmer le mot de passe</span><input required type="password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} placeholder="Répète ton mot de passe" autoComplete="new-password" className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>}
    {error && <div role="alert" className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-3 text-sm text-red-700 dark:text-red-300">{error}</div>}{message && <div role="status" className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950 p-3 text-sm text-emerald-700 dark:text-emerald-300">{message}</div>}
    <button type="submit" disabled={submitting} className="w-full rounded-xl bg-slate-900 dark:bg-slate-700 px-4 py-3 font-semibold text-white disabled:opacity-50">{submitting ? "Chargement..." : mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Envoyer le lien"}</button>
  </form><div className="mt-6 space-y-3 text-center text-sm">{mode === "login" && <><button type="button" onClick={() => switchMode("reset")} className="font-medium text-blue-600 dark:text-blue-400">Mot de passe oublié ?</button><p className="text-slate-500 dark:text-slate-400">Pas encore de compte ? <button type="button" onClick={() => switchMode("signup")} className="font-semibold text-blue-600 dark:text-blue-400">Créer un compte</button></p></>}{mode === "signup" && <p className="text-slate-500 dark:text-slate-400">Tu as déjà un compte ? <button type="button" onClick={() => switchMode("login")} className="font-semibold text-blue-600 dark:text-blue-400">Se connecter</button></p>}{mode === "reset" && <button type="button" onClick={() => switchMode("login")} className="font-semibold text-blue-600 dark:text-blue-400">Retour à la connexion</button>}</div></div></div></main>;
}
