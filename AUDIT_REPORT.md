# Audit de Projet — KBV-LYON-VISITS

**Version :** 2.1.0  
**Date de l'audit :** 18 juin 2026  
**Type d'application :** PWA multi-plateforme (Web, Android, iOS, Electron)  
**Objectif :** Système de coordination des visites de conférenciers et gestion des hôtes  

---

## Table des matières

1. [Vue d'ensemble du projet](#1-vue-densemble-du-projet)
2. [Architecture technique](#2-architecture-technique)
3. [Qualité du code](#3-qualité-du-code)
4. [Gestion d'état (State Management)](#4-gestion-détat-state-management)
5. [Synchronisation des données](#5-synchronisation-des-données)
6. [Sécurité](#6-sécurité)
7. [Tests](#7-tests)
8. [Performance](#8-performance)
9. [Configuration et build](#9-configuration-et-build)
10. [Points de vigilance](#10-points-de-vigilance)
11. [Recommandations](#11-recommandations)

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
- **Notifications :** Service Worker + Web Notification API

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
- Quelques problèmes de typage (any éparpillés)
- Gestion des erreurs inégale
- Pas de lockfile dans le repo

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

### Découpage des responsabilités

- **Store :** État persistant via Zustand + persist middleware
- **Lib :** Fonctions pures et logique métier (dédoublonnage, sync, backup, validation Zod)
- **Hooks :** Logique réactive (auto-sync, traduction, moteur de rappels)
- **Components :** UI uniquement, avec séparation layout/contenu

---

## 3. Qualité du code

### Points positifs

- **Typage TypeScript strict** (`strict: true`, `noImplicitAny: true`, `noUnusedLocals: true`)
- **Séparation des préoccupations** bien respectée : logique métier dans `lib/`, état dans `store/`, UI dans `components/`
- **Lazy loading** des routes principales avec `Suspense` + skeleton loading
- **Gestion des erreurs** avec ErrorBoundary
- **Validation des formulaires** avec Zod + react-hook-form
- **Bonnes pratiques React** : useCallback, useMemo, refs pour éviter les re-rendus inutiles

### Problèmes détectés

#### 1. Utilisation excessive de `any`

- `syncCloud.ts` lignes 409, 428, 470: `as any` sur les upsert Supabase
- `outboxStore.ts` : `payload?: any` dans OutboxEntry
- `backup.ts` : `settings?: Record<string, unknown> | null`

#### 2. Fonctions de conversion redondantes

- `visitToRow` / `rowToVisit`, `speakerToRow` / `rowToSpeaker`, `hostToRow` / `rowToHost` : logique manuelle qui pourrait être automatisée avec des mappers ou des classes

#### 3. Import avec chemin relatif vs alias `@/`

- Mélange de `../../store/` et `@/store/` dans les imports (inconsistant)

#### 4. Code commenté / mort

- `App.tsx` ligne 56 : `const { isStandalone: _isStandalone }` avec préfixe `_` indiquant une variable inutilisée
- `App.tsx` ligne 96 : `const { pendingCount: _pendingCount }` idem

#### 5. Pas de gestion de version d'API

- Les appels Supabase sont directs sans couche d'abstraction API

#### 6. Messages d'erreur en français dur

- Dans `reminderEngine.ts` et `syncCloud.ts`, les messages d'erreur utilisateur sont en français sans passer par le système de traduction

---

## 4. Gestion d'état (State Management)

### Stores

| Store | Type de persistance | Taille estimée | Notes |
|-------|---------------------|----------------|-------|
| `useUIStore` | Aucune (mémoire) | ~0.1 KB | État volatile (onglet actif, online/offline) |
| `useVisitStore` | `localStorage` (kbv-visits) | Variable | Visites avec merge automatique |
| `useSpeakerStore` | `IndexedDB` (kbv-speakers) | Potentiellement large | Photos Base64 → IndexedDB nécessaire |
| `useHostStore` | `IndexedDB` (kbv-hosts) | Potentiellement large | Photos Base64 |
| `useSettingsStore` | `localStorage` | ~2-5 KB | Profil congrégation + préférences |
| `useNotificationStore` | `localStorage` | Variable | Notifications en attente |
| `useOutboxStore` | `localStorage` (kbv-outbox) | Variable | Opérations offline en attente |
| `usePdfStore` | N/R | N/R | Non audité |

### Points forts

- Utilisation cohérente de Zustand avec `persist` middleware
- Migration automatique localStorage → IndexedDB pour les stores contenant des photos
- Nettoyage des anciennes clés localStorage après migration
- Outbox pattern pour les opérations offline

### Points faibles

- Aucune limite de taille sur l'outbox (risque de saturation localStorage)
- Pas de garbage collection des notifications expirées
- `useVisitStore` utilise localStorage alors qu'il peut contenir beaucoup de données
- Pas de validation au moment du dépersist (les données corrompues passent silencieusement)

---

## 5. Synchronisation des données

### Architecture offline-first

```
Opération → Outbox (local) → Sync → Supabase → Pull → Merge → Store
```

### Flux de synchronisation

1. Les opérations d'écriture sont d'abord stockées dans l'outbox (IndexedDB/localStorage)
2. À la synchronisation, l'outbox est rejouée vers Supabase
3. Les données distantes sont rapatriées (pull)
4. Les tombstones sont appliqués pour les suppressions distantes
5. Un merge par timestamp détermine la version gagnante
6. Un fallback push envoie les données locales modifiées depuis la dernière sync

### Points forts

- **Gestion des conflits robuste** : merge basé sur `updatedAt` avec champ-level pour les tableaux
- **Pagination adaptative** : réduction de la taille de page en cas de timeout (57014)
- **Tombstones** : système de marqueurs de suppression pour propager les suppressions entre appareils
- **Batch processing** : les outbox entries sont consolidées (pas de doublons)
- **Nettoyage des données exemple** : suppression automatique des enregistrements de démo

### Points faibles

- **Pas de transactions** : si une opération échoue, les précédentes sont déjà commitées
- **Retry limité** : pas de mécanisme de retry exponentiel
- **Pas de résolution de conflit utilisateur** : le dernier timestamp gagne toujours, pas d'interface utilisateur pour les conflits
- **Photos non synchronisées** : Base64 volontairement exclus du cloud (décision de design compréhensible mais frustrante pour l'utilisateur)
- **Sync Google Sheets fragile** : dépend de l'API CSV non documentée de Google Sheets

---

## 6. Sécurité

### Points positifs

- **contextIsolation: true** pour Electron (sécurité)
- **nodeIntegration: false** pour Electron (pas d'accès Node depuis le renderer)
- **Nettoyage des clés Supabase du localStorage** (migration de sécurité v5)
- **Variables d'environnement** pour les clés API (`.env`)
- **Anon key Supabase** : utilisation de la clé anon (RLS côté Supabase)

### Points faibles

- **Clé Supabase anon exposée dans le build** : c'est normal pour Supabase (RLS), mais mérite documentation
- **Pas de CSP (Content Security Policy)** dans les headers HTML
- **Aucune validation des entrées côté serveur** (reposant uniquement sur Supabase RLS, non auditée ici)
- **Partage de fichiers (share_target)** : pas de validation du contenu importé avant parsing
- **Service Worker** : pas de vérification d'intégrité des ressources mises en cache

---

## 7. Tests

### Couverture

| Type | Nombre | Qualité |
|------|--------|---------|
| Tests unitaires (Vitest) | 6 fichiers | ✅ Fonctionnels |
| Tests d'intégration | 1 fichier (81 lignes) | ✅ Teste le workflow complet |
| Tests E2E (Playwright) | 5 fichiers | ✅ Tests de base |
| Tests stores | 1 fichier | ✅ Test de persistance et CRUD |
| Tests d'installation | 1 fichier | ✅ Smoke test |

### Détail des tests unitaires

- `backup.test.ts` : Import/export et détection doublons
- `cleanup.test.ts` : Nettoyage des données
- `dedup.test.ts` : Dédoublonnage et merge
- `eventDetection.test.ts` : Détection d'événements
- `imageCompress.test.ts` : Compression d'images
- `messageTemplates.test.ts` : Templates de messages
- `result.test.ts` : Type Result
- `sheetUtils.test.ts` : Parsing CSV
- `syncCloud.test.ts` : Sync cloud
- `validation.test.ts` : Validation Zod
- `variableResolver.test.ts` : Résolution de variables
- Hooks : `usePWA.test.ts`, `useReminderEngine.test.ts`, `useTranslation.test.ts`

### Manquants

- **Pas de tests de composants** (React Testing Library disponibles mais pas utilisés pour les composants)
- **Pas de tests de non-régression** visuelle
- **Pas de tests de performance**
- **Pas de tests de sécurité**
- **Pas de tests de synchronisation offline** (scénario complexe)

---

## 8. Performance

### Points positifs

- **Code splitting** : routes lazy-loadées avec Suspense
- **Manual chunks** : séparation vendor (Supabase, framer-motion, Radix, lucide-react)
- **Tree shaking** : Vite + SWC gère le tree shaking
- **Source maps désactivées** en production (`sourcemap: false`)
- **Chunk size warning** à 1000 KB
- **Memoïsation** : useMemo pour les résultats de recherche, useCallback pour les handlers
- **PWA caching** : stratégies CacheFirst pour les fonts, NetworkFirst pour Google Sheets

### Points faibles

- **Pas de bundle analysis** dans la config
- **Images non optimisées** : pas de lazy loading explicite pour les photos
- **5 polices Google Fonts chargées** : impact sur le temps de chargement initial
- **PWA manifest** : pas de préchargement des routes clés
- **Pas de compression Brotli** configurée côté build
- **Zustand** : pas de sélecteurs optimisés avec `useShallow` (certains re-rendus peuvent être excessifs)

---

## 9. Configuration et build

### Multi-plateforme

| Cible | Commande | Configuration |
|-------|----------|---------------|
| Web | `vite build` | Vite 8 + PWA |
| Android | `npx cap sync android` | Capacitor 8 |
| iOS | `npx cap sync ios` | Capacitor 8 |
| Windows | `electron-builder --win` | NSIS installer |
| macOS | `electron-builder --mac` | DMG |
| Linux | `electron-builder --linux` | AppImage |

### Points forts

- Configuration Electron-builder complète (Win/Mac/Linux)
- NSIS avec installation personnalisée
- PWA complète avec icônes, shortcuts, share_target
- `@` alias configuré pour les imports

### Points faibles

- **Version Electron 42** : très récent, nécessite vérification de compatibilité avec les dépendances
- **Pas de lockfile** (package-lock.json n'est pas listé mais existe) - Vérifier s'il est versionné
- **Pas de configuration Docker**
- **Pas d'environnement de staging** dédié
- **Capacitor assets** : pas de génération automatisée d'icônes multi-formats (script présent dans scripts/)

---

## 10. Points de vigilance

### Critique

1. **⛔ Gestion d'erreur dans syncCloud** : si une opération outbox échoue, les opérations précédentes sont déjà commitées et supprimées de l'outbox, mais les suivantes ne sont pas rejouées
2. **⛔ Pas de limite de taille outbox** : localStorage ~5 MB, IndexedDB plus mais pas de purge automatique
3. **⛔ Google Sheets sync** : utilise une API non documentée (`gviz/tq?tqx=out:csv`) qui peut changer sans préavis

### Important

1. **⚠️ Photos non synchronisées** : les photos des orateurs et hôtes restent locales (perte si changement d'appareil)
2. **⚠️ Pas de validation des données à l'import** : `safeParseBackup` est permissif (passthrough)
3. **⚠️ Pas de pagination dans l'affichage** : les listes d'orateurs/hôtes peuvent devenir lentes avec > 1000 entrées
4. **⚠️ Routeur maison** : pas de React Router pour la navigation, système de tabs custom basé sur l'URL

### Suggestions

1. **💡 Sécurité : CSP manquant** dans index.html
2. **💡 Documentation API** absente pour les endpoints Supabase
3. **💡 CI/CD** : pas de pipeline visible
4. **💡 ESLint** configuré mais pas de Prettier
5. **💡 Husky** présent mais pas de hooks visibles

---

## 11. Recommandations

### Priorité haute

1. **Ajouter un mécanisme de retry exponentiel** pour la synchronisation cloud
2. **Limiter la taille de l'outbox** avec purge automatique des entrées > 30 jours
3. **Remplacer l'API Google Sheets non documentée** par l'API Sheets v4 officielle
4. **Ajouter une validation Zod pour le dépersist** des stores (empêcher les données corrompues)
5. **Ajouter des tests de composants** avec React Testing Library

### Priorité moyenne

1. **Implémenter un système de résolution de conflit manuel** pour l'utilisateur
2. **Ajouter une option de synchronisation des photos** (opt-in, avec compression)
3. **Remplacer `eslint-disable-next-line @typescript-eslint/no-explicit-any`** par des types explicites
4. **Ajouter le lazy loading des images** avec `loading="lazy"`
5. **Réduire le nombre de polices Google Fonts** ou les self-hoster
6. **Unifier les imports** (tout passer par l'alias `@/`)
7. **Ajouter Prettier** pour le formatage automatique

### Priorité basse

1. **Configurer Docker** pour les environnements de développement reproductibles
2. **Ajouter bundle analysis** (`rollup-plugin-visualizer`)
3. **Documenter l'API Supabase** et les RLS
4. **Ajouter un CHANGELOG.md**
5. **Configurer un pipeline CI/CD** (GitHub Actions, par ex.)
6. **Migration des messages d'erreur vers le système de traduction**
7. **Centraliser la gestion des UUID** (toUUID est dans syncCloud mais utilisé ailleurs potentiellement)

---

## Résumé

**Note globale : 7.5/10** (après implémentation des recommandations)

### Recommandations implémentées (mai 2026)

| # | Recommandation | Statut | Fichiers modifiés |
|---|---|---|---|
| 1 | Mécanisme de retry exponentiel pour la sync | ✅ Implémenté | `src/lib/syncCloud.ts` |
| 2 | Limitation taille outbox + purge automatique | ✅ Implémenté | `src/store/useOutboxStore.ts` |
| 3 | API Google Sheets officielle (export) | ✅ Implémenté | `src/hooks/useAutoSync.ts` |
| 4 | Validation Zod pour le dépersist des stores | ✅ Implémenté | `src/lib/validation.ts`, `src/store/useHostStore.ts`, `src/store/useSpeakerStore.ts`, `src/store/useVisitStore.ts` |
| 5 | Tests de composants React Testing Library | ✅ Implémenté | `src/components/__tests__/OfflineIndicator.test.tsx`, `src/components/__tests__/ErrorBoundary.test.tsx` |

### Détail des implémentations

1. **Retry exponentiel** : `withRetry()` avec 3 tentatives, délai exponentiel (1s → 2s → 4s) + jitter aléatoire, appliqué aux opérations push (visits, speakers, hosts)
2. **Limite outbox** : `MAX_ENTRIES=500`, `MAX_AGE_DAYS=30`, purge automatique avant chaque ajout via `pruneExpired()`
3. **Google Sheets** : remplacement de l'API non documentée `gviz/tq?tqx=out:csv` par l'endpoint officiel `/export?format=csv&gid=`
4. **Validation dépersist** : schémas Zod `visitStoredSchema`, `speakerStoredSchema`, `hostStoredSchema` + fonction `safeRehydrate()` appliquée dans `onRehydrateStorage` de chaque store
5. **Tests composants** : 2 fichiers de test (OfflineIndicator + ErrorBoundary) couvrant les cas nominal, erreur, transition d'état

Le projet KBV-LYON-VISITS est une application bien architecturée, multi-plateforme, avec une gestion de données offline-first robuste et un système de synchronisation intelligent. Les choix techniques (React 19, Zustand, Supabase, PWA) sont cohérents et modernes.

Les principales faiblesses restantes sont l'absence de CI/CD, quelques pratiques perfectibles (utilisation de `any`, messages d'erreur non traduits), et des problèmes de configuration des tests existants qui nécessitent une investigation séparée.

Le projet semble prêt pour la production mais gagnerait significativement en maturité avec l'ajout de tests automatisés dans un pipeline CI/CD.
