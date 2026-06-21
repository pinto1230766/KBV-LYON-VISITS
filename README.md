# 🎤 KBV-LYON-VISITS - Système de Coordination Logistique

KBV-LYON-VISITS est une plateforme de gestion complète conçue pour simplifier la coordination des visites d'orateurs et la logistique d'accueil (hospitalité) au sein des congrégations.

![Version](https://img.shields.io/badge/version-2.2.2-blue)
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

# 🔄 Breaking Changes (v2.1.0 → v2.2.0)

## 📋 Vue d'Ensemble

Ce document décrit les changements majeurs introduits lors de la mise à jour des dépendances et de l'amélioration de la qualité du code.

---

## 🚦 Changements Majeurs

### **1. TypeScript Configuration**

- ✅ **Activé**: `noImplicitAny: true`
- ✅ **Activé**: `noUnusedLocals: true`
- ✅ **Activé**: `noUnusedParameters: true`

**Impact**: Code plus strict, détection précoce des erreurs de typage

### **2. ESLint Rules**

- ✅ **Activé**: `@typescript-eslint/no-unused-vars` avec support du préfixe `_`
- **Impact**: Variables non utilisées doivent être préfixées avec `_` ou supprimées

---

## 📦 Mises à Jour des Dépendances

### **Capacitor (v6.2.1 → v8.3.3)**

**Breaking Changes potentiels**:
- ⚠️ **API Changes**: Certaines APIs natives peuvent avoir changé
- ⚠️ **Build Process**: Processus de build Android/iOS modifié
- ⚠️ **Plugins**: Plugins tiers nécessitant mise à jour

**Actions requises**:

```bash
npx cap sync android
npx cap sync ios
```

### **React Router (v6.30.1 → v7.15.0)**

**Breaking Changes**:
- ⚠️ **Data API**: Changements dans les APIs de données de route
- ⚠️ **Navigation**: Comportements de navigation modifiés
- ⚠️ **TypeScript**: Types améliorés, peuvent nécessiter des ajustements

### **Zod (v3.25.76 → v4.4.3)**

**Breaking Changes**:
- ⚠️ **Schema APIs**: Changements dans les APIs de schéma
- ⚠️ **Validation**: Comportements de validation modifiés
- ⚠️ **Types**: Types TypeScript plus stricts

---

## 🧪 Tests

### **Testing Library**

- ✅ **Ajouté**: `@testing-library/dom` (manquant)
- ✅ **Validé**: Tous les tests passent (86/86)

**Impact**: Tests React plus robustes et compatibles

---

## 🔧 Actions Requises pour les Développeurs

### **1. Mise à Jour du Code**

```typescript
// ❌ Ancienne syntaxe
const unusedVar = someValue;

// ✅ Nouvelle syntaxe  
const _unusedVar = someValue;
```

### **2. Typage Strict**

```typescript
// ❌ Plus accepté
function processData(data: any) {
  return data.map(item => item.name);
}

// ✅ Typage explicite requis
function processData(data: { name: string }[]) {
  return data.map(item => item.name);
}
```

### **3. Capacitor Projects**

```bash
# Synchroniser les projets natifs
npx cap sync android
npx cap sync ios

# Ouvrir les projets natifs si nécessaire
npx cap open android
npx cap open ios
```

---

## 🚨 Points d'Attention

### **Variables Non Utilisées**

- Toutes les variables non utilisées doivent être préfixées avec `_`
- ESLint générera des erreurs si cette règle n'est pas respectée

### **Typage Strict**

- Plus de `any` implicite autorisé
- Types explicites requis pour tous les paramètres et retours

### **Build Process**

- Utiliser `--legacy-peer-deps` pour les commandes npm si nécessaire
- Vérifier la compatibilité des plugins Capacitor

---

## ✅ Bénéfices

### **Qualité du Code**

- 🔍 **Détection précoce**: Erreurs détectées à la compilation
- 🧹 **Code propre**: Suppression automatique du code mort
- 📚 **Documentation**: Types auto-documentés

### **Sécurité**

- 🛡️ **Vulnérabilités**: Réduites de 8 → 6 (high severity)
- 📦 **Dépendances**: Packages à jour avec derniers patches

### **Performance**

- ⚡ **Optimisation**: Packages plus performants
- 🚀 **Bundle size**: Potentiellement réduit avec élimination du code mort

---

## 🔄 Migration Checklist

- [ ] **Revue du code**: Variables non utilisées préfixées avec `_`
- [ ] **Types explicites**: Plus de `any` implicite
- [ ] **Tests**: Tous les tests passent
- [ ] **Capacitor**: Sync des projets natifs
- [ ] **Documentation**: Mettre à jour la documentation interne

---

# 🚦 Points de Vigilance — KBV2

## 1. Complexité de Maintenance Multi-Plateforme

### Constat

Le projet cible **3 plateformes** simultanément :

- **Web (PWA)** : build Vite standard + service worker
- **Mobile (Android/iOS)** : via Capacitor (`@capacitor/android`, `@capacitor/ios`)
- **Desktop** : via Electron (`electron-builder`)

### Risques identifiés

| Plateforme         | Stockage                                       | Spécificités                     |
|--------------------|------------------------------------------------|----------------------------------|
| Web/PWA            | `localStorage` (Zustand persist) + IndexedDB   | Service worker offline, share_target |
| Android            | `@capacitor/android` — stockage natif          | Notifications push, Haptics      |
| iOS                | `@capacitor/ios` — stockage natif              | Safe areas, standalone mode      |
| Desktop (Electron) | `electron/main.cjs` — fichier système          | Fenêtre native, menu système     |

### Code problématique

Dans `src/lib/syncCloud.ts`, la fonction `_safeStorageSet` utilise `localStorage` qui est **uniquement disponible en Web**. Sous Capacitor ou Electron, `localStorage` existe mais peut avoir des quotas très bas (5-10 Mo).

```typescript
function _safeStorageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (_err) {
    // Quota exceeded — remove existing keys to free space, then retry
  }
}
```

### Recommandations

1. **Abstraction du stockage** : Créer une interface `StorageAdapter` unique qui utilise le bon backend selon la plateforme.
2. **Séparer les logiques spécifiques à chaque plateforme** dans des dossiers dédiés (`src/platform/`).
3. **Tests cross-plateforme** : Ajouter des tests unitaires qui mockent chaque environnement.

---

## 2. Dépendances et Gestionnaire de Paquets (Bun)

### Constat

Le projet utilise **Bun** comme gestionnaire de paquets, avec un fichier `bun.lock` présent. Cependant, `package-lock.json` est également présent, signe d'une migration incomplète.

### Recommandations pour Bun

**a) Supprimer le fichier `package-lock.json`** (obsolète si Bun est le gestionnaire officiel).

