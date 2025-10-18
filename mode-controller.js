// ========================================
// CONTRÔLEUR DE MODE VIA FIREBASE
// ========================================

class ModeController {
  constructor() {
    this.currentMode = 0; // 0 = jeu, 1 = URL
    this.targetUrl = "https://example.com";
    this.checkInterval = 5000; // Vérifier toutes les 5 secondes
    this.intervalId = null;
  }

  async init() {
    console.log('🎯 Initialisation du contrôleur de mode...');
    
    // Vérifier le mode immédiatement
    await this.checkMode();
    
    // Vérifier périodiquement
    this.startPeriodicCheck();
  }

  async checkMode() {
    try {
      const response = await fetch(`${FIREBASE_DB_URL}/mode_control.json?auth=${FIREBASE_API_KEY}`);
      
      if (!response.ok) {
        console.error('Erreur de connexion à Firebase pour le mode');
        return;
      }

      const modeData = await response.json();
      
      if (!modeData) {
        console.log('⚠️ Pas de configuration de mode dans Firebase, utilisation du mode jeu par défaut');
        return;
      }

      const newMode = parseInt(modeData.number) || 0;
      const newUrl = modeData.url || "https://example.com";

      // Si le mode a changé
      if (newMode !== this.currentMode) {
        console.log(`🔄 Changement de mode: ${this.currentMode} → ${newMode}`);
        this.currentMode = newMode;
        this.targetUrl = newUrl;
        this.applyMode();
      } else {
        // Mettre à jour l'URL même si le mode n'a pas changé
        this.targetUrl = newUrl;
      }

    } catch (error) {
      console.error('Erreur lors de la vérification du mode:', error);
    }
  }

  applyMode() {
    if (this.currentMode === 0) {
      // Mode jeu - Afficher le jeu
      this.showGame();
    } else if (this.currentMode === 1) {
      // Mode URL - Rediriger vers l'URL
      this.redirectToUrl();
    }
  }

  showGame() {
    console.log('🎮 Mode JEU activé');
    
    // Afficher le conteneur du jeu
    const gameContainer = document.getElementById('gameContainer');
    const urlContainer = document.getElementById('urlContainer');
    
    if (gameContainer) {
      gameContainer.style.display = 'flex';
    }
    
    if (urlContainer) {
      urlContainer.style.display = 'none';
    }
    
    // Réinitialiser le jeu si nécessaire
    if (window.game && !window.game.gameRunning) {
      window.game.draw();
    }
  }

  redirectToUrl() {
    console.log('🌐 Mode URL activé - Redirection vers:', this.targetUrl);
    
    // Cacher le jeu
    const gameContainer = document.getElementById('gameContainer');
    const urlContainer = document.getElementById('urlContainer');
    
    if (gameContainer) {
      gameContainer.style.display = 'none';
    }
    
    if (urlContainer) {
      urlContainer.style.display = 'flex';
      
      // Mettre à jour le message et le lien
      const messageEl = document.getElementById('urlMessage');
      const linkEl = document.getElementById('urlLink');
      
      if (messageEl) {
        messageEl.textContent = 'Redirection en cours...';
      }
      
      if (linkEl) {
        linkEl.href = this.targetUrl;
        linkEl.textContent = this.targetUrl;
      }
    }
    
    // Rediriger automatiquement après 2 secondes
    setTimeout(() => {
      window.open(this.targetUrl, '_blank');
    }, 2000);
  }

  startPeriodicCheck() {
    // Vérifier le mode toutes les 5 secondes
    this.intervalId = setInterval(() => {
      this.checkMode();
    }, this.checkInterval);
    
    console.log(`⏱️ Vérification du mode toutes les ${this.checkInterval/1000} secondes`);
  }

  stopPeriodicCheck() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('⏹️ Vérification périodique arrêtée');
    }
  }
}

// Instance globale
let modeController;

// Initialiser le contrôleur au chargement
document.addEventListener('DOMContentLoaded', async () => {
  modeController = new ModeController();
  window.modeController = modeController;
  
  // Attendre un peu que Firebase soit configuré
  setTimeout(() => {
    modeController.init();
  }, 500);
});

