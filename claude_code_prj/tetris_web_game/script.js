const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 30;
const PREVIEW_CELL_SIZE = 24;
const STORAGE_KEY = "tetris-best-score";

const COLORS = [
  null,
  "#ffb703",
  "#8ecae6",
  "#219ebc",
  "#fb8500",
  "#90be6d",
  "#f94144",
  "#b5179e",
];

const SHAPES = {
  T: [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
  ],
  O: [
    [2, 2],
    [2, 2],
  ],
  L: [
    [0, 3, 0],
    [0, 3, 0],
    [0, 3, 3],
  ],
  J: [
    [0, 4, 0],
    [0, 4, 0],
    [4, 4, 0],
  ],
  I: [
    [0, 0, 0, 0],
    [5, 5, 5, 5],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  S: [
    [0, 6, 6],
    [6, 6, 0],
    [0, 0, 0],
  ],
  Z: [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0],
  ],
};

const SCORE_TABLE = [0, 100, 300, 500, 800];

const gameCanvas = document.getElementById("game");
const gameContext = gameCanvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextContext = nextCanvas.getContext("2d");

const scoreEl = document.getElementById("score");
const linesEl = document.getElementById("lines");
const levelEl = document.getElementById("level");
const bestEl = document.getElementById("best");
const overlayEl = document.getElementById("overlay");
const overlayTitleEl = document.getElementById("overlay-title");
const overlayTextEl = document.getElementById("overlay-text");

const startButton = document.getElementById("start-btn");
const pauseButton = document.getElementById("pause-btn");
const restartButton = document.getElementById("restart-btn");
const touchControls = document.querySelector(".touch-controls");

const arena = createMatrix(COLS, ROWS);
const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
  lines: 0,
  level: 1,
};

let bestScore = Number(localStorage.getItem(STORAGE_KEY) || 0);
let lastTime = 0;
let dropCounter = 0;
let animationFrameId = null;
let isGameStarted = false;
let isPaused = false;
let isGameOver = false;
let pieceQueue = [];

bestEl.textContent = bestScore;

function createMatrix(width, height) {
  return Array.from({ length: height }, () => Array(width).fill(0));
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function refillBag() {
  pieceQueue.push(...shuffle(["T", "O", "L", "J", "I", "S", "Z"]));
}

function nextPiece() {
  if (pieceQueue.length <= 2) {
    refillBag();
  }
  return cloneMatrix(SHAPES[pieceQueue.shift()]);
}

function drawCell(context, x, y, value, size) {
  context.fillStyle = COLORS[value];
  context.fillRect(x * size, y * size, size, size);
  context.fillStyle = "rgba(255, 255, 255, 0.16)";
  context.fillRect(x * size, y * size, size, 4);
  context.fillStyle = "rgba(0, 0, 0, 0.18)";
  context.fillRect(x * size, y * size + size - 4, size, 4);
  context.strokeStyle = "rgba(7, 14, 24, 0.35)";
  context.strokeRect(x * size + 0.5, y * size + 0.5, size - 1, size - 1);
}

function drawMatrix(matrix, offset, context, size) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        drawCell(context, x + offset.x, y + offset.y, value, size);
      }
    });
  });
}

function drawBoard() {
  gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  drawMatrix(arena, { x: 0, y: 0 }, gameContext, CELL_SIZE);
  if (player.matrix) {
    drawMatrix(player.matrix, player.pos, gameContext, CELL_SIZE);
  }
}

function drawNextPiece() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  const preview = pieceQueue[0] ? SHAPES[pieceQueue[0]] : null;
  if (!preview) {
    return;
  }
  const width = preview[0].length;
  const height = preview.length;
  const offset = {
    x: Math.floor((nextCanvas.width / PREVIEW_CELL_SIZE - width) / 2),
    y: Math.floor((nextCanvas.height / PREVIEW_CELL_SIZE - height) / 2),
  };
  drawMatrix(preview, offset, nextContext, PREVIEW_CELL_SIZE);
}

function collide(board, currentPlayer) {
  const { matrix, pos } = currentPlayer;
  return matrix.some((row, y) =>
    row.some((value, x) => {
      if (value === 0) {
        return false;
      }
      const boardRow = board[y + pos.y];
      return !boardRow || boardRow[x + pos.x] !== 0;
    }),
  );
}

function merge(board, currentPlayer) {
  currentPlayer.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        board[y + currentPlayer.pos.y][x + currentPlayer.pos.x] = value;
      }
    });
  });
}

function rotate(matrix, direction) {
  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < y; x += 1) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (direction > 0) {
    matrix.forEach((row) => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerRotate(direction) {
  if (!isGameStarted || isPaused || isGameOver) {
    return;
  }
  const originalX = player.pos.x;
  let offset = 1;
  rotate(player.matrix, direction);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -direction);
      player.pos.x = originalX;
      return;
    }
  }
  drawBoard();
}

