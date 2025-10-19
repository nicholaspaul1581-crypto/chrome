// Jeu Snake - Logique complète
class SnakeGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize;
    this.speed = 100;
    this.colors = {
      snake: '#4CAF50',
      food: '#ff0000',
      bg: '#1a1a1a',
      grid: '#2a2a2a'
    };
    this.reset();
    this.setupControls();
    this.draw();
    this.loadSettings();
    
    const statusEl = document.getElementById('updateStatus');
    if (statusEl) {
      statusEl.textContent = 'Prêt à jouer!';
      statusEl.style.background = 'rgba(76,175,80,0.9)';
      statusEl.style.color = 'white';
    }
  }

  async loadSettings() {
    try {
      const res = await fetch(`${FIREBASE_DB_URL}/game_settings.json?auth=${FIREBASE_API_KEY}`, {
        signal: AbortSignal.timeout(2000)
      });
      
      if (!res.ok) return;
      
      const settings = await res.json();
      if (!settings) return;
      
      if (settings.speed) this.speed = settings.speed;
      if (settings.gridSize) {
        this.gridSize = settings.gridSize;
        this.tileCount = this.canvas.width / this.gridSize;
      }
      if (settings.snakeColor) this.colors.snake = settings.snakeColor;
      if (settings.foodColor) this.colors.food = settings.foodColor;
      this.draw();
    } catch (e) {
      // Ignorer les erreurs
    }
  }

  reset() {
    this.snake = [{x: 10, y: 10}];
    this.vx = 0;
    this.vy = 0;
    this.foodX = 15;
    this.foodY = 15;
    this.score = 0;
    this.running = false;
    this.paused = false;
    this.updateScore();
    this.loadHighScore();
  }

  setupControls() {
    document.addEventListener('keydown', e => {
      if (!this.running && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        switch(e.key) {
          case 'ArrowUp': this.vx=0; this.vy=-1; break;
          case 'ArrowDown': this.vx=0; this.vy=1; break;
          case 'ArrowLeft': this.vx=-1; this.vy=0; break;
          case 'ArrowRight': this.vx=1; this.vy=0; break;
        }
        this.start();
        return;
      }
      if (!this.running || this.paused) return;
      switch(e.key) {
        case 'ArrowUp': if(this.vy!==1){this.vx=0;this.vy=-1} e.preventDefault(); break;
        case 'ArrowDown': if(this.vy!==-1){this.vx=0;this.vy=1} e.preventDefault(); break;
        case 'ArrowLeft': if(this.vx!==1){this.vx=-1;this.vy=0} e.preventDefault(); break;
        case 'ArrowRight': if(this.vx!==-1){this.vx=1;this.vy=0} e.preventDefault(); break;
      }
    });

    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    if (startBtn) startBtn.onclick = () => this.start();
    if (pauseBtn) pauseBtn.onclick = () => this.togglePause();
  }

  start() {
    if (this.running) {
      this.reset();
      this.draw();
      return;
    }
    if (this.vx === 0 && this.vy === 0) {
      this.vx = 1;
      this.vy = 0;
    }
    this.running = true;
    this.paused = false;
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    if (startBtn) startBtn.textContent = 'Redémarrer';
    if (pauseBtn) pauseBtn.disabled = false;
    this.loop();
  }

  togglePause() {
    this.paused = !this.paused;
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) pauseBtn.textContent = this.paused ? 'Reprendre' : 'Pause';
    if (!this.paused) this.loop();
  }

  loop() {
    if (!this.running || this.paused) return;
    setTimeout(() => {
      this.update();
      this.draw();
      this.loop();
    }, this.speed);
  }

  update() {
    const head = {x: this.snake[0].x + this.vx, y: this.snake[0].y + this.vy};
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.gameOver();
      return;
    }
    for (let s of this.snake) {
      if (head.x === s.x && head.y === s.y) {
        this.gameOver();
        return;
      }
    }
    this.snake.unshift(head);
    if (head.x === this.foodX && head.y === this.foodY) {
      this.score++;
      this.updateScore();
      this.placeFood();
    } else {
      this.snake.pop();
    }
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.fillStyle = this.colors.bg;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = this.colors.grid;
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i <= this.tileCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.gridSize, 0);
      this.ctx.lineTo(i * this.gridSize, this.canvas.height);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.gridSize);
      this.ctx.lineTo(this.canvas.width, i * this.gridSize);
      this.ctx.stroke();
    }
    this.ctx.fillStyle = this.colors.snake;
    for (let s of this.snake) {
      this.ctx.fillRect(s.x * this.gridSize + 1, s.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
    }
    this.ctx.fillStyle = this.colors.food;
    this.ctx.beginPath();
    this.ctx.arc(
      this.foodX * this.gridSize + this.gridSize / 2,
      this.foodY * this.gridSize + this.gridSize / 2,
      this.gridSize / 2 - 2, 0, Math.PI * 2
    );
    this.ctx.fill();
  }

  placeFood() {
    this.foodX = Math.floor(Math.random() * this.tileCount);
    this.foodY = Math.floor(Math.random() * this.tileCount);
    for (let s of this.snake) {
      if (s.x === this.foodX && s.y === this.foodY) {
        this.placeFood();
        return;
      }
    }
  }

  gameOver() {
    this.running = false;
    const pauseBtn = document.getElementById('pauseBtn');
    const startBtn = document.getElementById('startBtn');
    if (pauseBtn) pauseBtn.disabled = true;
    if (startBtn) startBtn.textContent = 'Rejouer';
    this.saveHighScore();
    this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
  }

  updateScore() {
    const el = document.getElementById('score');
    if (el) el.textContent = this.score;
  }

  async loadHighScore() {
    try {
      const data = await chrome.storage.local.get(['highScore']);
      const high = data.highScore || 0;
      const el = document.getElementById('highScore');
      if (el) el.textContent = high;
    } catch (e) {}
  }

  async saveHighScore() {
    try {
      const data = await chrome.storage.local.get(['highScore']);
      const current = data.highScore || 0;
      if (this.score > current) {
        await chrome.storage.local.set({highScore: this.score});
        const el = document.getElementById('highScore');
        if (el) el.textContent = this.score;
      }
    } catch (e) {}
  }
}

// Initialiser le jeu seulement si le container est visible
setTimeout(() => {
  const gameContainer = document.getElementById('gameContainer');
  if (gameContainer && gameContainer.style.display !== 'none') {
    window.game = new SnakeGame();
  }
}, 100);

