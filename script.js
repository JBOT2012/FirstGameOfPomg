const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

const PADDLE_WIDTH = 14;
const PADDLE_HEIGHT = 110;
const PADDLE_OFFSET = 32;
const BALL_RADIUS = 10;
const PADDLE_SPEED = 6;
const COMPUTER_SPEED = 5.2;
const WINNING_SCORE = 7;

const state = {
  playerY: canvas.height / 2 - PADDLE_HEIGHT / 2,
  computerY: canvas.height / 2 - PADDLE_HEIGHT / 2,
  ballX: canvas.width / 2,
  ballY: canvas.height / 2,
  ballVX: 5,
  ballVY: 3,
  playerScore: 0,
  computerScore: 0,
  lastTime: 0,
  keys: {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false,
  },
};

function resetBall(direction = 1) {
  state.ballX = canvas.width / 2;
  state.ballY = canvas.height / 2;

  const angle = (Math.random() * 1.2 - 0.6);
  const speed = 5.5;

  state.ballVX = direction * speed * Math.cos(angle);
  state.ballVY = speed * Math.sin(angle);
}

function updateScoreboard() {
  playerScoreEl.textContent = String(state.playerScore);
  computerScoreEl.textContent = String(state.computerScore);
}

function updatePlayerPaddle() {
  if (state.keys.w || state.keys.ArrowUp) {
    state.playerY -= PADDLE_SPEED;
  }

  if (state.keys.s || state.keys.ArrowDown) {
    state.playerY += PADDLE_SPEED;
  }

  state.playerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, state.playerY));
}

function updateComputerPaddle() {
  const targetCenter = state.computerY + PADDLE_HEIGHT / 2;
  const ballCenter = state.ballY;

  if (ballCenter > targetCenter) {
    state.computerY += COMPUTER_SPEED;
  } else if (ballCenter < targetCenter) {
    state.computerY -= COMPUTER_SPEED;
  }

  state.computerY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, state.computerY));
}

function updateBall() {
  state.ballX += state.ballVX;
  state.ballY += state.ballVY;

  if (state.ballY <= BALL_RADIUS || state.ballY >= canvas.height - BALL_RADIUS) {
    state.ballVY *= -1;
    state.ballY = Math.max(BALL_RADIUS, Math.min(canvas.height - BALL_RADIUS, state.ballY));
  }

  const leftX = PADDLE_OFFSET;
  const rightX = canvas.width - PADDLE_OFFSET - PADDLE_WIDTH;

  const hitsLeftPaddle =
    state.ballX - BALL_RADIUS <= leftX + PADDLE_WIDTH &&
    state.ballX + BALL_RADIUS >= leftX &&
    state.ballY >= state.playerY &&
    state.ballY <= state.playerY + PADDLE_HEIGHT &&
    state.ballVX < 0;

  const hitsRightPaddle =
    state.ballX + BALL_RADIUS >= rightX &&
    state.ballX - BALL_RADIUS <= rightX + PADDLE_WIDTH &&
    state.ballY >= state.computerY &&
    state.ballY <= state.computerY + PADDLE_HEIGHT &&
    state.ballVX > 0;

  if (hitsLeftPaddle || hitsRightPaddle) {
    const paddleY = hitsLeftPaddle ? state.playerY : state.computerY;
    const relativeIntersect = (state.ballY - (paddleY + PADDLE_HEIGHT / 2)) / (PADDLE_HEIGHT / 2);
    const bounceAngle = relativeIntersect * 1.1;
    const speed = Math.min(9.5, Math.hypot(state.ballVX, state.ballVY) + 0.4);

    state.ballVX = (hitsLeftPaddle ? 1 : -1) * speed * Math.cos(bounceAngle);
    state.ballVY = speed * Math.sin(bounceAngle);

    state.ballX = hitsLeftPaddle
      ? leftX + PADDLE_WIDTH + BALL_RADIUS
      : rightX - BALL_RADIUS;
  }

  if (state.ballX < -20) {
    state.computerScore += 1;
    updateScoreboard();
    resetBall(1);
  }

  if (state.ballX > canvas.width + 20) {
    state.playerScore += 1;
    updateScoreboard();
    resetBall(-1);
  }

  if (state.playerScore >= WINNING_SCORE || state.computerScore >= WINNING_SCORE) {
    state.playerScore = 0;
    state.computerScore = 0;
    updateScoreboard();
    resetBall(Math.random() < 0.5 ? -1 : 1);
  }
}

function drawCenterLine() {
  ctx.beginPath();
  ctx.setLineDash([16, 16]);
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(x, y) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, PADDLE_WIDTH, PADDLE_HEIGHT);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(state.ballX, state.ballY, BALL_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCenterLine();
  drawPaddle(PADDLE_OFFSET, state.playerY);
  drawPaddle(canvas.width - PADDLE_OFFSET - PADDLE_WIDTH, state.computerY);
  drawBall();
}

function gameLoop(timestamp) {
  const delta = (timestamp - state.lastTime) / 16.67 || 1;
  state.lastTime = timestamp;

  updatePlayerPaddle();
  updateComputerPaddle();
  updateBall();
  draw();

  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.key in state.keys) {
    state.keys[event.key] = true;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key in state.keys) {
    state.keys[event.key] = false;
  }
});

updateScoreboard();
resetBall(Math.random() < 0.5 ? -1 : 1);
requestAnimationFrame(gameLoop);
