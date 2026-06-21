/* Lógica do jogo — drag por pointer events (funciona em mouse e touch). */

const G = window.GAME;
let points = 0;
let errors = 0;
let timeLeft = G.duration;
let timer = null;

const $ = (id) => document.getElementById(id);
const show = (id) => $(id).classList.remove("hide");
const hide = (id) => $(id).classList.add("hide");

/* ---------- Fluxo de telas ---------- */
function startCountdown() {
  points = 0; errors = 0; timeLeft = G.duration;
  $("points").textContent = 0;
  $("errors").textContent = 0;
  $("time").textContent = G.duration;
  hide("start"); hide("end"); hide("board-game");
  shuffleTray();
  resetBoard();
  show("prepare");

  let n = 3;
  const cd = $("countdown");
  cd.classList.remove("go");
  cd.textContent = n;
  const tick = setInterval(() => {
    n--;
    if (n === 0) { cd.classList.add("go"); cd.textContent = "Valendo!"; }
    else if (n < 0) { clearInterval(tick); hide("prepare"); startGame(); }
    else { cd.textContent = n; }
  }, 1000);
}

function startGame() {
  show("board-game");
  timer = setInterval(() => {
    timeLeft--;
    $("time").textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function endGame() {
  clearInterval(timer);
  const score = points + Math.max(timeLeft, 0) - errors;
  hide("board-game");
  $("score-show").textContent = `${score} pts`;
  show("end");

  const recordEl = $("record");
  if (score > Number(recordEl.textContent)) recordEl.textContent = score;
  if (typeof confettiBurst === "function") confettiBurst();
  saveScore(G.themeId, points, errors, Math.max(timeLeft, 0));
}

/* ---------- Tabuleiro ---------- */
function shuffleTray() {
  const tray = $("items");
  const chips = [...tray.children];
  for (let i = chips.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    tray.appendChild(chips[j]);
    chips.splice(j, 1);
  }
}

function resetBoard() {
  document.querySelectorAll(".category .drops").forEach((d) => (d.innerHTML = ""));
  document.querySelectorAll(".chip").forEach((c) => {
    c.classList.remove("placed", "dragging");
    c.style.cssText = "";
  });
}

/* ---------- Drag por pointer ---------- */
let drag = null;

function onPointerDown(e) {
  const chip = e.target.closest(".chip");
  if (!chip || chip.classList.contains("placed")) return;
  e.preventDefault();
  const rect = chip.getBoundingClientRect();
  drag = {
    chip,
    offX: e.clientX - rect.left,
    offY: e.clientY - rect.top,
    w: rect.width,
    h: rect.height,
  };
  chip.classList.add("dragging");
  chip.style.width = rect.width + "px";
  moveChip(e.clientX, e.clientY);
  chip.setPointerCapture(e.pointerId);
}

function moveChip(x, y) {
  drag.chip.style.left = x - drag.offX + "px";
  drag.chip.style.top = y - drag.offY + "px";
}

function onPointerMove(e) {
  if (!drag) return;
  moveChip(e.clientX, e.clientY);
  const cat = categoryAt(e.clientX, e.clientY);
  document.querySelectorAll(".category.hovered").forEach((c) => c.classList.remove("hovered"));
  if (cat) cat.classList.add("hovered");
}

function onPointerUp(e) {
  if (!drag) return;
  const { chip } = drag;
  const cat = categoryAt(e.clientX, e.clientY);
  document.querySelectorAll(".category.hovered").forEach((c) => c.classList.remove("hovered"));

  if (cat && cat.dataset.name === chip.dataset.category) {
    placeChip(chip, cat);
  } else {
    if (cat) { cat.classList.add("wrong"); setTimeout(() => cat.classList.remove("wrong"), 350); }
    errors++;
    $("errors").textContent = errors;
    chip.classList.remove("dragging");
    chip.style.cssText = "";
  }
  drag = null;
}

function categoryAt(x, y) {
  const el = document.elementFromPoint(x, y);
  return el ? el.closest(".category") : null;
}

function placeChip(chip, cat) {
  chip.classList.add("placed");
  const tag = document.createElement("span");
  tag.className = "solved";
  tag.textContent = chip.dataset.name;
  cat.querySelector(".drops").appendChild(tag);
  chip.remove();
  points++;
  $("points").textContent = points;
  if (points >= G.itemsCount) endGame();
}

/* ---------- Listeners ---------- */
const tray = $("items");
tray.addEventListener("pointerdown", onPointerDown);
tray.addEventListener("pointermove", onPointerMove);
tray.addEventListener("pointerup", onPointerUp);
tray.addEventListener("pointercancel", onPointerUp);

$("start-game").addEventListener("click", startCountdown);
$("play-again").addEventListener("click", startCountdown);

$("confirm-delete")?.addEventListener("click", async () => {
  const res = await deleteTheme(G.themeId);
  if (res.success) { toast(res.success); setTimeout(() => (window.location.href = "/"), 600); }
  else toast(res.error || "Erro ao remover.", "error");
});
