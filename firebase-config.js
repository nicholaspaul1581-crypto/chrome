// Configuration Firebase - À remplacer avec vos propres credentials
const FIREBASE_CONFIG = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_PROJECT_ID.firebaseapp.com",
  databaseURL: "https://VOTRE_PROJECT_ID.firebaseio.com",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_PROJECT_ID.appspot.com",
  messagingSenderId: "VOTRE_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

// URL de l'API Firebase Realtime Database
const FIREBASE_DB_URL = FIREBASE_CONFIG.databaseURL;

// Clé API pour les requêtes
const FIREBASE_API_KEY = FIREBASE_CONFIG.apiKey;

// Structure des données dans Firebase:
// {
//   "game_updates": {
//     "version": "1.0.0",
//     "html": "<html>...</html>",
//     "css": "body { ... }",
//     "javascript": "// code du jeu",
//     "config": {
//       "gameSpeed": 100,
//       "gridSize": 20,
//       "colors": {
//         "snake": "#4CAF50",
//         "food": "#ff0000",
//         "background": "#1a1a1a"
//       }
//     }
//   }
// }