**b) Mettre à jour la CI/CD** pour installer Bun.

**c) Ajouter un fichier de configuration** à la racine pour forcer l'utilisation de Bun.

---

## 3. Synchronisation Supabase ↔ Local (Critique)

### Constat sur la synchronisation

La logique de synchronisation est dans `src/lib/syncCloud.ts`. Les données sont stockées localement via Zustand + `localStorage` (persist), et synchronisées avec Supabase.

### Analyse de la synchronisation

- **Comparaison par `updatedAt`** : La fonction `mergeItem` dans `src/lib/dedup.ts` utilise le timestamp pour déterminer le gagnant d'un conflit.
- **Filtrage des données d'exemple** : Les entrées "Jean Dupont / Marie Martin" sont nettoyées côté distant.
- **UUID déterministe** : `toUUID()` convertit les IDs locaux en UUID v4 valides pour Supabase.
- **Gestion des erreurs** : La plupart des appels Supabase ont un `try/catch` et un log.

---

# 🎤 Audit de Projet — KBV-LYON-VISITS

**Version :** 2.2.0  
**Type d'application :** PWA multi-plateforme (Web, Android, iOS, Electron)  
**Objectif :** Système de coordination des visites de conférenciers et gestion des hôtes  

---

## 1. Vue d'ensemble du projet

### Stack technique

- **Frontend :** React 19 + TypeScript 5.8 + Vite 8
- **Styling :** Tailwind CSS 3.4 + shadcn/ui (Radix UI)
- **State Management :** Zustand 5 (avec persist middleware)
- **Base de données :** IndexedDB (local) + Supabase (cloud)
- **PWA :** vite-plugin-pwa (Service Worker Workbox)
- **Mobile :** Capacitor 8 (Android + iOS)
- **Desktop :** Electron 42
- **Tests :** Vitest 4 (unitaire) + Playwright (E2E)
- **i18n :** Système maison (français, portugais, créole cap-verdien)

### Points forts

