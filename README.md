# Extension Chrome - Jeu Snake avec Mises à Jour via Firebase

Ce projet est une extension Chrome qui intègre un jeu Snake simple et un système de mise à jour dynamique et complet via Firebase. L'extension peut télécharger et appliquer des mises à jour de son propre code (HTML, CSS, JavaScript) et de sa configuration sans nécessiter une nouvelle publication sur le Chrome Web Store.

## ✨ Fonctionnalités

- **Jeu Snake Classique** : Jouez au jeu Snake directement depuis l'icône de l'extension.
- **Système de Mise à Jour Dynamique** : Mettez à jour l'extension à distance via Firebase.
- **Mise à Jour Complète du Template** : Modifiez le HTML, le CSS et le JavaScript du jeu sans nouvelle publication.
- **Configuration à Distance** : Changez les paramètres du jeu (vitesse, couleurs, etc.) en temps réel.
- **Stockage Local** : Sauvegarde du meilleur score et des mises à jour appliquées.
- **Icônes Personnalisées** : Icônes générées pour l'extension.

## 📂 Structure du Projet

```
/chrome
├── manifest.json         # Fichier de manifeste de l'extension
├── popup.html            # Structure HTML du jeu
├── styles.css            # Styles CSS par défaut
├── game.js               # Logique du jeu et système de mise à jour
├── firebase-config.js    # Fichier de configuration Firebase (à modifier)
├── FIREBASE_SETUP.md     # Guide détaillé pour configurer Firebase
├── firebase-example-data.json # Données d'exemple pour Firebase
├── icon16.png            # Icône 16x16
├── icon48.png            # Icône 48x48
├── icon128.png           # Icône 128x128
└── README.md             # Ce fichier
```

## 🚀 Installation et Configuration

Suivez ces étapes pour installer et configurer l'extension.

### Étape 1 : Configurer Firebase

Avant toute chose, vous devez configurer un projet Firebase pour gérer les mises à jour.

➡️ **Suivez le guide détaillé ici : [FIREBASE_SETUP.md](FIREBASE_SETUP.md)**

Ce guide vous expliquera comment :
1. Créer un projet Firebase.
2. Activer Realtime Database.
3. Configurer les règles de sécurité.
4. Obtenir vos identifiants Firebase.
5. Importer les données d'exemple.

### Étape 2 : Mettre à jour la configuration de l'extension

1. Ouvrez le fichier `firebase-config.js`.
2. Remplacez les placeholders (`VOTRE_API_KEY`, `VOTRE_PROJECT_ID`, etc.) par les identifiants de votre projet Firebase que vous avez obtenus à l'étape précédente.

### Étape 3 : Charger l'extension dans Chrome

1. Ouvrez Google Chrome.
2. Allez à l'adresse `chrome://extensions/`.
3. Activez le **"Mode développeur"** en haut à droite.
4. Cliquez sur **"Charger l'extension non empaquetée"**.
5. Sélectionnez le dossier `/chrome` contenant les fichiers du projet.

L'icône du jeu Snake devrait apparaître dans la barre d'outils de votre navigateur.

## 🎮 Comment Jouer

1. Cliquez sur l'icône de l'extension pour ouvrir le jeu.
2. Cliquez sur **"Démarrer"** pour commencer une partie.
3. Utilisez les **flèches directionnelles** (← ↑ → ↓) pour diriger le serpent.
4. Mangez la nourriture pour grandir et augmenter votre score.
5. Évitez de toucher les murs ou votre propre queue.

## 🔄 Comment fonctionne le système de mise à jour

Le système de mise à jour est géré par la classe `UpdateManager` dans `game.js`.

### Vérification des mises à jour

- Au démarrage de l'extension, une vérification est automatiquement lancée.
- Vous pouvez forcer une vérification en cliquant sur le bouton **"🔄 Vérifier MAJ"**.

### Processus de mise à jour

1. L'extension contacte votre Firebase Realtime Database à l'URL configurée.
2. Elle compare la version locale (par défaut `1.0.0`) à la version distante (`version` dans Firebase).
3. Si la version distante est plus récente, l'extension télécharge les données de mise à jour (`html`, `css`, `javascript`, `config`).
4. Les nouvelles données sont sauvegardées dans le `chrome.storage.local`.
5. Les modifications sont appliquées dynamiquement :
   - Le **CSS** est injecté directement dans la page.
   - La **configuration** du jeu est appliquée à l'instance du jeu.
   - Le **JavaScript** personnalisé est exécuté.
   - Pour appliquer le **HTML**, l'extension doit être rechargée (en la fermant et la rouvrant).

### Publier une mise à jour

Pour publier une mise à jour, il vous suffit de modifier les données dans votre **Firebase Realtime Database** sous le nœud `game_updates`.

Vous pouvez modifier :
- `version` : **Obligatoire** pour déclencher la mise à jour. Doit être supérieure à la version actuelle (ex: `1.0.0` -> `1.1.0`).
- `html` : Le nouveau contenu du `body` de `popup.html`.
- `css` : Le nouveau code CSS.
- `javascript` : Du code JavaScript qui sera exécuté une fois.
- `config` : Un objet JSON avec les nouveaux paramètres du jeu.

**Exemple : Augmenter la vitesse du jeu**

Modifiez simplement les données dans Firebase :

```json
{
  "game_updates": {
    "version": "1.0.1",
    "config": {
      "gameSpeed": 80
    }
  }
}
```

La prochaine fois que l'utilisateur vérifiera les mises à jour, la vitesse du jeu augmentera.

## 🔧 Personnalisation

- **Graphismes** : Modifiez les fichiers `icon16.png`, `icon48.png`, `icon128.png` pour changer les icônes.
- **Styles** : Modifiez `styles.css` pour changer l'apparence par défaut.
- **Logique du jeu** : Modifiez la classe `SnakeGame` dans `game.js` pour altérer le gameplay.
- **Structure HTML** : Modifiez `popup.html` pour changer la disposition des éléments.

## ⚠️ Sécurité

- Les règles de sécurité par défaut dans `FIREBASE_SETUP.md` sont pour le développement. En production, assurez-vous de restreindre l'accès en écriture à votre base de données pour éviter que des tiers ne publient des mises à jour malveillantes.
- Le système exécute du JavaScript distant. Assurez-vous que votre base de données Firebase est sécurisée.

