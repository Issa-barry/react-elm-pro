# Configuration CI/CD

## Vue d'ensemble

| Déclencheur | Workflow | Résultat |
|---|---|---|
| Push / PR toutes branches | `ci.yml` | Lint + Tests |
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

Dans le dépôt `Issa-barry/react-elm-client` :

**Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Nom | Valeur |
|---|---|
| `EXPO_TOKEN` | le token généré à l'étape 1 |

### 3. Connecter le dépôt GitHub à EAS

```bash
cd elm-mobile-client
eas init --id 22377fc4-8804-4e63-a2da-c37723147e16
```

Le `projectId` est déjà renseigné dans `app.json`.

## Soumettre au Play Store (optionnel)

Pour activer la soumission automatique au Play Store après le build production,
décommenter la section `EAS Submit` dans `.github/workflows/eas-production.yml`
et configurer les secrets Play Store dans EAS :

```bash
eas secret:create --scope project --name GOOGLE_SERVICE_ACCOUNT_KEY --type file --value ./service-account.json
```
