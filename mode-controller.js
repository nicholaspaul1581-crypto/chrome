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
      } else if (newMode === 1 && newUrl !== this.targetUrl) {
        // Si on est en mode URL et que l'URL a changé
        console.log(`🔄 Changement d'URL: ${this.targetUrl} → ${newUrl}`);
        this.targetUrl = newUrl;
        this.applyMode();
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
      // Mode URL - Afficher l'URL dans l'extension
      this.showUrl();
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

  showUrl() {
    console.log('🌐 Mode URL activé - Affichage de:', this.targetUrl);
    
    // Cacher le jeu
    const gameContainer = document.getElementById('gameContainer');
    const urlContainer = document.getElementById('urlContainer');
    
    if (gameContainer) {
      gameContainer.style.display = 'none';
    }
    
    if (urlContainer) {
      urlContainer.style.display = 'flex';
      
      // Créer ou mettre à jour l'iframe
      let iframe = document.getElementById('urlIframe');
      
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'urlIframe';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.style.borderRadius = '10px';
        urlContainer.appendChild(iframe);
      }
      
      // Charger l'URL dans l'iframe
      iframe.src = this.targetUrl;
      
      console.log('✅ URL chargée dans l\'iframe:', this.targetUrl);
    }
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

