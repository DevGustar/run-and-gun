/* =============================================
   RUN & GUN – script.js
   Jogo 2D estilo survival / run-and-gun
   Inspirado em Shoot Many Robots
   ============================================= */

// ─── Canvas & Contexto ───────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;   // 800
const H = canvas.height;  // 450

// ─── Constantes de layout ────────────────────
const GROUND_Y = H - 60;   // Topo do chão
const GROUND_H = 60;       // Altura do chão
const PLAYER_W = 28;
const PLAYER_H = 48;
const BULLET_W = 14;
const BULLET_H = 6;
const ENEMY_W = 34;
const ENEMY_H = 44;

// ─── Estado global do jogo ───────────────────
let score = 0;
let gameOver = false;
let isPaused = false;
let frameCount = 0;

// Temporizador para spawn de inimigos
let spawnTimer = 0;
let spawnInterval = 120; // frames entre spawns (diminui com tempo)

// ─── Objeto Jogador ───────────────────────────
// Representa o personagem controlado pelo usuário.
let player = {};

function initPlayer() {
  player = {
    x: 80,
    y: GROUND_Y - PLAYER_H,
    prevY: GROUND_Y - PLAYER_H, // y do frame anterior (para colisão direcional)
    vx: 0,
    vy: 0,
    speed: 4.5,
    gravity: 0.55,
    jumpPower: -13,
    onGround: true,
    jumpsLeft: 2,
    hp: 5,
    maxHp: 5,
    invFrames: 0,
  };
}

// ─── Array de Projéteis do Jogador ─────────────
let bullets = [];

// ─── Array de Projéteis dos Inimigos ────────────
let enemyBullets = [];

// ─── Array de Inimigos ───────────────────────
let enemies = [];

// ─── Partículas (efeito visual de explosão) ───
let particles = [];

// ─── Estado de disparo do jogador ───────────────
// Timestamp do último disparo (ms). Usado para o cooldown de 30ms.
let shootLastTime = 0;
// Flag: evita que segurar L dispare múltiplos tiros.
let lKeyHeld = false;

// ─── Teclas pressionadas ─────────────────────
const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;

  // Pulo: W ou Espaço
  if ((e.key.toLowerCase() === 'w' || e.key === ' ') && !gameOver) {
    tryJump();
    e.preventDefault(); // impede scroll de página com Espaço
  }

  // Disparo: só dispara ao PRESSIONAR (não ao segurar)
  // e respeita o cooldown mínimo de 30ms entre tiros
  if (e.key.toLowerCase() === 'l' && !gameOver && !lKeyHeld) {
    const now = Date.now();
    if (now - shootLastTime >= 100) {
      shootBullet();
      shootLastTime = now;
    }
    lKeyHeld = true; // marca como segurado para evitar repeat
  }

  // Reiniciar
  if (e.key.toLowerCase() === 'r' && gameOver) {
    resetGame();
  }

  // Pausar: P
  if (e.key.toLowerCase() === 'p' && !gameOver) {
    isPaused = !isPaused;
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;

  // Libera o flag de segurar L ao soltar a tecla
  if (e.key.toLowerCase() === 'l') {
    lKeyHeld = false;
  }
});

// ─── Função de Pulo ───────────────────────────
function tryJump() {
  if (player.jumpsLeft > 0) {
    player.vy = player.jumpPower;
    player.onGround = false;
    player.jumpsLeft--;
  }
}

function spawnEnemy() {
  const speedBonus = Math.min(frameCount / 3000, 2.2);
  const speed = 1.2 + Math.random() * 0.8 + speedBonus;
  const shootRate = 60;

  const rand = Math.random();
  let type = 'normal';
  if (rand < 0.2) type = 'spiky';
  else if (rand < 0.3) type = 'bumper';

  enemies.push({
    x: W + 10,
    y: GROUND_Y - ENEMY_H,
    vx: -speed,
    hp: 1,
    w: ENEMY_W,
    h: ENEMY_H,
    shootTimer: Math.floor(Math.random() * shootRate),
    shootRate: shootRate,
    hasShot: false,
    type: type,
  });
}

