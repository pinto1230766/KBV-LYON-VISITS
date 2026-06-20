# 🔄 Breaking Changes - KBV-LYON-VISITS v2.1.0 → v2.2.0

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

## 📞 Support

En cas de questions sur ces changements:

1. Vérifier les erreurs TypeScript/ESLint
2. Consulter la documentation des packages mis à jour
3. Utiliser `npm audit fix` pour les problèmes de dépendances

---

> Document généré automatiquement lors de la mise à jour v2.1.0 → v2.2.0