- Architecture modulaire bien découpée (store, lib, hooks, components)
- Support multi-plateforme complet (PWA, Android, iOS, Desktop)
- Synchronisation offline-first avec Supabase
- Gestion de conflits intelligente (merge par timestamp + merge d'objets imbriqués)
- Système de notifications et rappels intégré (J-7, J-2, remerciement)
- Détection et nettoyage automatique des doublons
- Import Google Sheets pour le planning
- Support 3 langues (FR, PT, CV)

### Points faibles

- Couverture de tests insuffisante
- Pas de CI/CD visible
- Absence de documentation API
- Quelques problèmes de typage
- Gestion des erreurs inégale

---

## 2. Architecture technique

### Structure du projet

```
KBV-LYON-VISITS-1/
├── src/
│   ├── components/          # Composants React (UI + layout + planning)
│   │   ├── layout/          # AppLayout, Header, MobileNav
│   │   ├── planning/        # VisitCard, InfosTab, PlanningHub
│   │   ├── settings/        # GeneralSection, etc.
│   │   └── ui/              # shadcn/ui components
│   ├── hooks/               # usePWA, useAutoSync, useTranslation, useReminderEngine
│   │   └── translations/    # Fichiers de traduction (common, domain, help)
│   ├── lib/                 # Logique métier (dedup, sync, backup, validation, etc.)
│   ├── store/               # Zustand stores (entities, settings, UI, outbox)
│   └── test/                # Tests unitaires et d'intégration
├── electron/                # Main process Electron
├── e2e/                     # Tests Playwright
├── android/                 # Projet Android natif (Capacitor)
├── ios/                     # Projet iOS natif (Capacitor)
├── public/                  # Assets statiques
├── scripts/                 # Scripts SQL et utilitaires
└── plans/                   # Documentation de planification
```

---

## 3. Qualité du code

### Points positifs

- **Typage TypeScript strict** (`strict: true`, `noImplicitAny: true`, `noUnusedLocals: true`)
- **Séparation des préoccupations** bien respectée : logique métier dans `lib/`, état dans `store/`, UI dans `components/`
- **Lazy loading** des routes principales avec `Suspense` + skeleton loading
- **Gestion des erreurs** avec ErrorBoundary
- **Validation des formulaires** avec Zod + react-hook-form

### Problèmes détectés

1. **Utilisation excessive de `any`** : `syncCloud.ts` avec certains `as any` sur les upsert Supabase.
2. **Fonctions de conversion redondantes** : `visitToRow` / `rowToVisit`, etc.
3. **Import avec chemin relatif vs alias `@/`** : Mélange de `../../store/` et `@/store/` dans les imports.
4. **Code commenté / mort** : Variables non utilisées préfixées avec `_`.
5. **Pas de gestion de version d'API** : Les appels Supabase sont directs sans couche d'abstraction API.

---

## 4. Gestion d'état (State Management)

### Stores

| Store | Type de persistance | Taille estimée | Notes |
|-------|---------------------|----------------|-------|
| `useUIStore` | Aucune (mémoire) | ~0.1 KB | État volatile |
| `useVisitStore` | `localStorage` (kbv-visits) | Variable | Visites avec merge automatique |
| `useSpeakerStore` | `IndexedDB` (kbv-speakers) | Potentiellement large | Photos Base64 → IndexedDB nécessaire |
| `useHostStore` | `IndexedDB` (kbv-hosts) | Potentiellement large | Photos Base64 |
| `useSettingsStore` | `localStorage` | ~2-5 KB | Profil congrégation + préférences |
| `useNotificationStore` | `localStorage` | Variable | Notifications en attente |
| `useOutboxStore` | `localStorage` (kbv-outbox) | Variable | Opérations offline en attente |

---

## 5. Synchronisation des données

### Architecture offline-first

```
Opération → Outbox (local) → Sync → Supabase → Pull → Merge → Store
```

### Flux de synchronisation

1. Les opérations d'écriture sont d'abord stockées dans l'outbox (IndexedDB/localStorage).
2. À la synchronisation, l'outbox est rejouée vers Supabase.
3. Les données distantes sont rapatriées (pull).
4. Les tombstones sont appliqués pour les suppressions distantes.
5. Un merge par timestamp détermine la version gagnante.
6. Un fallback push envoie les données locales modifiées depuis la dernière sync.

---

## 6. Sécurité

- **contextIsolation: true** pour Electron (sécurité).
- **nodeIntegration: false** pour Electron (pas d'accès Node depuis le renderer).
- **Nettoyage des clés Supabase du localStorage** (migration de sécurité v5).
- **Variables d'environnement** pour les clés API (`.env`).
- **Anon key Supabase** : utilisation de la clé anon (RLS côté Supabase).

---

## 7. Tests

- **Tests unitaires (Vitest)** : Couvre l'import/export, le dédoublement, les templates et la synchronisation.
- **Tests Playwright E2E** : Validation des flux de base sur interface utilisateur.
- **Tests d'intégration** : Couvre les scénarios complexes de synchronisation.

---

## 8. Performance

- **Code splitting** : routes lazy-loadées avec Suspense.
- **Manual chunks** : séparation vendor (Supabase, framer-motion, Radix, lucide-react).
- **Tree shaking** : Vite + SWC gère le tree shaking.
- **Memoïsation** : useMemo et useCallback pour optimiser les rendus.

---

## 9. Configuration et build

- **Multi-plateforme** : Web (Vite), Android/iOS (Capacitor) et Desktop (Electron-builder).
- **NSIS** : Installateur Windows paramétré pour une installation simple et locale.
- **PWA** : Configuration complète avec icônes et share_target.

---

## 10. Recommandations Implémentées

- **Retry exponentiel** : Implémenté sur les opérations push vers Supabase.
- **Limitation outbox** : Limitation automatique à 500 entrées pour éviter la saturation locale.
- **API Google Sheets** : Utilisation du nouvel export officiel.
- **Validation au dépersist** : Schémas Zod pour sécuriser la réhydratation des données persistées.

---

*Développé avec ❤️ pour faciliter le service de nos frères.*
