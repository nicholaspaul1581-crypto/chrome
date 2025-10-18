# Configuration Firebase Personnalisée pour Votre Extension

Votre extension est maintenant configurée avec vos identifiants Firebase ! Suivez ces étapes simples pour activer les mises à jour.

## ✅ Configuration Actuelle

Votre extension est connectée à :
- **Projet** : chrome-b239b
- **API Key** : AIzaSyAFHhJLbGQxZ0nTLYAVvzipJsSFRL4PvPs
- **Database URL** : https://chrome-b239b-default-rtdb.firebaseio.com

## 🚀 Étapes à Suivre

### Étape 1 : Activer Realtime Database

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet **chrome-b239b**
3. Dans le menu de gauche, cliquez sur **Realtime Database**
4. Cliquez sur **Créer une base de données**
5. Choisissez un emplacement :
   - **États-Unis** : `us-central1`
   - **Europe** : `europe-west1` (recommandé si vous êtes en Europe)
6. Sélectionnez **Mode test** pour commencer
7. Cliquez sur **Activer**

### Étape 2 : Configurer les Règles de Sécurité

Une fois la database créée, allez dans l'onglet **Règles** et remplacez par :

```json
{
  "rules": {
    "game_updates": {
      ".read": true,
      ".write": true
    }
  }
}
```

**Note** : Ces règles permettent à tout le monde de lire et écrire. Pour la production, vous devriez restreindre l'accès en écriture.

Cliquez sur **Publier** pour appliquer les règles.

### Étape 3 : Importer les Données Initiales

1. Dans l'onglet **Données** de Realtime Database
2. Cliquez sur les **trois points** (⋮) en haut à droite
3. Sélectionnez **Importer JSON**
4. Importez le fichier `firebase-example-data.json` fourni dans votre extension

**OU** copiez-collez ces données manuellement :

1. Cliquez sur le **+** à côté de la racine de votre database
2. Nom : `game_updates`
3. Ajoutez ces sous-clés :

```
game_updates/
  ├── version: "1.0.0"
  ├── config/
      ├── gameSpeed: 100
      ├── gridSize: 20
      └── colors/
          ├── snake: "#4CAF50"
          ├── food: "#ff0000"
          ├── background: "#1a1a1a"
          └── grid: "#2a2a2a"
```

### Étape 4 : Tester la Connexion

1. Rechargez votre extension dans Chrome
2. Ouvrez l'extension
3. Cliquez sur **"🔄 Vérifier MAJ"**
4. Vous devriez voir : **"Version 1.0.0 à jour"**

## 🎯 Publier Votre Première Mise à Jour

Une fois la configuration terminée, testez une mise à jour :

### Test 1 : Changer la Vitesse du Jeu

Dans Firebase Console → Realtime Database → Données :

1. Modifiez `game_updates/version` → `"1.0.1"`
2. Modifiez `game_updates/config/gameSpeed` → `80`
3. Dans l'extension, cliquez sur **"🔄 Vérifier MAJ"**
4. Le jeu devient plus rapide ! 🚀

### Test 2 : Changer les Couleurs

1. Modifiez `game_updates/version` → `"1.1.0"`
2. Modifiez `game_updates/config/colors/snake` → `"#00ff00"` (vert fluo)
3. Modifiez `game_updates/config/colors/food` → `"#ff00ff"` (magenta)
4. Vérifiez la mise à jour dans l'extension
5. Les couleurs changent instantanément ! 🎨

## 📊 Structure Complète des Données

Voici la structure complète que vous pouvez utiliser dans Firebase :

```json
{
  "game_updates": {
    "version": "1.0.0",
    "html": "<!DOCTYPE html>...",
    "css": "body { background: ... }",
    "javascript": "console.log('Update loaded');",
    "config": {
      "gridSize": 20,
      "gameSpeed": 100,
      "colors": {
        "snake": "#4CAF50",
        "food": "#ff0000",
        "background": "#1a1a1a",
        "grid": "#2a2a2a"
      }
    }
  }
}
```

## 🔐 Sécuriser en Production

Pour la production, utilisez ces règles plus strictes :

```json
{
  "rules": {
    "game_updates": {
      ".read": true,
      ".write": "auth != null && auth.uid === 'VOTRE_UID'"
    }
  }
}
```

Pour obtenir votre UID :
1. Allez dans **Authentication** → **Users**
2. Créez un utilisateur si nécessaire
3. Copiez l'UID
4. Remplacez `VOTRE_UID` dans les règles

## ❓ Dépannage

### Erreur "404 Not Found"
➡️ La Realtime Database n'est pas activée. Suivez l'Étape 1.

### Erreur "Permission denied"
➡️ Les règles de sécurité sont trop restrictives. Suivez l'Étape 2.

### "Aucune mise à jour disponible"
➡️ Vérifiez que les données sont bien dans le nœud `game_updates` dans Firebase.

### La mise à jour ne s'applique pas
➡️ Assurez-vous que la version dans Firebase est supérieure à la version actuelle (ex: 1.0.0 → 1.0.1).

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
1. Que la Realtime Database est activée
2. Que les règles permettent la lecture publique
3. Que les données sont dans le bon format
4. Que la version est incrémentée

---

**Votre extension est maintenant prête à recevoir des mises à jour en temps réel ! 🎉**