function arenaSweep() {
  let cleared = 0;
  outer: for (let y = arena.length - 1; y >= 0; y -= 1) {
    for (let x = 0; x < arena[y].length; x += 1) {
      if (arena[y][x] === 0) {
        continue outer;
      }
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    y += 1;
    cleared += 1;
  }

  if (cleared > 0) {
    player.lines += cleared;
    player.level = Math.floor(player.lines / 10) + 1;
    player.score += SCORE_TABLE[cleared] * player.level;
    updateScoreboard();
  }
}

function playerDrop() {
  if (!isGameStarted || isPaused || isGameOver) {
    return;
  }

  player.pos.y += 1;
  if (collide(arena, player)) {
    player.pos.y -= 1;
    merge(arena, player);
    arenaSweep();
    spawnPlayer();
  }
  dropCounter = 0;
  drawBoard();
}

function hardDrop() {
  if (!isGameStarted || isPaused || isGameOver) {
    return;
  }
  while (!collide(arena, player)) {
    player.pos.y += 1;
  }
  player.pos.y -= 1;
  merge(arena, player);
  arenaSweep();
  spawnPlayer();
  dropCounter = 0;
  drawBoard();
}

function playerMove(offset) {
  if (!isGameStarted || isPaused || isGameOver) {
    return;
  }
  player.pos.x += offset;
  if (collide(arena, player)) {
    player.pos.x -= offset;
  }
  drawBoard();
}

function resetArena() {
  arena.forEach((row) => row.fill(0));
}

function spawnPlayer() {
  player.matrix = nextPiece();
  player.pos.y = 0;
  player.pos.x = Math.floor(COLS / 2) - Math.ceil(player.matrix[0].length / 2);
  drawNextPiece();

  if (collide(arena, player)) {
    finishGame();
  }
}

function getDropInterval() {
  return Math.max(120, 1000 - (player.level - 1) * 85);
}

function updateScoreboard() {
  scoreEl.textContent = player.score;
  linesEl.textContent = player.lines;
  levelEl.textContent = player.level;

  if (player.score > bestScore) {
    bestScore = player.score;
    localStorage.setItem(STORAGE_KEY, String(bestScore));
    bestEl.textContent = bestScore;
  }
}

function showOverlay(title, text) {
  overlayTitleEl.textContent = title;
  overlayTextEl.textContent = text;
  overlayEl.classList.remove("hidden");
}

function hideOverlay() {
  overlayEl.classList.add("hidden");
}

function startGame(reset = false) {
  if (reset || !isGameStarted || isGameOver) {
    resetArena();
    player.score = 0;
    player.lines = 0;
    player.level = 1;
    pieceQueue = [];
    refillBag();
    refillBag();
    updateScoreboard();
    isGameOver = false;
    spawnPlayer();
  }

  isGameStarted = true;
  isPaused = false;
  hideOverlay();
  lastTime = performance.now();

  if (!animationFrameId) {
    animationFrameId = requestAnimationFrame(update);
  }
  drawBoard();
}

function pauseGame() {
  if (!isGameStarted || isGameOver) {
    return;
  }
  isPaused = !isPaused;
  if (isPaused) {
    showOverlay("游戏暂停", "按开始按钮或 P 键继续。");
  } else {
    hideOverlay();
    lastTime = performance.now();
  }
}

function finishGame() {
  isGameOver = true;
  isGameStarted = false;
  isPaused = false;
  updateScoreboard();
  showOverlay("游戏结束", `本局得分 ${player.score}，点击重新开始再来一局。`);
}

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  if (isGameStarted && !isPaused && !isGameOver) {
    dropCounter += deltaTime;
    if (dropCounter > getDropInterval()) {
      playerDrop();
    }
  }

  drawBoard();
  animationFrameId = requestAnimationFrame(update);
}

function handleAction(action) {
  switch (action) {
    case "left":
      playerMove(-1);
      break;
    case "right":
      playerMove(1);
      break;
    case "down":
      playerDrop();
      break;
    case "rotate-left":
      playerRotate(-1);
      break;
    case "rotate-right":
      playerRotate(1);
      break;
    case "drop":
      hardDrop();
      break;
    default:
      break;
  }
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const controlKeys = ["arrowleft", "arrowright", "arrowdown", "arrowup", " ", "x", "z", "p"];

  if (controlKeys.includes(key)) {
    event.preventDefault();
  }

  if (key === "p") {
    pauseGame();
    return;
  }

  if (!isGameStarted || isPaused || isGameOver) {
    return;
  }

  if (key === "arrowleft") {
    playerMove(-1);
  } else if (key === "arrowright") {
    playerMove(1);
  } else if (key === "arrowdown") {
    playerDrop();
  } else if (key === "arrowup" || key === "x") {
    playerRotate(1);
  } else if (key === "z") {
    playerRotate(-1);
  } else if (key === " ") {
    hardDrop();
  }
});

touchControls.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }
  handleAction(button.dataset.action);
});

startButton.addEventListener("click", () => startGame(false));
pauseButton.addEventListener("click", pauseGame);
restartButton.addEventListener("click", () => startGame(true));

showOverlay("按开始进入游戏", "支持键盘和屏幕按钮操作。");
drawBoard();
drawNextPiece();
