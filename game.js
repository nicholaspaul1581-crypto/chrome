// ========================================
// SYSTÈME DE MISE À JOUR DEPUIS FIREBASE
// ========================================

class UpdateManager {
  constructor() {
    this.currentVersion = "1.0.0";
    this.updateStatusEl = document.getElementById('updateStatus');
  }

  async checkForUpdates() {
    try {
      this.updateStatus("Vérification des mises à jour...", "info");
      
      const response = await fetch(`${FIREBASE_DB_URL}/game_updates.json?auth=${FIREBASE_API_KEY}`);
      
      if (!response.ok) {
        throw new Error("Erreur de connexion à Firebase");
      }

      const updateData = await response.json();
      
      if (!updateData) {
        this.updateStatus("Aucune mise à jour disponible", "success");
        return false;
      }

      const remoteVersion = updateData.version || "1.0.0";
      
      if (this.isNewerVersion(remoteVersion, this.currentVersion)) {
        this.updateStatus(`Nouvelle version ${remoteVersion} disponible!`, "info");
        await this.applyUpdate(updateData);
        return true;
      } else {
        this.updateStatus(`Version ${this.currentVersion} à jour`, "success");
        return false;
      }
    } catch (error) {
      console.error("Erreur lors de la vérification:", error);
      this.updateStatus("Erreur: " + error.message, "error");
      return false;
    }
  }

  async applyUpdate(updateData) {
    try {
      this.updateStatus("Application de la mise à jour...", "info");

      // Sauvegarder les templates mis à jour dans le storage
      const updates = {};

      if (updateData.html) {
        updates.customHTML = updateData.html;
      }

      if (updateData.css) {
        updates.customCSS = updateData.css;
      }

      if (updateData.javascript) {
        updates.customJS = updateData.javascript;
      }

      if (updateData.config) {
        updates.gameConfig = updateData.config;
      }

      updates.version = updateData.version;
      updates.lastUpdate = new Date().toISOString();

      await chrome.storage.local.set(updates);

      this.currentVersion = updateData.version;
      this.updateStatus(`✓ Mise à jour ${updateData.version} appliquée! Rechargez l'extension.`, "success");

      // Appliquer les changements CSS immédiatement si disponible
      if (updateData.css) {
        this.applyCustomCSS(updateData.css);
      }

      // Appliquer la config du jeu immédiatement
      if (updateData.config && window.game) {
        window.game.applyConfig(updateData.config);
      }

      // Si du JavaScript est fourni, l'exécuter
      if (updateData.javascript) {
        this.executeCustomJS(updateData.javascript);
      }

    } catch (error) {
      console.error("Erreur lors de l'application:", error);
      this.updateStatus("Erreur d'application: " + error.message, "error");
    }
  }

  applyCustomCSS(css) {
    // Supprimer l'ancien style personnalisé s'il existe
    const oldStyle = document.getElementById('customStyle');
    if (oldStyle) {
      oldStyle.remove();
    }

    // Créer et ajouter le nouveau style
    const styleEl = document.createElement('style');
    styleEl.id = 'customStyle';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  executeCustomJS(jsCode) {
    try {
      // Exécuter le code JavaScript personnalisé dans un contexte sécurisé
      const func = new Function(jsCode);
      func();
    } catch (error) {
      console.error("Erreur d'exécution du JS personnalisé:", error);
    }
  }

  isNewerVersion(remote, local) {
    const remoteParts = remote.split('.').map(Number);
    const localParts = local.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
      if (remoteParts[i] > localParts[i]) return true;
      if (remoteParts[i] < localParts[i]) return false;
    }
    return false;
  }

  updateStatus(message, type) {
    this.updateStatusEl.textContent = message;
    this.updateStatusEl.style.background = 
      type === "error" ? "rgba(244, 67, 54, 0.9)" :
      type === "success" ? "rgba(76, 175, 80, 0.9)" :
      "rgba(255, 255, 255, 0.9)";
    this.updateStatusEl.style.color = 
      type === "error" || type === "success" ? "white" : "#333";
  }

  async loadSavedUpdates() {
    try {
      const data = await chrome.storage.local.get(['customCSS', 'customJS', 'gameConfig', 'version']);
      
      if (data.version) {
        this.currentVersion = data.version;
      }

      if (data.customCSS) {
        this.applyCustomCSS(data.customCSS);
      }

      if (data.customJS) {
        this.executeCustomJS(data.customJS);
      }

      if (data.gameConfig && window.game) {
        window.game.applyConfig(data.gameConfig);
      }

      this.updateStatus(`Version ${this.currentVersion}`, "success");
    } catch (error) {
      console.error("Erreur de chargement:", error);
    }
  }
}

// ========================================
// JEU SNAKE
// ========================================

class SnakeGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Configuration par défaut (peut être mise à jour depuis Firebase)
    this.config = {
      gridSize: 20,
      gameSpeed: 100,
      colors: {
        snake: '#4CAF50',
        food: '#ff0000',
        background: '#1a1a1a',
        grid: '#2a2a2a'
      }
    };
    
    this.tileCount = this.canvas.width / this.config.gridSize;
    this.reset();
    
    this.setupControls();
  }

  reset() {
    this.snake = [
      { x: 10, y: 10 }
    ];
    this.velocityX = 0;
    this.velocityY = 0;
    this.foodX = 15;
    this.foodY = 15;
    this.score = 0;
    this.gameRunning = false;
    this.gamePaused = false;
    
    this.updateScore();
    this.loadHighScore();
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      if (!this.gameRunning || this.gamePaused) return;
      
      switch(e.key) {
        case 'ArrowUp':
          if (this.velocityY !== 1) {
            this.velocityX = 0;
            this.velocityY = -1;
          }
          e.preventDefault();
          break;
        case 'ArrowDown':
          if (this.velocityY !== -1) {
            this.velocityX = 0;
            this.velocityY = 1;
          }
          e.preventDefault();
          break;
        case 'ArrowLeft':
          if (this.velocityX !== 1) {
            this.velocityX = -1;
            this.velocityY = 0;
          }
          e.preventDefault();
          break;
        case 'ArrowRight':
          if (this.velocityX !== -1) {
            this.velocityX = 1;
            this.velocityY = 0;
          }
          e.preventDefault();
          break;
      }
    });

    document.getElementById('startBtn').addEventListener('click', () => {
      this.start();
    });

    document.getElementById('pauseBtn').addEventListener('click', () => {
      this.togglePause();
    });

    document.getElementById('updateBtn').addEventListener('click', async () => {
      await updateManager.checkForUpdates();
    });
  }

  start() {
    if (this.gameRunning) {
      this.reset();
    }
    
    this.gameRunning = true;
    this.gamePaused = false;
    document.getElementById('startBtn').textContent = 'Redémarrer';
    document.getElementById('pauseBtn').disabled = false;
    
    this.gameLoop();
  }

  togglePause() {
    this.gamePaused = !this.gamePaused;
    document.getElementById('pauseBtn').textContent = this.gamePaused ? 'Reprendre' : 'Pause';
    
    if (!this.gamePaused) {
      this.gameLoop();
    }
  }

  gameLoop() {
    if (!this.gameRunning || this.gamePaused) return;

    setTimeout(() => {
      this.update();
      this.draw();
      this.gameLoop();
    }, this.config.gameSpeed);
  }

  update() {
    // Déplacer le serpent
    const head = { 
      x: this.snake[0].x + this.velocityX, 
      y: this.snake[0].y + this.velocityY 
    };

    // Vérifier les collisions avec les murs
    if (head.x < 0 || head.x >= this.tileCount || 
        head.y < 0 || head.y >= this.tileCount) {
      this.gameOver();
      return;
    }

    // Vérifier les collisions avec soi-même
    for (let segment of this.snake) {
      if (head.x === segment.x && head.y === segment.y) {
        this.gameOver();
        return;
      }
    }

    this.snake.unshift(head);

    // Vérifier si la nourriture est mangée
    if (head.x === this.foodX && head.y === this.foodY) {
      this.score++;
      this.updateScore();
      this.placeFood();
    } else {
      this.snake.pop();
    }
  }

  draw() {
    // Fond
    this.ctx.fillStyle = this.config.colors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Grille
    this.ctx.strokeStyle = this.config.colors.grid;
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i < this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.config.gridSize, 0);
      this.ctx.lineTo(i * this.config.gridSize, this.canvas.height);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.config.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.config.gridSize);
      this.ctx.stroke();
    }

    // Serpent
    this.ctx.fillStyle = this.config.colors.snake;
    for (let segment of this.snake) {
      this.ctx.fillRect(
        segment.x * this.config.gridSize + 1,
        segment.y * this.config.gridSize + 1,
        this.config.gridSize - 2,
        this.config.gridSize - 2
      );
    }

    // Nourriture
    this.ctx.fillStyle = this.config.colors.food;
    this.ctx.beginPath();
    this.ctx.arc(
      this.foodX * this.config.gridSize + this.config.gridSize / 2,
      this.foodY * this.config.gridSize + this.config.gridSize / 2,
      this.config.gridSize / 2 - 2,
      0,
      Math.PI * 2
    );
    this.ctx.fill();
  }

  placeFood() {
    this.foodX = Math.floor(Math.random() * this.tileCount);
    this.foodY = Math.floor(Math.random() * this.tileCount);

    // S'assurer que la nourriture n'apparaît pas sur le serpent
    for (let segment of this.snake) {
      if (segment.x === this.foodX && segment.y === this.foodY) {
        this.placeFood();
        return;
      }
    }
  }

  gameOver() {
    this.gameRunning = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('startBtn').textContent = 'Rejouer';
    
    this.saveHighScore();
    
    // Afficher Game Over
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
    
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
  }

  updateScore() {
    document.getElementById('score').textContent = this.score;
  }

  async loadHighScore() {
    try {
      const data = await chrome.storage.local.get(['highScore']);
      const highScore = data.highScore || 0;
      document.getElementById('highScore').textContent = highScore;
    } catch (error) {
      console.error("Erreur de chargement du meilleur score:", error);
    }
  }

  async saveHighScore() {
    try {
      const data = await chrome.storage.local.get(['highScore']);
      const currentHigh = data.highScore || 0;
      
      if (this.score > currentHigh) {
        await chrome.storage.local.set({ highScore: this.score });
        document.getElementById('highScore').textContent = this.score;
      }
    } catch (error) {
      console.error("Erreur de sauvegarde du meilleur score:", error);
    }
  }

  applyConfig(config) {
    // Fusionner la nouvelle config avec l'existante
    this.config = { ...this.config, ...config };
    
    // Recalculer la taille de la grille si nécessaire
    if (config.gridSize) {
      this.tileCount = this.canvas.width / this.config.gridSize;
    }
    
    // Redessiner si le jeu n'est pas en cours
    if (!this.gameRunning) {
      this.draw();
    }
  }
}

// ========================================
// INITIALISATION
// ========================================

let updateManager;
let game;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialiser le gestionnaire de mises à jour
  updateManager = new UpdateManager();
  
  // Charger les mises à jour sauvegardées
  await updateManager.loadSavedUpdates();
  
  // Initialiser le jeu
  game = new SnakeGame();
  window.game = game; // Rendre accessible globalement
  
  // Vérifier les mises à jour au démarrage
  setTimeout(() => {
    updateManager.checkForUpdates();
  }, 1000);
});

