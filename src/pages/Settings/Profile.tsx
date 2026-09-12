import { useState } from "react";
import { Mail, Save, UserRound } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";

export function Profile() {
  const { user, updateProfile, updateEmail } = useAuth();
  const [name, setName] = useState(String(user?.user_metadata?.display_name ?? ""));
  const [email, setEmail] = useState(user?.email ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    const profileResult = await updateProfile(name);
    if (profileResult.error) {
      setError(profileResult.error);
      setSaving(false);
      return;
    }

    if (email.trim().toLowerCase() !== user?.email?.toLowerCase()) {
      const emailResult = await updateEmail(email);
      if (emailResult.error) {
        setError(emailResult.error);
        setSaving(false);
        return;
      }
      setMessage(emailResult.message ?? "Demande de changement envoyée.");
    } else {
      setMessage("Profil mis à jour.");
    }
    setSaving(false);
  };

  return <div className="space-y-6"><header><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Compte</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Mon profil</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Gère les informations affichées dans ton espace.</p></header><Card title="Informations personnelles"><div className="space-y-5"><div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-900 p-4"><UserRound className="text-slate-500 dark:text-slate-400" /><div><p className="font-semibold">{user?.email ?? "Adresse indisponible"}</p><p className="text-sm text-slate-500 dark:text-slate-400">Adresse actuelle du compte</p></div></div><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Nom affiché</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={80} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 outline-none focus:border-blue-500" /></label><label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Adresse e-mail</span><div className="relative"><Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-600 py-3 pl-11 pr-4 outline-none focus:border-blue-500" /></div><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Une confirmation sera demandée à la nouvelle adresse.</p></label><Button onClick={() => void save()} disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Enregistrement..." : "Enregistrer"}</Button>{message && <p role="status" className="text-sm text-emerald-600 dark:text-emerald-400">{message}</p>}{error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}</div></Card></div>;
}
