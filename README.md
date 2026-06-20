# 🎤 KBV-LYON-VISITS - Système de Coordination Logistique

KBV-LYON-VISITS est une plateforme de gestion complète conçue pour simplifier la coordination des visites d'orateurs et la logistique d'accueil (hospitalité) au sein des congrégations.

![Version](https://img.shields.io/badge/version-2.2.0-blue)
![Tech](https://img.shields.io/badge/tech-React--Vite--Tailwind-orange)
![Platform](https://img.shields.io/badge/platform-PWA--Android--Windows-green)

---

## 🌟 Fonctionnalités Clés

### 📅 Gestion du Planning

- **Calendrier Interactif** : Visualisation claire des visites programmées.
- **Détection de Conflits** : Alertes automatiques si un hôte est surchargé ou si une visite est en doublon.
- **Importation Google Sheets** : Synchronisation unidirectionnelle depuis une feuille de calcul pour faciliter la transition.

### 👤 Répertoires Intelligents

- **Orateurs** : Suivi des thèmes de discours, historique des visites, et besoins spécifiques (régime, famille).
- **Hôtes** : Gestion des capacités d'accueil, rôles (hébergement, repas, transport) et préférences.

### 💬 Communication Automatisée

- **Templates WhatsApp** : Génération de messages personnalisés en un clic pour confirmer les visites, briefer les hôtes ou remercier les intervenants.
- **Support Multilingue** : Interface et messages disponibles en **Français**, **Kriol (Cap-verdien)** et **Portugais**.

### ☁️ Synchronisation & Portabilité

- **Mode Hors-ligne (PWA)** : L'application fonctionne sans internet grâce aux données locales.
- **Sync Supabase** : Synchronisation cloud optionnelle pour partager les données entre plusieurs coordinateurs.
- **Backup JSON** : Exportation et importation facile de la base de données complète.

---

## 🛠️ Pile Technique

- **Core** : [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Style** : [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
- **Animations** : [Framer Motion](https://www.framer.com/motion/)
- **Gestion d'état** : [Zustand](https://github.com/pmndrs/zustand)
- **Base de données** : [Supabase](https://supabase.com/) (Cloud) & LocalStorage (Local)
- **Plateformes** :
  - **Mobile** : [Capacitor](https://capacitorjs.com/) (Android/iOS)
  - **Desktop** : [Electron](https://www.electronjs.org/) (Windows/macOS/Linux)

---

## 🚀 Installation et Développement

### Pré-requis

- Node.js (v18+)
- npm ou bun

### Installation

```bash
# 1. Cloner le projet
git clone https://github.com/votre-repo/kbv-manager.git

# 2. Installer les dépendances
bun install

# 3. Installer les navigateurs pour les tests (Playwright)
bunx playwright install --with-deps chromium

# 4. Lancer le serveur de développement
bun run dev
```

### Build pour différentes plateformes

- **Web / PWA** : `npm run build`
- **Windows (Portable)** : `npm run build:win`
- **Android (APK)** : `npm run build:android`

---

## ⚙️ Configuration

### Variables d'Environnement (`.env`)

Créez un fichier `.env.local` à la racine pour activer la synchronisation cloud :

```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anonyme
```

### Signature Android

Le build Android cherche un fichier `release.keystore` à la racine du projet.

- Pour le développement local, il bascule sur la clé `debug` si le fichier est absent.
- En production, utilisez les variables d'environnement `KEYSTORE_PASSWORD`, `KEY_ALIAS` et `KEY_PASSWORD`.

---

## 🚀 Optimisation du Bundle

L'application utilise un découpage de code (code-splitting) agressif pour garantir des performances optimales sur mobile :

- **Chunks Manuels** : Les librairies lourdes (Supabase, Framer, Radix) sont isolées.
- **Lazy Loading** : Les vues principales (Dashboard, Planning, etc.) sont chargées uniquement quand nécessaire.
- **PWA** : Mise en cache hors-ligne via Workbox.

---

## 📁 Structure du Projet

```text
src/
├── components/       # Composants UI (Planning, Dashboard, Modals)
├── hooks/            # Hooks personnalisés (Translation, PWA, Reminders)
├── lib/              # Utilitaires (Supabase, Sheet Sync, Déduplication)
├── store/            # Gestion d'état Zustand (Visits, Speakers, Hosts)
  ├── test/             # Fichiers de configuration et utilitaires de test
└── types/            # Définitions TypeScript
```

---

## 🔒 Sécurité et RGPD

L'application respecte la vie privée :

- Les données sont stockées **localement** par défaut.
- Aucune donnée n'est partagée avec des tiers, sauf via votre propre instance Supabase si configurée.
- Possibilité de réinitialiser/supprimer toutes les données instantanément depuis les paramètres.

---

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---

*Développé avec ❤️ pour faciliter le service de nos frères.*
