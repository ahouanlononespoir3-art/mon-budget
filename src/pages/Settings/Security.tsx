import { useState } from "react";
import { KeyRound, LogOut, ShieldCheck, Trash2 } from "lucide-react";

import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import { clearAllStorage } from "../../services/storage";

export function Security() {
  const { user, signOut, resetPassword, deleteAccount } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const sendReset = async () => {
    if (!user?.email) return;
    setBusy(true);
    const result = await resetPassword(user.email);
    if (result.error) setError(result.error);
    else setMessage("Le lien de changement de mot de passe a été envoyé.");
    setBusy(false);
  };

  const logout = async () => {
    setBusy(true);
    await signOut();
    setBusy(false);
  };

  const remove = async () => {
    if (!window.confirm("Supprimer définitivement ton compte et les données locales ? Cette action est irréversible.")) return;
    setBusy(true);
    const result = await deleteAccount();
    if (result.error) {
      setError(result.error);
      setBusy(false);
      return;
    }
    clearAllStorage();
    await signOut();
  };

  return <div className="space-y-6"><header><p className="text-sm font-medium text-slate-500">Protection</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Sécurité et compte</h1><p className="mt-1 text-sm text-slate-500">Contrôle les accès et les actions sensibles.</p></header><Card title="Session"><div className="flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800"><ShieldCheck className="shrink-0" /><p className="text-sm">Ton compte est protégé par Supabase Auth. Les données synchronisées restent liées à ton utilisateur.</p></div><Button variant="secondary" className="mt-4" onClick={() => void logout()} disabled={busy}><LogOut className="mr-2 h-4 w-4" />Se déconnecter</Button></Card><Card title="Mot de passe"><p className="text-sm text-slate-500">Recevoir un lien sécurisé pour modifier ton mot de passe.</p><Button variant="secondary" className="mt-4" onClick={() => void sendReset()} disabled={busy}><KeyRound className="mr-2 h-4 w-4" />Envoyer le lien</Button></Card><Card title="Zone dangereuse" description="Ces actions demandent une confirmation et peuvent être irréversibles."><Button variant="danger" onClick={() => void remove()} disabled={busy}><Trash2 className="mr-2 h-4 w-4" />Supprimer mon compte</Button></Card>{message && <p role="status" className="text-sm text-emerald-600">{message}</p>}{error && <p role="alert" className="text-sm text-red-600">{error}</p>}</div>;
}