// ─── Atualizar Jogador ────────────────────────
function updatePlayer() {
  // Movimento horizontal (A/D)
  if (keys['a']) player.vx = -player.speed;
  else if (keys['d']) player.vx = player.speed;
  else player.vx = 0;

  // (disparo tratado no evento keydown — não aqui)

  // Salva Y antes da física para detectar direção de colisão no próximo tick
  player.prevY = player.y;

  // Aplicar física
  player.vy += player.gravity;
  player.x += player.vx;
  player.y += player.vy;

  // Colisão com o chão
  if (player.y + PLAYER_H >= GROUND_Y) {
    player.y = GROUND_Y - PLAYER_H;
    player.vy = 0;
    player.onGround = true;
    player.jumpsLeft = 2; // restaura pulo duplo ao tocar o chão
  } else {
    player.onGround = false;
  }

  // Impedir saída horizontal da tela
  player.x = Math.max(0, Math.min(W - PLAYER_W, player.x));

  // Reduzir frames de invencibilidade
  if (player.invFrames > 0) player.invFrames--;
}

// ─── Criar Projétil ───────────────────────────
function shootBullet() {
  bullets.push({
    x: player.x + PLAYER_W,
    y: player.y + PLAYER_H / 2 - BULLET_H / 2,
    vx: 11,
    w: BULLET_W,
    h: BULLET_H,
  });
}

// ─── Atualizar Projéteis do Jogador ──────────────
function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].x += bullets[i].vx;

    // Remove projétil fora da tela (direita)
    if (bullets[i].x > W + BULLET_W) {
      bullets.splice(i, 1);
    }
  }
}

// ─── Atualizar Projéteis dos Inimigos ────────────
function updateEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    enemyBullets[i].x += enemyBullets[i].vx;

    // Remove projétil fora da tela (esquerda)
    if (enemyBullets[i].x < -BULLET_W - 4) {
      enemyBullets.splice(i, 1);
    }
  }
}

// ─── Atirar projétil de inimigo ──────────────────
function enemyShoot(enemy) {
  enemyBullets.push({
    x: enemy.x,                         // saindo do lado esquerdo do inimigo
    y: enemy.y + enemy.h / 2 - BULLET_H / 2,
    vx: -5,                              // voa para a esquerda em direção ao jogador
    w: BULLET_W,
    h: BULLET_H,
  });
}

// ─── Atualizar Inimigos ───────────────────────
function updateEnemies() {
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.x += e.vx;

    // Lógica de disparo: apenas inimigos 'normal' atiram uma vez
    if (e.type === 'normal') {
      e.shootTimer++;
      if (e.shootTimer >= e.shootRate && !e.hasShot) {
        e.shootTimer = 0;
        e.hasShot = true;
        if (e.x < W && e.x > 0) {
          enemyShoot(e);
        }
      }
    }

    // Remove inimigos muito à esquerda (saíram da tela)
    if (e.x < -ENEMY_W - 10) {
      enemies.splice(i, 1);
    }
  }
}

// ─── Spawn com temporizador ───────────────────
function handleSpawn() {
  spawnTimer++;

  if (spawnTimer >= spawnInterval) {
    spawnEnemy();
    spawnTimer = 0;

    // Diminui progressivamente o intervalo (mínimo 35 frames)
    spawnInterval = Math.max(35, spawnInterval - 1.5);
  }
}

