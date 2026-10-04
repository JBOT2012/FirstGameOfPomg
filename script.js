const canvas = document.getElementById('gameCanvas');
const playerScoreEl = document.getElementById('playerScore');
const computerScoreEl = document.getElementById('computerScore');

const app = new PIXI.Application({
  view: canvas,
  width: canvas.width,
  height: canvas.height,
  background: 0x000000,
  antialias: true,
  resolution: window.devicePixelRatio || 1,
});

const COURT_WIDTH = app.screen.width;
const COURT_HEIGHT = app.screen.height;

const PADDLE_WIDTH = 42;
const PADDLE_HEIGHT = 146;
const PADDLE_OFFSET = 48;
const BALL_RADIUS = 14;
const PADDLE_SPEED = 8;
const COMPUTER_SPEED = 7.5;
const WINNING_SCORE = 7;

const background = new PIXI.Graphics();
const centerLine = new PIXI.Graphics();
const ballGraphic = new PIXI.Graphics();
const playerFallback = new PIXI.Graphics();
const computerFallback = new PIXI.Graphics();
const playerRacket = new PIXI.Sprite(PIXI.Texture.WHITE);
const computerRacket = new PIXI.Sprite(PIXI.Texture.WHITE);

const state = {
  playerY: COURT_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  computerY: COURT_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  ballX: COURT_WIDTH / 2,
  ballY: COURT_HEIGHT / 2,
  ballVX: 5,
  ballVY: 3,
  playerScore: 0,
  computerScore: 0,
  keys: {
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false,
  },
};

function drawBackground() {
  background.clear();
  background.beginFill(0x000000);
  background.drawRect(0, 0, COURT_WIDTH, COURT_HEIGHT);
  background.endFill();

  centerLine.clear();
  centerLine.beginFill(0xffffff);
  for (let y = 12; y < COURT_HEIGHT; y += 34) {
    centerLine.drawRect(COURT_WIDTH / 2 - 2, y, 4, 20);
  }
  centerLine.endFill();
}

function createRacketTexture(image, sourceX, sourceY, sourceWidth, sourceHeight) {
  const crop = document.createElement('canvas');
  crop.width = sourceWidth;
  crop.height = sourceHeight;

  const context = crop.getContext('2d', { willReadFrequently: true });
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

  const pixels = context.getImageData(0, 0, sourceWidth, sourceHeight);
  for (let index = 0; index < pixels.data.length; index += 4) {
    const red = pixels.data[index];
    const green = pixels.data[index + 1];
    const blue = pixels.data[index + 2];
    if (green > 90 && green > red * 1.2 && green > blue * 1.08) {
      pixels.data[index + 3] = 0;
    }
  }
  context.putImageData(pixels, 0, 0);

  return PIXI.Texture.from(crop);
}

function loadRacketTextures() {
  const image = new Image();
  image.onload = () => {
    const leftTexture = createRacketTexture(image, 200, 195, 310, 682);
    const rightTexture = createRacketTexture(image, 667, 195, 312, 682);

    playerRacket.texture = leftTexture;
    computerRacket.texture = rightTexture;
    playerRacket.width = PADDLE_WIDTH * 1.4;
    playerRacket.height = PADDLE_HEIGHT;
    computerRacket.width = PADDLE_WIDTH * 1.4;
    computerRacket.height = PADDLE_HEIGHT;
    playerRacket.visible = true;
    computerRacket.visible = true;
    playerFallback.visible = false;
    computerFallback.visible = false;
  };
  image.onerror = () => console.error('Unable to load images/Rackets.png');
  image.src = 'images/Rackets.png';
}

function updateScoreboard() {
  playerScoreEl.textContent = String(state.playerScore);
  computerScoreEl.textContent = String(state.computerScore);
}

function resetBall(direction = 1) {
  state.ballX = COURT_WIDTH / 2;
  state.ballY = COURT_HEIGHT / 2;

  const angle = (Math.random() * 1.2 - 0.6);
  const speed = 5.5;

  state.ballVX = direction * speed * Math.cos(angle);
  state.ballVY = speed * Math.sin(angle);
}

