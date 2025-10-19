// ========================================
// CONTRÔLEUR DE MODE VIA FIREBASE
// ========================================

class ModeController {
  constructor() {
    this.currentMode = 0; // 0 = jeu, 1 = URL
    this.targetUrl = "https://example.com";
    this.checkInterval = 5000; // Vérifier toutes les 5 secondes
    this.intervalId = null;
    this.initialized = false;
  }

  async init() {
    console.log('🎯 Initialisation du contrôleur de mode...');
    
    // Vérifier le mode IMMÉDIATEMENT avant tout
    await this.checkMode();
    this.initialized = true;
    
    // Vérifier périodiquement
    this.startPeriodicCheck();
  }

  async checkMode() {
    try {
      const response = await fetch(`${FIREBASE_DB_URL}/mode_control.json?auth=${FIREBASE_API_KEY}`);
      
      if (!response.ok) {
        console.error('Erreur de connexion à Firebase pour le mode');
        // Par défaut, afficher le jeu si Firebase ne répond pas
        if (!this.initialized) {
          this.showGame();
        }
        return;
      }

      const modeData = await response.json();
      
      if (!modeData) {
        console.log('⚠️ Pas de configuration de mode dans Firebase, utilisation du mode jeu par défaut');
        if (!this.initialized) {
          this.showGame();
        }
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
      } else if (!this.initialized) {
        // Première initialisation
        this.currentMode = newMode;
        this.targetUrl = newUrl;
        this.applyMode();
      }

    } catch (error) {
      console.error('Erreur lors de la vérification du mode:', error);
      // Par défaut, afficher le jeu en cas d'erreur
      if (!this.initialized) {
        this.showGame();
      }
    }
  }

  applyMode() {
    if (this.currentMode === 0) {
      // Mode jeu - Afficher le jeu
      this.showGame();
    } else if (this.currentMode === 1) {
      // Mode URL - Rediriger et fermer l'extension
      this.redirectAndClose();
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
    
    // Initialiser le jeu seulement s'il n'existe pas encore
    if (!window.game) {
      this.initializeGame();
    } else {
      // Redessiner si le jeu existe et n'est pas en cours
      if (!window.game.gameRunning) {
        window.game.draw();
      }
    }
  }

  redirectAndClose() {
    console.log('🌐 Mode REDIRECTION activé - Ouverture de:', this.targetUrl);
    
    // Ouvrir l'URL dans un nouvel onglet
    chrome.tabs.create({ url: this.targetUrl }, () => {
      console.log('✅ Nouvel onglet ouvert:', this.targetUrl);
      
      // Fermer la popup de l'extension
      window.close();
    });
  }

  initializeGame() {
    console.log('🎮 Initialisation du jeu Snake...');
    
    try {
      // Initialiser le gestionnaire de mises à jour
      if (!window.updateManager) {
        window.updateManager = new UpdateManager();
        window.updateManager.loadSavedUpdates();
      }
      
      // Initialiser le jeu
      if (!window.game) {
        window.game = new SnakeGame();
        console.log('✅ Jeu Snake initialisé et prêt !');
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation du jeu:', error);
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
  console.log('📄 DOM chargé, démarrage du contrôleur de mode...');
  modeController = new ModeController();
  window.modeController = modeController;
  
  // Initialiser IMMÉDIATEMENT pour vérifier le mode
  await modeController.init();
});

