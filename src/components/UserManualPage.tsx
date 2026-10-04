import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  UserPlus,
  Home,
  Calendar,
  Users,
  MessageCircle,
  ArrowLeft,
  BookOpen,
  Lightbulb,
  Settings,
  Baby,
  UserCheck,
  Bell,
  RefreshCw,
  Star,
} from "lucide-react";
import { useTranslation } from "../hooks/useTranslation";

interface StepProps {
  stepNumber: number;
  title: string;
  description: string;
  tip?: string;
}

function Step({ stepNumber, title, description, tip }: StepProps) {
  return (
    <li className="flex gap-4">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
        {stepNumber}
      </div>
      <div className="flex-1 space-y-1 pb-4 border-b border-border/30 last:border-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        {tip && (
          <p className="text-xs text-primary/80 italic mt-1">→ {tip}</p>
        )}
      </div>
    </li>
  );
}

interface SectionData {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  steps: Array<{ title: string; description: string; tip?: string }>;
  conseil: string;
}

interface SectionProps {
  section: SectionData;
  isOpen: boolean;
  onToggle: () => void;
}

function HelpSection({ section, isOpen, onToggle }: SectionProps) {
  return (
    <div className={`border rounded-xl mb-3 overflow-hidden bg-card transition-shadow ${isOpen ? "shadow-md" : "shadow-sm"}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-accent/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${section.color} flex items-center justify-center flex-shrink-0`}>
            {section.icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{section.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-2">
          {isOpen
            ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
          }
        </div>
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-border/50">
          <ol className="mt-4 space-y-1">
            {section.steps.map((step, index) => (
              <Step
                key={index}
                stepNumber={index + 1}
                title={step.title}
                description={step.description}
                tip={step.tip}
              />
            ))}
          </ol>

          <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex gap-3 border border-amber-200/50 dark:border-amber-700/30">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">{section.conseil}</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface UserManualPageProps {
  onBack?: () => void;
}

export function UserManualPage({ onBack }: UserManualPageProps) {
  const { t } = useTranslation();
  const [openSections, setOpenSections] = useState<number[]>([0]);

  const toggleSection = (index: number) => {
    setOpenSections(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const sections: SectionData[] = [
    {
      title: "1. Gérer les orateurs",
      description: "Répertoire des orateurs avec fiche complète",
      icon: <UserPlus className="w-5 h-5 text-blue-600" />,
      color: "bg-blue-100 dark:bg-blue-900/30",
      steps: [
        {
          title: "Accéder au répertoire",
          description: "Cliquez sur l'onglet 'Répertoire' dans le menu de navigation (barre du bas sur mobile, barre latérale gauche sur PC/tablette).",
        },
        {
          title: "Ajouter un orateur",
          description: "Cliquez sur le bouton '+ Ajouter' en haut à droite. Un formulaire rapide s'ouvre pour saisir : nom, téléphone, email, congrégation.",
        },
        {
          title: "Compléter la fiche orateur",
          description: "Cliquez sur un orateur dans la liste pour ouvrir sa fiche complète. Vous pouvez y ajouter : photo, type de foyer (seul ou couple), nom de l'épouse, nombre et noms des enfants (ex: Marc (3 ans), Paul (7 ans)), régime alimentaire/allergies, et des notes.",
          tip: "Le champ 'Noms et âges des enfants' est utilisé dans le briefing WhatsApp final.",
        },
        {
          title: "Orateur local",
          description: "Cochez 'Orateur Local' si l'orateur fait partie de votre congrégation — aucune logistique d'hébergement ou de transport ne sera proposée pour lui.",
        },
        {
          title: "Sauvegarder",
          description: "Cliquez sur 'Enregistrer' (bouton bleu en bas de la fiche). La fiche est sauvegardée localement et synchronisée avec Supabase.",
        },
      ],
      conseil: "Ajoutez une photo pour reconnaître facilement les orateurs. Elle apparaît dans la fiche visite et le planning.",
    },
    {
      title: "2. Gérer les hôtes",
      description: "Liste des familles pour hébergement, repas et transport",
      icon: <Home className="w-5 h-5 text-green-600" />,
      color: "bg-green-100 dark:bg-green-900/30",
      steps: [
        {
          title: "Accéder aux hôtes",
          description: "Cliquez sur l'onglet 'Hôtes' dans le menu de navigation.",
        },
        {
          title: "Ajouter un hôte",
          description: "Cliquez sur '+ Ajouter'. Remplissez : nom, téléphone, email (optionnel), adresse, capacité d'accueil, et rôle principal (Hébergement, Repas ou Transport).",
        },
        {
          title: "Modifier un hôte",
          description: "Cliquez sur un hôte dans la liste pour ouvrir sa fiche et modifier ses informations. Vous pouvez aussi ajouter une photo.",
        },
        {
          title: "Supprimer un hôte",
          description: "Dans la liste, survolez un hôte et cliquez sur l'icône corbeille qui apparaît, puis confirmez la suppression.",
        },
      ],
      conseil: "Renseignez l'adresse complète de l'hôte — elle sera automatiquement incluse dans le lien Google Maps du briefing WhatsApp.",
    },
    {
      title: "3. Planifier les visites",
      description: "Créer et gérer les visites du weekend",
      icon: <Calendar className="w-5 h-5 text-purple-600" />,
      color: "bg-purple-100 dark:bg-purple-900/30",
      steps: [
        {
          title: "Accéder au Planning",
          description: "Cliquez sur l'onglet 'Planning'. Vous voyez la liste de toutes les visites (à venir, passées) avec leur statut.",
        },
        {
          title: "Créer une nouvelle visite",
          description: "Cliquez sur le bouton '+ Programmer une visite'. Saisissez le nom de l'orateur, sa congrégation, et la date de la réunion.",
        },
        {
          title: "Compléter les infos de visite",
          description: "Dans la fiche visite (onglet 'Infos') : ajoutez le thème du discours, le numéro, le type de transport (voiture/train/avion), les dates d'arrivée/départ, les allergies alimentaires, et le nombre/noms d'enfants qui voyagent.",
        },
        {
          title: "Gérer le statut",
          description: "Changez le statut de la visite : Planifié → Confirmé → Terminé (ou Annulé). Le statut est visible dans la liste du planning.",
        },
        {
          title: "Calendrier latéral",
          description: "Sur PC et grande tablette, la barre droite affiche un mini-calendrier avec vos visites, le programme du jour, et les rappels à venir (30 jours).",
        },
      ],
      conseil: "Les visites d'orateurs locaux sont automatiquement marquées comme 'Local' et n'affichent pas les sections logistiques.",
    },
    {
      title: "4. Assigner hôtes & logistique",
      description: "Gérer hébergement, repas et transport pour chaque visite",
      icon: <Users className="w-5 h-5 text-orange-600" />,
      color: "bg-orange-100 dark:bg-orange-900/30",
      steps: [
        {
          title: "Ouvrir l'onglet Hôtes d'une visite",
          description: "Depuis le Planning, cliquez sur une visite puis allez dans l'onglet 'Accueil & Logistique'.",
        },
        {
          title: "Assigner un hôte",
          description: "Cliquez sur 'Assigner un hôte'. Choisissez le rôle (Hébergement, Repas, Transport), sélectionnez l'hôte dans la liste, puis précisez le jour et l'heure si besoin.",
        },
        {
          title: "Repas de groupe",
          description: "Pour un repas à la Salle du Royaume ou au restaurant, cliquez sur le bouton correspondant — il s'ajoute directement à la logistique.",
        },
        {
          title: "Modifier ou supprimer une assignation",
          description: "Cliquez sur une assignation existante pour la modifier (changer le jour, l'heure, l'adresse, le téléphone) ou la supprimer.",
        },
        {
          title: "Consulter le résumé",
          description: "Le résumé logistique (hôtes assignés, rôles, contacts) est visible dans l'onglet 'Hôtes' et utilisé automatiquement dans le briefing WhatsApp.",
        },
      ],
      conseil: "Vous pouvez assigner plusieurs hôtes par rôle (ex: 2 hébergements différents pour 2 nuits).",
    },
    {
      title: "5. Accompagnants",
      description: "Gérer les personnes supplémentaires qui voyagent avec l'orateur",
      icon: <Baby className="w-5 h-5 text-pink-600" />,
      color: "bg-pink-100 dark:bg-pink-900/30",
      steps: [
        {
          title: "Accéder à l'onglet Accompagnants",
          description: "Dans la fiche d'une visite, cliquez sur l'onglet 'Accompagnants'.",
        },
        {
          title: "Ajouter un accompagnant",
          description: "Cliquez sur '+ Ajouter'. Saisissez le nom, le groupe d'âge (adulte ou enfant), et si la personne a besoin d'hébergement.",
        },
        {
          title: "Préciser les besoins",
          description: "Pour chaque accompagnant, vous pouvez indiquer : allergies/régime alimentaire, type de transport, et s'il voyage avec sa propre famille.",
        },
        {
          title: "Mode 'Avec l'orateur'",
          description: "Sélectionnez 'Avec l'orateur' pour les accompagnants qui voyagent ensemble — ils seront groupés dans le briefing WhatsApp.",
        },
        {
          title: "Impact sur les messages",
          description: "Le nombre d'accompagnants est calculé automatiquement dans '{nb_total_personnes}' et leurs détails apparaissent dans '{accompagnants_details}' du briefing.",
        },
      ],
      conseil: "Le nombre total de repas et de places d'hébergement est automatiquement mis à jour selon les accompagnants ajoutés.",
    },
    {
      title: "6. Messages WhatsApp",
      description: "Générer et envoyer des messages depuis l'application",
      icon: <MessageCircle className="w-5 h-5 text-emerald-600" />,
      color: "bg-emerald-100 dark:bg-emerald-900/30",
      steps: [
        {
          title: "Accéder aux messages d'une visite",
          description: "Dans la fiche d'une visite, cliquez sur l'onglet 'Messages'. Vous voyez les modèles organisés par étape de workflow.",
        },
        {
          title: "Étapes de workflow disponibles",
          description: "Les modèles sont organisés par étape : Planification → Lancement & Recherche → Confirmation des Hôtes → Coordination & Rappel → Briefing Final → Après-Visite. Choisissez l'étape appropriée.",
        },
        {
          title: "Choisir un destinataire",
          description: "Sélectionnez la catégorie : 🎤 Orateur, ⚙️ Hôte – Logistique, ou 👥 Groupe. Les modèles disponibles s'adaptent automatiquement.",
        },
        {
          title: "Choisir la langue",
          description: "Sélectionnez la langue du message (Français, Créole cap-verdien, Portugais). Le message est traduit automatiquement.",
        },
        {
          title: "Personnaliser et copier",
          description: "Le message est pré-rempli avec toutes les infos de la visite. Modifiez si besoin puis cliquez sur 'Copier' pour copier dans le presse-papier.",
        },
        {
          title: "Envoyer via WhatsApp",
          description: "Cliquez sur 'Envoyer via WhatsApp' — l'application s'ouvre avec le message pré-rempli. Choisissez le contact et envoyez.",
        },
        {
          title: "Historique des envois",
          description: "Les messages envoyés sont enregistrés dans la chronologie de la visite avec la date et l'heure d'envoi.",
        },
      ],
      conseil: "Le 'Briefing Final' est le message le plus complet — il contient tous les détails : orateur, épouse, enfants, accompagnants, hébergement, repas, transport, allergies.",
    },
    {
      title: "7. Variables de templates",
      description: "Personnaliser les modèles de messages avec des variables dynamiques",
      icon: <Star className="w-5 h-5 text-yellow-600" />,
      color: "bg-yellow-100 dark:bg-yellow-900/30",
      steps: [
        {
          title: "Variables orateur",
          description: "{prenom_orateur} · {nom_orateur} · {salutation_orateur} · {orateur_et_epouse} · {congregation_orateur} · {tel_orateur}",
        },
        {
          title: "Variables visite",
          description: "{date_visite} · {heure_visite} · {theme_discours} · {numero_discours} · {date_arrivee} · {heure_arrivee} · {date_depart} · {heure_depart}",
        },
        {
          title: "Variables logistique",
          description: "{hebergement_details} · {repas_details} · {transport_details} · {nom_hebergeur} · {adresse_hebergeur} · {tel_hebergeur} · {kingdom_hall_address}",
        },
        {
          title: "Variables enfants & accompagnants",
          description: "{nb_enfants} · {ages_enfants} · {enfants_details} · {nb_accompagnants} · {noms_accompagnants} · {accompagnants_details} · {nb_total_personnes}",
        },
        {
          title: "Blocs conditionnels",
          description: "{composition_visite_block} · {details_allergies_block} · {question_enfants_block} · {speaker_hebergement_block} · {speaker_repas_block} · {speaker_transport_block} · {besoins_volontaires_block}",
        },
        {
          title: "Variables administrateur",
          description: "{ton_nom} · {mon_tel} · {salutation_hebergeur} · {salutation_orateur}",
        },
      ],
      conseil: "Les blocs conditionnels (ex: {question_enfants_block}) s'affichent uniquement si la condition est remplie — pratique pour des messages adaptés au contexte.",
    },
    {
      title: "8. Paramètres",
      description: "Configuration de l'application",
      icon: <Settings className="w-5 h-5 text-gray-600" />,
      color: "bg-gray-100 dark:bg-gray-800/50",
      steps: [
        {
          title: "Profil de la congrégation",
          description: "Dans Paramètres > Général : renseignez le nom de la congrégation, la ville, le jour et heure de réunion, l'adresse de la Salle du Royaume, et le groupe WhatsApp.",
        },
        {
          title: "Responsable accueil",
          description: "Ajoutez votre nom et téléphone en tant que responsable accueil — ils sont utilisés dans les variables {ton_nom} et {mon_tel} des messages.",
        },
        {
          title: "Synchronisation Supabase",
          description: "Dans Paramètres > Synchronisation : configurez votre URL Supabase et votre clé anonyme pour synchroniser les données entre tous vos appareils.",
        },
        {
          title: "Apparence",
          description: "Choisissez entre mode clair, mode sombre, ou automatique (selon le système). Changez aussi la langue de l'interface (Français, Créole, Portugais).",
        },
        {
          title: "Sauvegarde et restauration",
          description: "Dans Paramètres > Données : exportez toutes vos données en JSON (backup), ou importez un backup précédent.",
        },
        {
          title: "Réinitialiser les données",
          description: "Effacez toutes les données locales si nécessaire (visites, orateurs, hôtes). Attention : action irréversible.",
        },
      ],
      conseil: "Configurez d'abord la congrégation avant d'ajouter des orateurs et des visites — le nom de congrégation est utilisé pour détecter automatiquement les orateurs locaux.",
    },
    {
      title: "9. Notifications & Rappels",
      description: "Rester informé des visites à venir",
      icon: <Bell className="w-5 h-5 text-red-600" />,
      color: "bg-red-100 dark:bg-red-900/30",
      steps: [
        {
          title: "Alertes prioritaires",
          description: "La sidebar droite (PC/tablette) affiche en rouge les visites dans les 60 prochains jours sans hébergement assigné — agissez rapidement !",
        },
        {
          title: "Rappels J-7 et J-2",
          description: "Activez les rappels dans Paramètres > Notifications. L'application vous alertera 7 jours et 2 jours avant chaque visite pour envoyer les messages de rappel.",
        },
        {
          title: "Programme du jour",
          description: "La sidebar droite affiche les visites du jour avec un accès rapide aux messages WhatsApp via le bouton d'envoi rapide.",
        },
        {
          title: "Rappels à venir (30 jours)",
          description: "La liste des prochaines visites sur 30 jours est visible dans la sidebar. Cliquez sur une visite pour l'ouvrir directement.",
        },
      ],
      conseil: "Utilisez la cloche en haut de la sidebar pour accéder rapidement aux notifications en attente.",
    },
    {
      title: "10. Synchronisation Cloud",
      description: "Partager les données entre appareils via Supabase",
      icon: <RefreshCw className="w-5 h-5 text-cyan-600" />,
      color: "bg-cyan-100 dark:bg-cyan-900/30",
      steps: [
        {
          title: "Qu'est-ce que Supabase ?",
          description: "Supabase est une base de données cloud gratuite qui permet de synchroniser vos visites, orateurs et hôtes entre tous vos appareils (PC, tablette, mobile).",
        },
        {
          title: "Configurer Supabase",
          description: "Allez dans Paramètres > Synchronisation. Renseignez l'URL de votre projet Supabase et la clé anonyme. Voir le guide de configuration dans la même section.",
        },
        {
          title: "Synchronisation automatique",
          description: "La synchronisation se fait automatiquement à l'ouverture de l'app et toutes les quelques minutes. L'heure de dernière sync est affichée dans la sidebar.",
        },
        {
          title: "Sync manuelle",
          description: "Cliquez sur l'icône de sync (⟳) dans la sidebar droite pour forcer une synchronisation immédiate.",
        },
        {
          title: "Données locales vs cloud",
          description: "Certaines données restent locales uniquement : photo de profil administrateur, préférences d'affichage. Les visites, orateurs et hôtes sont synchronisés.",
        },
      ],
      conseil: "En cas de conflit de données, la version la plus récente (basée sur la date de modification) est prioritaire.",
    },
    {
      title: "11. Orateur local vs externe",
      description: "Comprendre la distinction locale/externe",
      icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
      color: "bg-indigo-100 dark:bg-indigo-900/30",
      steps: [
        {
          title: "Orateur externe",
          description: "Par défaut, tous les orateurs ajoutés sont considérés comme 'externes'. La logistique complète est affichée : hébergement, repas, transport, dates d'arrivée/départ.",
        },
        {
          title: "Orateur local",
          description: "Cochez 'Orateur local' dans la fiche orateur, ou si sa congrégation correspond au nom configuré dans les Paramètres. Les sections logistiques sont masquées.",
        },
        {
          title: "Badge local",
          description: "Un badge vert 'Local' apparaît sur la fiche de la visite et dans le planning pour identifier rapidement les orateurs de votre congrégation.",
        },
        {
          title: "Messages adaptés",
          description: "Un modèle 'Orateur local (simple)' est disponible dans les templates — il ne contient pas les sections hébergement/transport.",
        },
        {
          title: "Alerte visite récente",
          description: "Un bandeau orange apparaît si l'orateur est venu dans les 6 derniers mois — pour éviter d'inviter trop souvent le même orateur.",
        },
      ],
      conseil: "Configurez bien le nom de votre congrégation dans les Paramètres — c'est ce qui permet la détection automatique des orateurs locaux.",
    },
  ];

  return (
    <div className="py-2 sm:py-4 bg-background pb-20">
      {/* Header */}
      <div className="bg-primary/10 dark:bg-primary/20 p-4 border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("back_to_settings")}
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t("user_manual")}</h1>
              <p className="text-xs text-muted-foreground">KBV Lyon — {sections.length} sections · Application complète</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-6">
        {/* Intro */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-700/30">
          <h2 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1 text-sm">
            Guide d'utilisation — KBV Coordination
          </h2>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
            Ce guide couvre toutes les fonctionnalités de l'application : gestion des orateurs et hôtes, 
            planification des visites, logistique d'accueil, messages WhatsApp multi-langues, 
            accompagnants, synchronisation cloud et notifications.
          </p>
        </div>

        {/* Navigation rapide */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Aller directement à :</p>
          <div className="flex flex-wrap gap-2">
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => {
                  setOpenSections([index]);
                  setTimeout(() => {
                    document.getElementById(`section-${index}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 100);
                }}
                className="px-3 py-1.5 text-xs bg-card hover:bg-accent border border-border text-foreground rounded-full transition-colors"
              >
                {section.title.split(". ")[1] || section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div>
          {sections.map((section, index) => (
            <div id={`section-${index}`} key={index}>
              <HelpSection
                section={section}
                isOpen={openSections.includes(index)}
                onToggle={() => toggleSection(index)}
              />
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="p-4 bg-card rounded-xl border border-border">
          <h3 className="font-semibold text-sm mb-1">{t("need_help")}</h3>
          <p className="text-xs text-muted-foreground mb-2">
            {t("contact_support_emergency") || "Pour toute question urgente concernant l'application, contactez :"}
          </p>
          <a
            href="mailto:pinto12397@gmail.com"
            className="text-sm text-primary hover:underline font-medium"
          >
            pinto12397@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
