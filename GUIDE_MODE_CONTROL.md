# Guide du Système de Contrôle de Mode

Votre extension peut maintenant basculer entre **deux modes** contrôlés en temps réel depuis Firebase :

- **Mode 0** : Affiche le jeu Snake
- **Mode 1** : Redirige vers une URL personnalisée

## 🎯 Comment ça Fonctionne

L'extension vérifie Firebase **toutes les 5 secondes** pour voir si le mode a changé. Quand vous modifiez la valeur dans Firebase, l'extension change automatiquement de comportement.

## 📊 Structure Firebase

Dans votre Firebase Realtime Database, ajoutez cette structure :

```json
{
  "mode_control": {
    "number": 0,
    "url": "https://example.com"
  }
}
```

### Champs

| Champ | Type | Description |
|-------|------|-------------|
| `number` | 0 ou 1 | **0** = Jeu Snake, **1** = Redirection URL |
| `url` | string | L'URL de destination quand `number = 1` |

## 🚀 Configuration Initiale

### Étape 1 : Ajouter les Données dans Firebase

**Option A - Import JSON**
1. Firebase Console → Realtime Database → Données
2. Cliquez sur **⋮** → **Importer JSON**
3. Importez le fichier `firebase-mode-control-example.json`

**Option B - Ajout Manuel**
1. Cliquez sur **+** à côté de la racine
2. Nom : `mode_control`
3. Ajoutez :
   - `number` : `0`
   - `url` : `"https://example.com"`

### Étape 2 : Tester le Mode Jeu (par défaut)

1. Rechargez votre extension dans Chrome
2. Ouvrez l'extension
3. Vous devriez voir le **jeu Snake** (mode 0)

### Étape 3 : Tester le Mode URL

1. Dans Firebase, changez `mode_control/number` → `1`
2. Changez `mode_control/url` → `"https://google.com"` (ou votre URL)
3. Attendez **5 secondes maximum**
4. L'extension affiche maintenant un message de redirection
5. Une nouvelle fenêtre s'ouvre automatiquement vers l'URL

### Étape 4 : Revenir au Jeu

1. Dans Firebase, changez `mode_control/number` → `0`
2. Attendez 5 secondes
3. Le jeu Snake réapparaît !

## 💡 Exemples d'Utilisation

### Exemple 1 : Rediriger vers votre Site Web

```json
{
  "mode_control": {
    "number": 1,
    "url": "https://monsite.com"
  }
}
```

### Exemple 2 : Rediriger vers une Page de Promotion

```json
{
  "mode_control": {
    "number": 1,
    "url": "https://monsite.com/promo-speciale"
  }
}
```

### Exemple 3 : Retour au Jeu

```json
{
  "mode_control": {
    "number": 0,
    "url": "https://example.com"
  }
}
```

**Note** : L'URL est ignorée quand `number = 0`

## ⚙️ Personnalisation

### Changer la Fréquence de Vérification

Par défaut, l'extension vérifie Firebase toutes les **5 secondes**. Pour changer :

Modifiez dans `mode-controller.js` :

```javascript
this.checkInterval = 5000; // 5 secondes
```

Changez à :
- `3000` pour 3 secondes (plus réactif)
- `10000` pour 10 secondes (moins de requêtes)

### Désactiver la Redirection Automatique

Si vous voulez que l'utilisateur clique manuellement sur le lien :

Dans `mode-controller.js`, commentez ces lignes :

```javascript
// setTimeout(() => {
//   window.open(this.targetUrl, '_blank');
// }, 2000);
```

## 🎮 Cas d'Usage

### 1. Maintenance Programmée

Pendant une maintenance, basculez en mode 1 pour rediriger vers une page "Maintenance en cours".

```json
{
  "mode_control": {
    "number": 1,
    "url": "https://monsite.com/maintenance"
  }
}
```

### 2. Événement Spécial

Pendant un événement, redirigez vers une page d'inscription.

```json
{
  "mode_control": {
    "number": 1,
    "url": "https://monsite.com/event-special"
  }
}
```

### 3. Mode Normal

Le reste du temps, laissez les utilisateurs jouer.

```json
{
  "mode_control": {
    "number": 0,
    "url": ""
  }
}
```

## 🔍 Débogage

### Vérifier le Mode Actuel

Ouvrez la console développeur (F12) dans l'extension et tapez :

```javascript
modeController.currentMode
```

Résultat :
- `0` = Mode jeu
- `1` = Mode URL

### Forcer une Vérification

```javascript
modeController.checkMode()
```

### Voir l'URL Actuelle

```javascript
modeController.targetUrl
```

## 📊 Combiner avec les Mises à Jour du Jeu

Vous pouvez avoir les deux systèmes actifs en même temps :

```json
{
  "mode_control": {
    "number": 0,
    "url": "https://example.com"
  },
  "game_updates": {
    "version": "1.1.0",
    "config": {
      "gameSpeed": 80,
      "colors": {
        "snake": "#00ff00",
        "food": "#ff00ff"
      }
    }
  }
}
```

## 🔐 Sécurité

Les règles Firebase doivent permettre la lecture de `mode_control` :

```json
{
  "rules": {
    "mode_control": {
      ".read": true,
      ".write": true
    },
    "game_updates": {
      ".read": true,
      ".write": true
    }
  }
}
```

**Pour la production**, restreignez l'écriture :

```json
{
  "rules": {
    "mode_control": {
      ".read": true,
      ".write": "auth != null"
    },
    "game_updates": {
      ".read": true,
      ".write": "auth != null"
    }
  }
}
```

## 🎯 Résumé Rapide

| Action | Firebase | Résultat |
|--------|----------|----------|
| Afficher le jeu | `number: 0` | Jeu Snake visible |
| Rediriger vers URL | `number: 1` | Ouverture de l'URL |
| Changer l'URL | Modifier `url` | Nouvelle destination |

---

**Temps de réaction** : Maximum 5 secondes après modification dans Firebase  
**Redirection automatique** : 2 secondes après détection du mode 1

