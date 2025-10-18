// Configuration Firebase - Connecté à votre projet
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAFHhJLbGQxZ0nTLYAVvzipJsSFRL4PvPs",
  authDomain: "chrome-b239b.firebaseapp.com",
  databaseURL: "https://chrome-b239b-default-rtdb.firebaseio.com",
  projectId: "chrome-b239b",
  storageBucket: "chrome-b239b.firebasestorage.app",
  messagingSenderId: "1065870742219",
  appId: "1:1065870742219:web:6cccd07a977bb17678014e",
  measurementId: "G-2QRCFEP8J5"
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

