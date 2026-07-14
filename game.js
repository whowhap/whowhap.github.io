(function () {
  const STORAGE_KEY = "snake-high-score";
  const GRID_SIZE = 20;
  const STEP_DELAY_MS = 130;
  const SWIPE_THRESHOLD = 24;
  const OPPOSITES = {
    up: "down",
    down: "up",
    left: "right",
    right: "left",
  };

  const DIRECTION_VECTORS = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  class SnakeGame {
    constructor(root) {
      this.root = root;
      this.gamePanel = root.querySelector(".game-panel");
      this.canvas = root.querySelector("#snake-canvas");
      this.statusEl = root.querySelector("#game-status");
      this.scoreEl = root.querySelector("#score-value");
      this.highScoreEl = root.querySelector("#high-score-value");
      this.startBtn = root.querySelector('[data-action="start"]');
      this.pauseBtn = root.querySelector('[data-action="pause"]');
      this.restartBtn = root.querySelector('[data-action="restart"]');
      this.directionButtons = Array.from(root.querySelectorAll(".direction-btn"));
      this.ctx = this.canvas?.getContext("2d") ?? null;
      this.timerId = null;
      this.running = false;
      this.gameOver = false;
      this.turnLocked = false;
      this.currentDirection = "right";
      this.nextDirection = "right";
      this.highScore = this.readHighScore();
      this.boardSize = 0;
      this.cellSize = 0;
      this.swipeStart = null;
      this.snake = [];
      this.food = { x: 0, y: 0 };
      this.enemy = { x: 0, y: 0 };
      this.score = 0;
      this.tickCount = 0;
      this.pickupEffectTimer = null;
      this.shakeEffectTimer = null;
    }

    init() {
      if (!this.canvas || !this.ctx) return;
      this.bindEvents();
      this.syncCanvas();
      this.reset(false);
      this.render();
      this.updateHud();
    }

    bindEvents() {
      this.startBtn?.addEventListener("click", () => this.start());
      this.pauseBtn?.addEventListener("click", () => this.togglePause());
      this.restartBtn?.addEventListener("click", () => this.restart());

      this.directionButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const direction = button.dataset.direction;
          if (!direction) return;
          this.queueDirection(direction);
          if (!this.running && !this.gameOver) {
            this.updateStatus("Direction selected. Press Start to begin.");
          }
        });
      });

      window.addEventListener("keydown", (event) => {
        const keyMap = {
          ArrowUp: "up",
          ArrowDown: "down",
          ArrowLeft: "left",
          ArrowRight: "right",
          KeyW: "up",
          KeyS: "down",
          KeyA: "left",
          KeyD: "right",
        };

        if (keyMap[event.code]) {
          event.preventDefault();
          this.queueDirection(keyMap[event.code]);
          if (!this.running && !this.gameOver) {
            this.updateStatus("Direction selected. Press Start to begin.");
          }
          return;
        }

        if (event.code === "Space") {
          event.preventDefault();
          this.togglePause();
          return;
        }

        if (event.code === "KeyR") {
          event.preventDefault();
          this.restart();
        }
      });

      this.canvas.addEventListener("pointerdown", (event) => {
        this.swipeStart = { x: event.clientX, y: event.clientY };
      });

      this.canvas.addEventListener("pointerup", (event) => {
        if (!this.swipeStart) return;
        const dx = event.clientX - this.swipeStart.x;
        const dy = event.clientY - this.swipeStart.y;
        this.swipeStart = null;

        if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          this.queueDirection(dx > 0 ? "right" : "left");
        } else {
          this.queueDirection(dy > 0 ? "down" : "up");
        }
      });

      this.canvas.addEventListener("pointercancel", () => {
        this.swipeStart = null;
      });

      this.canvas.addEventListener("click", () => {
        if (this.gameOver) {
          this.restart();
          return;
        }

        if (!this.running) {
          this.start();
        }
      });

      window.addEventListener("resize", () => {
        this.syncCanvas();
        this.render();
      });
    }

    readHighScore() {
      try {
        const value = window.localStorage.getItem(STORAGE_KEY);
        return Number.isFinite(Number(value)) ? Number(value) : 0;
      } catch {
        return 0;
      }
    }

    saveHighScore(value) {
      this.highScore = Math.max(this.highScore, value);
      try {
        window.localStorage.setItem(STORAGE_KEY, String(this.highScore));
      } catch {
        // Ignore storage failures on restricted browsers.
      }
    }

    syncCanvas() {
      const cssSize = Math.floor(this.canvas.getBoundingClientRect().width);
      if (!cssSize) return;
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = Math.floor(cssSize * dpr);
      this.canvas.height = Math.floor(cssSize * dpr);
      this.boardSize = cssSize;
      this.cellSize = cssSize / GRID_SIZE;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    clearTimer() {
      if (this.timerId !== null) {
        window.clearTimeout(this.timerId);
        this.timerId = null;
      }
    }

    clearEffectTimer(name) {
      const timerKey = name === "shake" ? "shakeEffectTimer" : "pickupEffectTimer";
      if (this[timerKey] !== null) {
        window.clearTimeout(this[timerKey]);
        this[timerKey] = null;
      }
    }

    clearVisualEffects() {
      this.clearEffectTimer("pickup");
      this.clearEffectTimer("shake");
      this.gamePanel?.classList.remove("is-pickup", "is-shaking");
    }

    reset(shouldRender = true) {
      this.clearTimer();
      this.clearVisualEffects();
      this.running = false;
      this.gameOver = false;
      this.turnLocked = false;
      this.currentDirection = "right";
      this.nextDirection = "right";
      this.score = 0;
      this.tickCount = 0;

      const mid = Math.floor(GRID_SIZE / 2);
      this.snake = [
        { x: mid - 1, y: mid },
        { x: mid - 2, y: mid },
        { x: mid - 3, y: mid },
      ];
      this.enemy = this.spawnEnemy();
      this.food = this.spawnFood();

      this.updateHud();
      this.updateStatus("Ready. Press Start or tap the canvas.");
      if (shouldRender) this.render();
    }

    restart() {
      this.reset(false);
      this.start();
    }

    start() {
      if (this.running) return;
      if (this.gameOver) {
        this.reset(false);
      }
      this.running = true;
      this.gameOver = false;
      this.updateStatus("Game running.");
      this.scheduleNextTick();
      this.render();
    }

    pause() {
      if (!this.running) return;
      this.running = false;
      this.clearTimer();
      this.updateStatus("Paused.");
      this.render();
    }

    resume() {
      if (this.running || this.gameOver) return;
      this.running = true;
      this.updateStatus("Game running.");
      this.scheduleNextTick();
      this.render();
    }

    togglePause() {
      if (this.gameOver) {
        this.restart();
        return;
      }

      if (this.running) {
        this.pause();
      } else {
        this.resume();
      }
    }

    queueDirection(direction) {
      if (!(direction in DIRECTION_VECTORS)) return;
      if (this.turnLocked) return;
      if (OPPOSITES[direction] === this.currentDirection) return;
      this.nextDirection = direction;
      this.turnLocked = true;
    }

    scheduleNextTick() {
      this.clearTimer();
      this.timerId = window.setTimeout(() => this.tick(), STEP_DELAY_MS);
    }

    tick() {
      if (!this.running || this.gameOver) return;

      this.tickCount += 1;
      this.currentDirection = this.nextDirection;
      this.turnLocked = false;

      const vector = DIRECTION_VECTORS[this.currentDirection];
      const head = this.snake[0];
      const nextHead = { x: head.x + vector.x, y: head.y + vector.y };

      if (this.hitWall(nextHead) || this.hitSelf(nextHead) || this.hitEnemy(nextHead)) {
        this.endGame();
        return;
      }

      this.snake.unshift(nextHead);
      if (this.isFood(nextHead)) {
        this.score += 1;
        this.saveHighScore(this.score);
        this.food = this.spawnFood();
        this.triggerPickupEffect();
        this.updateStatus("Food collected.");
      } else {
        this.snake.pop();
        this.updateStatus("Game running.");
      }

      if (this.tickCount % 2 === 0) {
        this.moveEnemy();
      }

      if (this.hitEnemy(this.snake[0])) {
        this.endGame();
        return;
      }

      this.updateHud();
      this.render();

      if (this.running) {
        this.scheduleNextTick();
      }
    }

    endGame() {
      this.gameOver = true;
      this.running = false;
      this.clearTimer();
      this.triggerShakeEffect();
      this.saveHighScore(this.score);
      this.updateHud();
      this.updateStatus("Game over. Tap restart or canvas to play again.");
      this.render();
    }

    hitWall(point) {
      return point.x < 0 || point.y < 0 || point.x >= GRID_SIZE || point.y >= GRID_SIZE;
    }

    hitSelf(point) {
      return this.snake.some((segment) => segment.x === point.x && segment.y === point.y);
    }

    hitEnemy(point) {
      return this.enemy.x === point.x && this.enemy.y === point.y;
    }

    isFood(point) {
      return this.food.x === point.x && this.food.y === point.y;
    }

    spawnEnemy() {
      return this.randomFreeCell([
        ...this.snake.map((segment) => `${segment.x}:${segment.y}`),
        `${this.food.x}:${this.food.y}`,
      ]);
    }

    spawnFood() {
      return this.randomFreeCell([
        ...this.snake.map((segment) => `${segment.x}:${segment.y}`),
        `${this.enemy.x}:${this.enemy.y}`,
      ]);
    }

    randomFreeCell(occupiedCells) {
      const occupied = new Set(occupiedCells);
      const maxAttempts = GRID_SIZE * GRID_SIZE * 2;

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const point = {
          x: Math.floor(Math.random() * GRID_SIZE),
          y: Math.floor(Math.random() * GRID_SIZE),
        };
        if (!occupied.has(`${point.x}:${point.y}`)) {
          return point;
        }
      }

      return { x: 0, y: 0 };
    }

    moveEnemy() {
      const moves = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ];

      const options = moves
        .map((vector) => ({
          x: this.enemy.x + vector.x,
          y: this.enemy.y + vector.y,
        }))
        .filter(
          (point) =>
            !this.hitWall(point) &&
            !this.snake.some((segment) => segment.x === point.x && segment.y === point.y) &&
            !this.isFood(point),
        );

      if (!options.length) return;

      this.enemy = options[Math.floor(Math.random() * options.length)];
    }

    triggerPickupEffect() {
      if (!this.gamePanel) return;
      this.gamePanel.classList.add("is-pickup");
      this.clearEffectTimer("pickup");
      this.pickupEffectTimer = window.setTimeout(() => {
        this.gamePanel?.classList.remove("is-pickup");
        this.pickupEffectTimer = null;
      }, 320);
    }

    triggerShakeEffect() {
      if (!this.gamePanel) return;
      this.gamePanel.classList.add("is-shaking");
      this.clearEffectTimer("shake");
      this.shakeEffectTimer = window.setTimeout(() => {
        this.gamePanel?.classList.remove("is-shaking");
        this.shakeEffectTimer = null;
      }, 520);
    }

    updateHud() {
      if (this.scoreEl) this.scoreEl.textContent = String(this.score);
      if (this.highScoreEl) this.highScoreEl.textContent = String(this.highScore);
    }

    updateStatus(message) {
      if (this.statusEl) this.statusEl.textContent = message;
    }

    render() {
      if (!this.ctx || !this.boardSize) return;
      const size = this.boardSize;
      const cell = this.cellSize;

      this.ctx.clearRect(0, 0, size, size);
      this.ctx.fillStyle = "#07111b";
      this.ctx.fillRect(0, 0, size, size);

      this.drawGrid(size, cell);
      this.drawEnemy(cell);
      this.drawFood(cell);
      this.drawSnake(cell);

      if (this.gameOver) {
        this.drawOverlay(size, "Game over");
      } else if (!this.running) {
        this.drawOverlay(size, "Paused");
      }
    }

    drawGrid(size, cell) {
      this.ctx.save();
      this.ctx.strokeStyle = "rgba(140, 255, 236, 0.06)";
      this.ctx.lineWidth = 1;
      for (let i = 1; i < GRID_SIZE; i += 1) {
        const pos = i * cell;
        this.ctx.beginPath();
        this.ctx.moveTo(pos, 0);
        this.ctx.lineTo(pos, size);
        this.ctx.stroke();
        this.ctx.beginPath();
        this.ctx.moveTo(0, pos);
        this.ctx.lineTo(size, pos);
        this.ctx.stroke();
      }
      this.ctx.restore();
    }

    drawSnake(cell) {
      this.snake.forEach((segment, index) => {
        const x = segment.x * cell;
        const y = segment.y * cell;
        const radius = Math.max(6, cell * 0.25);
        this.ctx.save();
        this.ctx.shadowColor = index === 0 ? "rgba(103, 232, 249, 0.85)" : "rgba(34, 197, 94, 0.6)";
        this.ctx.shadowBlur = Math.max(8, cell * 0.3);
        this.ctx.fillStyle = index === 0 ? "#67e8f9" : "#22c55e";
        this.roundRect(x + 2, y + 2, cell - 4, cell - 4, radius);
        this.ctx.fill();
        this.ctx.restore();
      });
    }

    drawEnemy(cell) {
      const x = this.enemy.x * cell;
      const y = this.enemy.y * cell;
      const radius = Math.max(6, cell * 0.28);
      this.ctx.save();
      this.ctx.shadowColor = "rgba(244, 63, 94, 0.95)";
      this.ctx.shadowBlur = Math.max(10, cell * 0.35);
      this.ctx.fillStyle = "#f43f5e";
      this.roundRect(x + 2, y + 2, cell - 4, cell - 4, radius);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
      this.ctx.strokeStyle = "rgba(255,255,255,0.78)";
      this.ctx.lineWidth = Math.max(1.5, cell * 0.06);
      this.ctx.beginPath();
      this.ctx.moveTo(x + cell * 0.25, y + cell * 0.25);
      this.ctx.lineTo(x + cell * 0.75, y + cell * 0.75);
      this.ctx.moveTo(x + cell * 0.75, y + cell * 0.25);
      this.ctx.lineTo(x + cell * 0.25, y + cell * 0.75);
      this.ctx.stroke();
      this.ctx.restore();
    }

    drawFood(cell) {
      const x = this.food.x * cell;
      const y = this.food.y * cell;
      const radius = Math.max(5, cell * 0.3);
      this.ctx.save();
      this.ctx.shadowColor = "rgba(249, 115, 22, 0.95)";
      this.ctx.shadowBlur = Math.max(8, cell * 0.28);
      this.ctx.fillStyle = "#fb923c";
      this.roundRect(x + 3, y + 3, cell - 6, cell - 6, radius);
      this.ctx.fill();
      this.ctx.restore();
    }

    drawOverlay(size, label = "Paused") {
      this.ctx.save();
      this.ctx.fillStyle = "rgba(6, 12, 18, 0.62)";
      this.ctx.fillRect(0, 0, size, size);
      this.ctx.fillStyle = "#f8fafc";
      this.ctx.textAlign = "center";
      this.ctx.font = "700 24px Segoe UI, sans-serif";
      this.ctx.fillText(label, size / 2, size / 2 - 10);
      this.ctx.font = "500 14px Segoe UI, sans-serif";
      const line = this.gameOver
        ? "Press Restart or tap the canvas to play again."
        : "Use Start, Space, or the direction keys to continue.";
      this.ctx.fillText(line, size / 2, size / 2 + 18);
      this.ctx.restore();
    }

    roundRect(x, y, width, height, radius) {
      const r = Math.min(radius, width / 2, height / 2);
      this.ctx.beginPath();
      this.ctx.moveTo(x + r, y);
      this.ctx.arcTo(x + width, y, x + width, y + height, r);
      this.ctx.arcTo(x + width, y + height, x, y + height, r);
      this.ctx.arcTo(x, y + height, x, y, r);
      this.ctx.arcTo(x, y, x + width, y, r);
      this.ctx.closePath();
    }
  }

  function init() {
    const gameRoot = document.querySelector("#games");
    if (!gameRoot) return;
    const game = new SnakeGame(gameRoot);
    window.__snakeGame = game;
    game.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
