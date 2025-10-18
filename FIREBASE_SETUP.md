# Guide de Configuration Firebase

Ce guide vous explique comment configurer Firebase pour permettre les mises à jour complètes de votre extension Chrome.

## Étape 1 : Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur **"Ajouter un projet"**
3. Donnez un nom à votre projet (ex: "snake-game-updates")
4. Suivez les étapes de création

## Étape 2 : Activer Realtime Database

1. Dans votre projet Firebase, allez dans **"Realtime Database"** dans le menu
2. Cliquez sur **"Créer une base de données"**
3. Choisissez un emplacement (ex: europe-west1)
4. Commencez en **mode test** (vous pourrez sécuriser plus tard)

## Étape 3 : Configurer les règles de sécurité

Dans l'onglet **"Règles"** de Realtime Database, utilisez ces règles pour permettre la lecture publique :

```json
{
  "rules": {
    "game_updates": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

**Important** : Ces règles permettent à tout le monde de lire les mises à jour, mais seuls les utilisateurs authentifiés peuvent écrire. Pour la production, vous devriez restreindre davantage.

## Étape 4 : Obtenir vos identifiants Firebase

1. Allez dans **Paramètres du projet** (icône engrenage)
2. Faites défiler jusqu'à **"Vos applications"**
3. Cliquez sur l'icône **Web** (`</>`)
4. Enregistrez votre application (ex: "Snake Game Extension")
5. Copiez la configuration Firebase qui ressemble à :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "votre-projet.firebaseapp.com",
  databaseURL: "https://votre-projet.firebaseio.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

## Étape 5 : Configurer l'extension

1. Ouvrez le fichier `firebase-config.js`
2. Remplacez les valeurs `VOTRE_XXX` par vos vraies valeurs Firebase
3. Sauvegardez le fichier

```javascript
const FIREBASE_CONFIG = {
  apiKey: "VOTRE_VRAIE_API_KEY",
  authDomain: "votre-projet.firebaseapp.com",
  databaseURL: "https://votre-projet.firebaseio.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

## Étape 6 : Importer les données de test

1. Dans Firebase Console, allez dans **Realtime Database**
2. Cliquez sur les **trois points** en haut à droite
3. Sélectionnez **"Importer JSON"**
4. Importez le fichier `firebase-example-data.json` fourni

Vous verrez alors cette structure dans votre base de données :

```
game_updates/
  ├── version: "1.1.0"
  ├── html: "<!DOCTYPE html>..."
  ├── css: "* { margin: 0; ..."
  ├── javascript: "console.log('Mise à jour...');"
  └── config/
      ├── gridSize: 20
      ├── gameSpeed: 80
      └── colors/
          ├── snake: "#00ff00"
          ├── food: "#ff00ff"
          ├── background: "#0a0a0a"
          └── grid: "#1a1a1a"
```

## Étape 7 : Tester les mises à jour

1. Chargez l'extension dans Chrome
2. Ouvrez l'extension
3. Cliquez sur le bouton **"🔄 Vérifier MAJ"**
4. La mise à jour devrait être appliquée automatiquement

## Structure des mises à jour

### Champs disponibles

| Champ | Type | Description |
|-------|------|-------------|
| `version` | string | Numéro de version (ex: "1.1.0") |
| `html` | string | Code HTML complet du template |
| `css` | string | Code CSS pour le style |
| `javascript` | string | Code JavaScript à exécuter |
| `config` | object | Configuration du jeu |

### Configuration du jeu

```json
{
  "config": {
    "gridSize": 20,
    "gameSpeed": 80,
    "colors": {
      "snake": "#00ff00",
      "food": "#ff00ff",
      "background": "#0a0a0a",
      "grid": "#1a1a1a"
    }
  }
}
```

## Comment publier une mise à jour

### Méthode 1 : Via l'interface Firebase Console

1. Allez dans **Realtime Database**
2. Naviguez vers `game_updates`
3. Modifiez les valeurs directement
4. Les utilisateurs recevront la mise à jour au prochain clic sur "Vérifier MAJ"

### Méthode 2 : Via l'API REST

```bash
curl -X PUT \
  'https://votre-projet.firebaseio.com/game_updates.json?auth=VOTRE_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "version": "1.2.0",
    "config": {
      "gameSpeed": 60
    }
  }'
```

### Méthode 3 : Via un script Node.js

```javascript
const admin = require('firebase-admin');

admin.initializeApp({
  databaseURL: "https://votre-projet.firebaseio.com"
});

const db = admin.database();
const ref = db.ref('game_updates');

ref.update({
  version: "1.2.0",
  config: {
    gameSpeed: 60,
    colors: {
      snake: "#ff0000"
    }
  }
});
```

## Exemples de mises à jour

### Changer la vitesse du jeu

```json
{
  "version": "1.1.1",
  "config": {
    "gameSpeed": 60
  }
}
```

### Changer les couleurs

```json
{
  "version": "1.1.2",
  "config": {
    "colors": {
      "snake": "#ff6b6b",
      "food": "#4ecdc4",
      "background": "#1a1a2e",
      "grid": "#16213e"
    }
  }
}
```

### Modifier le CSS (nouveau thème)

```json
{
  "version": "1.2.0",
  "css": "body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }"
}
```

### Ajouter du JavaScript personnalisé

```json
{
  "version": "1.3.0",
  "javascript": "console.log('Nouvelle fonctionnalité activée!'); alert('Mise à jour appliquée!');"
}
```

## Sécurité en production

Pour la production, modifiez les règles Firebase :

```json
{
  "rules": {
    "game_updates": {
      ".read": true,
      ".write": "auth.uid === 'VOTRE_UID_ADMIN'"
    }
  }
}
```

## Dépannage

### L'extension ne se connecte pas à Firebase

- Vérifiez que les identifiants dans `firebase-config.js` sont corrects
- Vérifiez que les règles de sécurité permettent la lecture publique
- Ouvrez la console développeur (F12) pour voir les erreurs

### Les mises à jour ne s'appliquent pas

- Vérifiez que la version dans Firebase est supérieure à la version actuelle
- Rechargez l'extension après une mise à jour
- Vérifiez que les données sont bien dans le chemin `game_updates`

### Erreur CORS

- Assurez-vous d'utiliser `https://` dans l'URL de la database
- Vérifiez que les permissions `host_permissions` sont correctes dans `manifest.json`

## Support

Pour plus d'informations sur Firebase :
- [Documentation Firebase](https://firebase.google.com/docs)
- [Realtime Database Guide](https://firebase.google.com/docs/database)