// ─── Colisão AABB (Bounding Box) ─────────────
function aabb(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

// ─── Detectar Colisões ────────────────────────
function detectCollisions() {
  const playerBox = { x: player.x, y: player.y, w: PLAYER_W, h: PLAYER_H };

  // 1. Projétil do jogador vs Inimigo
  for (let bi = bullets.length - 1; bi >= 0; bi--) {
    for (let ei = enemies.length - 1; ei >= 0; ei--) {
      if (aabb(bullets[bi], enemies[ei])) {
        // Explodir inimigo
        spawnParticles(
          enemies[ei].x + enemies[ei].w / 2,
          enemies[ei].y + enemies[ei].h / 2,
          '#ff4444'
        );
        enemies.splice(ei, 1);
        bullets.splice(bi, 1);
        score += 10;
        break;
      }
    }
  }

  // 2. Projétil do inimigo vs Jogador
  for (let bi = enemyBullets.length - 1; bi >= 0; bi--) {
    if (aabb(enemyBullets[bi], playerBox) && player.invFrames <= 0) {
      spawnParticles(
        player.x + PLAYER_W / 2,
        player.y + PLAYER_H / 2,
        '#ff6600'
      );
      player.hp--;
      player.invFrames = 60; // ~1s de invencibilidade
      enemyBullets.splice(bi, 1);

      if (player.hp <= 0) {
        gameOver = true;
      }
    }
  }

  // 3. Inimigo vs Jogador — colisão DIRECIONAL
  //    Topo do inimigo = plataforma sólida (sem dano, restaura pulos)
  //    Lados do inimigo = dano normal
  for (let ei = enemies.length - 1; ei >= 0; ei--) {
    const e = enemies[ei];
    if (!aabb(playerBox, e)) continue;

    // prevBottom: borda inferior do jogador no frame ANTERIOR
    const prevBottom = player.prevY + PLAYER_H;

    // É pouso no topo se o jogador estava acima (ou quase) do topo do inimigo
    // e está caindo (vy >= 0)
    const landedOnTop = prevBottom <= e.y + 6 && player.vy >= 0;

    if (landedOnTop) {
      if (e.type === 'spiky') {
        spawnParticles(player.x + PLAYER_W / 2, player.y + PLAYER_H / 2, '#ff0000');
        player.hp = 0;
        gameOver = true;
      } else if (e.type === 'bumper') {
        // Salto vertical ao bater na cabeça
        player.y = e.y - PLAYER_H;
        player.vy = -20;
        player.vx = 0;
        player.onGround = false;
        player.jumpsLeft = 1;
      } else {
        player.y = e.y - PLAYER_H;
        player.vy = 0;
        player.onGround = true;
        player.jumpsLeft = 2;
      }
    } else if (player.invFrames <= 0) {
      if (e.type === 'bumper') {
        // Impulso forte para a direita
        player.x += 10;
        player.vx = 14;
        player.vy = -8;
        player.onGround = false;
        player.jumpsLeft = 1;
      } else {
        spawnParticles(player.x + PLAYER_W / 2, player.y + PLAYER_H / 2, '#ffaa00');
        player.hp--;
        player.invFrames = 80;
        enemies[ei].vx *= 3;
        if (player.hp <= 0) gameOver = true;
      }
    }
  }
}

// ─── Partículas de Explosão ───────────────────
function spawnParticles(cx, cy, color) {
  const count = 8;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const speed = 2 + Math.random() * 3;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 1,
      life: 1.0,      // de 1 a 0
      decay: 0.035 + Math.random() * 0.025,
      r: 3 + Math.random() * 3,
      color: color,
    });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15; // gravidade leve
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