function updatePlayerPaddle() {
  if (state.keys.w || state.keys.ArrowUp) {
    state.playerY -= PADDLE_SPEED;
  }

  if (state.keys.s || state.keys.ArrowDown) {
    state.playerY += PADDLE_SPEED;
  }

  state.playerY = Math.max(0, Math.min(COURT_HEIGHT - PADDLE_HEIGHT, state.playerY));
}

function updateComputerPaddle() {
  const targetCenter = state.computerY + PADDLE_HEIGHT / 2;
  const ballCenter = state.ballY;

  if (ballCenter > targetCenter) {
    state.computerY += COMPUTER_SPEED;
  } else if (ballCenter < targetCenter) {
    state.computerY -= COMPUTER_SPEED;
  }

  state.computerY = Math.max(0, Math.min(COURT_HEIGHT - PADDLE_HEIGHT, state.computerY));
}

function updateBall() {
  state.ballX += state.ballVX;
  state.ballY += state.ballVY;

  if (state.ballY <= BALL_RADIUS || state.ballY >= COURT_HEIGHT - BALL_RADIUS) {
    state.ballVY *= -1;
    state.ballY = Math.max(BALL_RADIUS, Math.min(COURT_HEIGHT - BALL_RADIUS, state.ballY));
  }

  const leftX = PADDLE_OFFSET;
  const rightX = COURT_WIDTH - PADDLE_OFFSET - PADDLE_WIDTH;

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

  if (state.ballX > COURT_WIDTH + 20) {
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

function buildScene() {
  drawBackground();

  playerFallback.beginFill(0xff4545);
  playerFallback.drawRoundedRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT, 8);
  playerFallback.endFill();
  computerFallback.beginFill(0x55aaff);
  computerFallback.drawRoundedRect(0, 0, PADDLE_WIDTH, PADDLE_HEIGHT, 8);
  computerFallback.endFill();

  playerFallback.x = PADDLE_OFFSET;
  playerFallback.y = state.playerY;
  computerFallback.x = COURT_WIDTH - PADDLE_OFFSET - PADDLE_WIDTH;
  computerFallback.y = state.computerY;

  playerRacket.anchor.set(0.5);
  playerRacket.width = PADDLE_WIDTH * 1.4;
  playerRacket.height = PADDLE_HEIGHT;
  playerRacket.visible = false;
  playerRacket.x = PADDLE_OFFSET + PADDLE_WIDTH / 2;
  playerRacket.y = state.playerY + PADDLE_HEIGHT / 2;

  computerRacket.anchor.set(0.5);
  computerRacket.width = PADDLE_WIDTH * 1.4;
  computerRacket.height = PADDLE_HEIGHT;
  computerRacket.visible = false;
  computerRacket.x = COURT_WIDTH - PADDLE_OFFSET - computerRacket.width / 2;
  computerRacket.y = state.computerY + PADDLE_HEIGHT / 2;

  ballGraphic.clear();
  ballGraphic.beginFill(0xffffff);
  ballGraphic.drawCircle(0, 0, BALL_RADIUS);
  ballGraphic.endFill();
  ballGraphic.x = state.ballX;
  ballGraphic.y = state.ballY;

  app.stage.addChild(
    background,
    centerLine,
    playerFallback,
    computerFallback,
    playerRacket,
    computerRacket,
    ballGraphic
  );
}

function tick() {
  updatePlayerPaddle();
  updateComputerPaddle();
  updateBall();

  playerRacket.x = PADDLE_OFFSET + PADDLE_WIDTH / 2;
  playerRacket.y = state.playerY + PADDLE_HEIGHT / 2;
  computerRacket.x = COURT_WIDTH - PADDLE_OFFSET - computerRacket.width / 2;
  computerRacket.y = state.computerY + PADDLE_HEIGHT / 2;
  playerFallback.y = state.playerY;
  computerFallback.y = state.computerY;
  ballGraphic.x = state.ballX;
  ballGraphic.y = state.ballY;
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

buildScene();
loadRacketTextures();
updateScoreboard();
resetBall(Math.random() < 0.5 ? -1 : 1);
app.ticker.add(() => tick());
