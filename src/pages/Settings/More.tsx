import {
  CalendarDays,
  Bell,
  BrainCircuit,
  Repeat,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "../../components/ui/Card";

export function More() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-medium text-slate-500">
          Application
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900">
          Plus
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Accédez aux autres fonctionnalités.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/notifications" className="block">
          <Card>
            <Bell className="text-slate-600" size={24} />
            <h2 className="mt-4 font-semibold">Notifications</h2>
            <p className="mt-1 text-sm text-slate-500">Retrouve les alertes et événements importants.</p>
          </Card>
        </Link>

        <Link to="/settings/profile" className="block">
          <Card>
            <UserRound className="text-slate-600" size={24} />
            <h2 className="mt-4 font-semibold">Profil utilisateur</h2>
            <p className="mt-1 text-sm text-slate-500">Modifie ton nom et consulte ton compte.</p>
          </Card>
        </Link>

        <Link to="/settings/security" className="block">
          <Card>
            <ShieldCheck className="text-slate-600" size={24} />
            <h2 className="mt-4 font-semibold">Sécurité</h2>
            <p className="mt-1 text-sm text-slate-500">Mot de passe, session et suppression du compte.</p>
          </Card>
        </Link>
        <Link to="/calendar" className="block">
          <Card>
          <CalendarDays className="text-slate-600" size={24} />

          <h2 className="mt-4 font-semibold">
            Calendrier
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Consultez vos dépenses prévues et réelles.
          </p>
          </Card>
        </Link>

        <Link to="/expenses/planned" className="block">
          <Card>
            <CalendarDays className="text-slate-600" size={24} />
            <h2 className="mt-4 font-semibold">Dépenses planifiées</h2>
            <p className="mt-1 text-sm text-slate-500">
              Suivez les dépenses à venir et leur écart réel.
            </p>
          </Card>
        </Link>

        <Link to="/settings/budget" className="block">
          <Card>
          <Settings className="text-slate-600" size={24} />

          <h2 className="mt-4 font-semibold">
            Paramètres
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Configurez votre application.
          </p>
          </Card>
        </Link>

        <Link to="/recurring" className="block">
          <Card>
            <Repeat className="text-slate-600" size={24} />

            <h2 className="mt-4 font-semibold">Récurrences</h2>

            <p className="mt-1 text-sm text-slate-500">
              Gérez les factures et dépenses répétitives.
            </p>
          </Card>
        </Link>

        <Link to="/settings/data" className="block">
          <Card>
          <ShieldCheck className="text-slate-600" size={24} />

          <h2 className="mt-4 font-semibold">
            Confidentialité
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Vos données budgétaires resteront privées.
          </p>
          </Card>
        </Link>

        <Link to="/settings/categories" className="block">
          <Card>
            <Settings className="text-slate-600" size={24} />
            <h2 className="mt-4 font-semibold">Catégories</h2>
            <p className="mt-1 text-sm text-slate-500">
              Organisez vos dépenses et leurs limites.
            </p>
          </Card>
        </Link>

        <Link to="/assistant" className="block">
          <Card>
            <BrainCircuit className="text-slate-600" size={24} />
            <h2 className="mt-4 font-semibold">Assistant</h2>
            <p className="mt-1 text-sm text-slate-500">Comprenez votre trajectoire et recevez des conseils.</p>
          </Card>
        </Link>

        <Link to="/alerts" className="block">
          <Card>
            <Bell className="text-slate-600" size={24} />
            <h2 className="mt-4 font-semibold">Alertes</h2>
            <p className="mt-1 text-sm text-slate-500">Consultez les risques et seuils dépassés.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}