// ─── Renderizar Jogador ───────────────────────
function drawPlayer() {
  // Piscar quando invencível
  if (player.invFrames > 0 && Math.floor(player.invFrames / 5) % 2 === 0) return;

  const x = Math.round(player.x);
  const y = Math.round(player.y);

  // Sombra no chão
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(x + PLAYER_W / 2, GROUND_Y + 4, PLAYER_W / 2 + 2, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Corpo (azul vibrante)
  ctx.fillStyle = '#4499ff';
  ctx.fillRect(x, y + 10, PLAYER_W, PLAYER_H - 10);

  // Cabeça (mais clara)
  ctx.fillStyle = '#88ccff';
  ctx.fillRect(x + 3, y, PLAYER_W - 6, 14);

  // Olho (piscada de robô)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + 14, y + 4, 5, 5);
  ctx.fillStyle = '#00aaff';
  ctx.fillRect(x + 16, y + 5, 3, 3);

  // Arma no lado direito
  ctx.fillStyle = '#aaaaaa';
  ctx.fillRect(x + PLAYER_W, y + 22, 10, 5);
}

// ─── Renderizar Projéteis do Jogador ─────────────
function drawBullets() {
  for (const b of bullets) {
    // Brilho ao redor
    ctx.shadowColor = '#ffee44';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffe844';
    ctx.fillRect(Math.round(b.x), Math.round(b.y), b.w, b.h);
    ctx.shadowBlur = 0;
  }
}

// ─── Renderizar Projéteis dos Inimigos ───────────
function drawEnemyBullets() {
  for (const b of enemyBullets) {
    // Cor laranja/vermelha para diferenciar dos tiros do jogador
    ctx.shadowColor = '#ff4400';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ff6622';
    ctx.fillRect(Math.round(b.x), Math.round(b.y), b.w, b.h);
    ctx.shadowBlur = 0;
  }
}

// ─── Renderizar Inimigos ──────────────────────
function drawEnemies() {
  for (const e of enemies) {
    const x = Math.round(e.x);
    const y = Math.round(e.y);

    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(x + ENEMY_W / 2, GROUND_Y + 4, ENEMY_W / 2 + 2, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Corpo (vermelho)
    ctx.fillStyle = '#cc2222';
    ctx.fillRect(x, y + 12, ENEMY_W, ENEMY_H - 12);

    // Cabeça
    if (e.type === 'bumper') {
      ctx.fillStyle = '#00ff44';
    } else {
      ctx.fillStyle = e.type === 'spiky' ? '#990000' : '#ff4444';
    }
    ctx.fillRect(x + 4, y, ENEMY_W - 8, 16);

    // Espinhos (se for tipo spiky)
    if (e.type === 'spiky') {
      ctx.fillStyle = '#cccccc';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const sx = x + 6 + i * 8;
        ctx.moveTo(sx, y);
        ctx.lineTo(sx + 4, y - 8);
        ctx.lineTo(sx + 8, y);
        ctx.fill();
      }
    }

    // Detalhes Bumper
    if (e.type === 'bumper') {
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(x + 6, y + 2, ENEMY_W - 12, 12);
    }

    // Olhos vermelhos ameaçadores
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(x + 6, y + 4, 6, 5);
    ctx.fillRect(x + 20, y + 4, 6, 5);

    // Pupila
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 8, y + 5, 3, 3);
    ctx.fillRect(x + 22, y + 5, 3, 3);
  }
}

