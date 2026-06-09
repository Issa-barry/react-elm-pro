# Configuration CI/CD — elm-mobile-pro

## Vue d'ensemble

| Déclencheur | Workflow | Résultat |
|---|---|---|
| Push / PR toutes branches | `lint.yml` + `tests.yml` | Lint + Tests |
| Push sur `dev` | `eas-preview.yml` | APK (distribution interne) |
| Push sur `main` | `eas-production.yml` | AAB (Play Store) |

## Prérequis

### 1. Générer un token EAS

```bash
npx expo login          # connectez-vous avec le compte ibarry
npx expo whoami         # vérifier la connexion
npx eas-cli credentials # optionnel — gérer les certificats
```

Sur [expo.dev](https://expo.dev) → **Account Settings** → **Access Tokens** → créer un token nommé `GITHUB_ACTIONS`.

### 2. Ajouter le secret dans GitHub

Dans le dépôt `Issa-barry/react-elm-pro` :

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Nom | Valeur |
|---|---|
| `EXPO_TOKEN` | le token généré à l'étape 1 |

### 3. Créer un projet EAS pour elm-mobile-pro

```bash
cd react-elm-pro
eas init
```

Cette commande crée un nouveau projet EAS distinct de elm-mobile-client.
Le `projectId` retourné doit être mis à jour dans `app.json` → `extra.eas.projectId`.

### 4. Identifiants distincts

| App | bundle ID iOS | package Android | slug Expo |
|---|---|---|---|
| elm-mobile-client | `com.eaulamaman.client` | `com.eaulamaman.client` | `eau-la-maman` |
| elm-mobile-pro | `com.issamobile.elmpro` | `com.issamobile.elmpro` | `elm-mobile-pro` |

## Soumettre au Play Store (optionnel)

Pour activer la soumission automatique au Play Store après le build production,
décommenter la section `EAS Submit` dans `.github/workflows/eas-production.yml`
et configurer les secrets Play Store dans EAS :

```bash
eas secret:create --scope project --name GOOGLE_SERVICE_ACCOUNT_KEY --type file --value ./service-account.json
```
