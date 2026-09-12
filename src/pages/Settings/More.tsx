import {
  Archive,
  BarChart3,
  Bell,
  BrainCircuit,
  Calculator,
  CalendarDays,
  Repeat,
  Settings,
  ShieldCheck,
  ShoppingCart,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Card } from "../../components/ui/Card";

interface MoreLink {
  to: string;
  icon: typeof Settings;
  title: string;
  description: string;
}

interface MoreSection {
  title: string;
  links: MoreLink[];
}

const sections: MoreSection[] = [
  {
    title: "Suivi",
    links: [
      {
        to: "/statistics",
        icon: BarChart3,
        title: "Statistiques",
        description: "Analysez vos habitudes de dépenses.",
      },
      {
        to: "/history",
        icon: Archive,
        title: "Historique",
        description: "Comparez vos mois budgétaires passés.",
      },
      {
        to: "/calendar",
        icon: CalendarDays,
        title: "Calendrier",
        description: "Consultez vos dépenses prévues et réelles.",
      },
      {
        to: "/expenses/planned",
        icon: CalendarDays,
        title: "Dépenses planifiées",
        description: "Suivez les dépenses à venir et leur écart réel.",
      },
    ],
  },
  {
    title: "Planification",
    links: [
      {
        to: "/future-purchases",
        icon: ShoppingCart,
        title: "Achats futurs",
        description: "Planifiez vos prochains achats importants.",
      },
      {
        to: "/recurring",
        icon: Repeat,
        title: "Récurrences",
        description: "Gérez les factures et dépenses répétitives.",
      },
      {
        to: "/simulator",
        icon: Calculator,
        title: "Simulateur",
        description: "Teste si une dépense est raisonnable avant de l'engager.",
      },
    ],
  },
  {
    title: "Assistant",
    links: [
      {
        to: "/assistant",
        icon: BrainCircuit,
        title: "Assistant",
        description: "Comprenez votre trajectoire et recevez des conseils.",
      },
      {
        to: "/alerts",
        icon: Bell,
        title: "Alertes",
        description: "Consultez les risques et seuils dépassés.",
      },
      {
        to: "/notifications",
        icon: Bell,
        title: "Notifications",
        description: "Retrouve les alertes et événements importants.",
      },
    ],
  },
  {
    title: "Compte",
    links: [
      {
        to: "/settings/budget",
        icon: Settings,
        title: "Paramètres",
        description: "Configurez votre application.",
      },
      {
        to: "/settings/categories",
        icon: Settings,
        title: "Catégories",
        description: "Organisez vos dépenses et leurs limites.",
      },
      {
        to: "/settings/profile",
        icon: UserRound,
        title: "Profil utilisateur",
        description: "Modifie ton nom et consulte ton compte.",
      },
      {
        to: "/settings/security",
        icon: ShieldCheck,
        title: "Sécurité",
        description: "Mot de passe, session et suppression du compte.",
      },
      {
        to: "/settings/data",
        icon: ShieldCheck,
        title: "Confidentialité",
        description: "Vos données budgétaires resteront privées.",
      },
    ],
  },
];

export function More() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Application
        </p>

        <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Plus
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Accédez aux autres fonctionnalités.
        </p>
      </header>

      {sections.map((section) => (
        <div key={section.title}>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {section.title}
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {section.links.map((link) => {
              const Icon = link.icon;

              return (
                <Link key={link.to} to={link.to} className="block">
                  <Card>
                    <Icon className="text-slate-600 dark:text-slate-300" size={24} />
                    <h3 className="mt-4 font-semibold">{link.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {link.description}
                    </p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