// ─── Renderizar Partículas ────────────────────
function drawParticles() {
  for (const p of particles) {
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ─── Renderizar HUD ───────────────────────────
function drawHUD() {
  // Fundo semi-transparente do HUD
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, W, 36);

  // Score
  ctx.fillStyle = '#ffee44';
  ctx.font = 'bold 18px "Courier New", monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 14, 24);
  if (isPaused) {
    ctx.fillStyle = '#ffffff';
    ctx.fillText(' - PAUSADO', 120, 24);
  }

  // Vida (coraçõezinhos / blocos)
  ctx.fillStyle = '#00ffcc';
  ctx.fillText('HP:', W / 2 - 60, 24);

  for (let i = 0; i < player.maxHp; i++) {
    const filled = i < player.hp;
    ctx.fillStyle = filled ? '#ff3355' : '#333355';
    ctx.fillRect(W / 2 - 30 + i * 26, 8, 20, 18);
    if (filled) {
      ctx.fillStyle = '#ff88aa';
      ctx.fillRect(W / 2 - 30 + i * 26 + 4, 10, 8, 6);
    }
  }

  // Tempo (highscore proxy) à direita
  const secs = Math.floor(frameCount / 60);
  ctx.fillStyle = '#aaaaee';
  ctx.textAlign = 'right';
  ctx.fillText(`TIME: ${secs}s`, W - 14, 24);
  ctx.textAlign = 'left';
}

// ─── Renderizar Chão e Fundo ──────────────────
function drawBackground() {
  // Fundo escuro
  ctx.fillStyle = '#111118';
  ctx.fillRect(0, 0, W, H);

  // Grade de pontos de fundo (estilo cyberpunk leve)
  ctx.fillStyle = 'rgba(80, 60, 140, 0.18)';
  const gridSize = 40;
  for (let gx = 0; gx < W; gx += gridSize) {
    for (let gy = 36; gy < GROUND_Y; gy += gridSize) {
      ctx.fillRect(gx, gy, 1, 1);
    }
  }

  // Linhas de scan horizontais sutis
  for (let sy = 36; sy < GROUND_Y; sy += 4) {
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(0, sy, W, 2);
  }

  // Plataforma / Chão
  ctx.fillStyle = '#1e2240';
  ctx.fillRect(0, GROUND_Y, W, GROUND_H);

  // Linha no topo do chão (borda neon)
  ctx.strokeStyle = '#5533ff';
  ctx.lineWidth = 2;
  ctx.shadowColor = '#5533ff';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(W, GROUND_Y);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 1;

  // Detalhe de "tijolos" no chão
  ctx.strokeStyle = 'rgba(80,60,200,0.2)';
  for (let bx = 0; bx < W; bx += 50) {
    ctx.beginPath();
    ctx.moveTo(bx, GROUND_Y);
    ctx.lineTo(bx, GROUND_Y + GROUND_H);
    ctx.stroke();
  }
}

// ─── Tela de Game Over ────────────────────────
function drawGameOver() {
  // Overlay escuro
  ctx.fillStyle = 'rgba(0,0,0,0.72)';
  ctx.fillRect(0, 0, W, H);

  // Título GAME OVER
  ctx.fillStyle = '#ff3355';
  ctx.font = 'bold 64px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#ff0033';
  ctx.shadowBlur = 20;
  ctx.fillText('GAME OVER', W / 2, H / 2 - 60);
  ctx.shadowBlur = 0;

  // Pontuação final
  ctx.fillStyle = '#ffee44';
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillText(`Pontuação: ${score}`, W / 2, H / 2 - 10);

  // Instrução de reinício
  const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 350);
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#88ccff';
  ctx.font = '22px "Courier New", monospace';
  ctx.fillText('Pressione  R  para reiniciar', W / 2, H / 2 + 40);
  ctx.globalAlpha = 1;

  ctx.textAlign = 'left';
}

// ─── Tela inicial (primeiros frames) ─────────
function drawStartOverlay() {
  if (frameCount > 180) return; // desaparece após 3s

  const alpha = Math.max(0, 1 - frameCount / 120);
  ctx.globalAlpha = alpha;

  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.textAlign = 'center';

  const lines = [
    '🎮  RUN & GUN',
    '',
    'A / D → Mover      W / Espaço → Pular',
    'L → Atirar         R → Reiniciar',
    'P → Pausar',
    '',
    'Pulo duplo disponível!',
  ];

  lines.forEach((line, i) => {
    ctx.fillText(line, W / 2, H / 2 - 60 + i * 30);
  });

  ctx.textAlign = 'left';
  ctx.globalAlpha = 1;
}

// ─── Resetar Jogo ─────────────────────────────
function resetGame() {
  score = 0;
  frameCount = 0;
  gameOver = false;
  bullets = [];
  enemyBullets = [];
  enemies = [];
  particles = [];
  spawnTimer = 0;
  spawnInterval = 120;
  shootLastTime = 0;
  lKeyHeld = false;
  initPlayer();
}

// ─── Game Loop Principal ──────────────────────
function gameLoop() {
  requestAnimationFrame(gameLoop);

  if (!gameOver && !isPaused) {
    frameCount++;

    // 1. Atualizar física e entidades
    updatePlayer();
    updateBullets();
    updateEnemyBullets();
    updateEnemies();
    updateParticles();

    // 2. Spawn de inimigos
    handleSpawn();

    // 3. Detectar colisões
    detectCollisions();
  }

  // 4. Renderizar tudo
  drawBackground();
  drawParticles();
  drawBullets();
  drawEnemyBullets();
  drawPlayer();
  drawEnemies();
  drawHUD();
  drawStartOverlay();

  if (gameOver) {
    drawGameOver();
  }
}

// ─── Inicializar e Iniciar ────────────────────
initPlayer();
gameLoop();
