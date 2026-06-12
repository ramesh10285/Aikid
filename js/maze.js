/* ===========================================================
   Maze Puzzles — a tiny block-coding interpreter for kids
   Teaches: sequencing, loops (repeat), conditionals (if)
   =========================================================== */

// ---- Level designs ---------------------------------------------------------
// Legend:  . = open   # = wall   S = start   G = goal (flag)
// "dir" is the robot's starting facing: 0=up 1=right 2=down 3=left
const LEVELS = [
  {
    name: "1 · Move",
    hint: "Just move forward! Add 3 ⬆️ Move blocks.",
    dir: 1,
    grid: [
      "#####",
      "#S..G",
      "#####",
    ],
  },
  {
    name: "2 · Turn",
    hint: "Move, then Turn, then move again to reach 🏁.",
    dir: 1,
    grid: [
      "#####",
      "#S.##",
      "##.##",
      "##.G#",
      "#####",
    ],
  },
  {
    name: "3 · Repeat",
    hint: "That is a long path! Use 🔁 Repeat so you don't add 5 Move blocks.",
    dir: 1,
    grid: [
      "#######",
      "#S....G",
      "#######",
    ],
  },
  {
    name: "4 · If Path",
    hint: "Use 🔁 Repeat with ⬆️ Move inside. The ❓ If block only moves when the path is open!",
    dir: 1,
    grid: [
      "#######",
      "#S...##",
      "####.##",
      "####.G#",
      "#######",
    ],
  },
  {
    name: "5 · Big Maze",
    hint: "Mix Repeat, Move and Turn to wind through the maze!",
    dir: 2,
    grid: [
      "#######",
      "#S#...#",
      "#.#.#.#",
      "#...#.#",
      "###.#.#",
      "#...#G#",
      "#######",
    ],
  },
];

// ---- State -----------------------------------------------------------------
let levelIndex = 0;
let program = [];            // nested array of block objects
let activeContainer = program; // where new blocks get added (for tap-to-nest)
let robot = { r: 0, c: 0, dir: 0 };
let goal = { r: 0, c: 0 };
let grid = [];
let running = false;
const done = new Set();      // completed level indices

const $ = (id) => document.getElementById(id);

// ---- Level loading ---------------------------------------------------------
function loadLevel(i) {
  levelIndex = i;
  const lvl = LEVELS[i];
  grid = lvl.grid.map((row) => row.split(""));
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === "S") { robot = { r, c, dir: lvl.dir }; grid[r][c] = "."; }
      if (grid[r][c] === "G") { goal = { r, c }; }
    }
  }
  program = [];
  activeContainer = program;
  renderPills();
  renderGrid();
  renderProgram();
  say(lvl.hint);
}

function renderPills() {
  const wrap = $("levelPills");
  wrap.innerHTML = "";
  LEVELS.forEach((lvl, i) => {
    const b = document.createElement("button");
    b.className = "pill" + (i === levelIndex ? " active" : "") + (done.has(i) ? " done" : "");
    b.textContent = lvl.name;
    b.onclick = () => { if (!running) loadLevel(i); };
    wrap.appendChild(b);
  });
}

function renderGrid() {
  const g = $("grid");
  const cols = grid[0].length;
  g.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  g.style.maxWidth = Math.min(cols * 64, 420) + "px";
  g.style.margin = "0 auto";
  g.innerHTML = "";
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      if (grid[r][c] === "#") cell.classList.add("wall");
      if (goal.r === r && goal.c === c) { cell.classList.add("goal"); cell.textContent = "🏁"; }
      if (robot.r === r && robot.c === c) {
        const rob = document.createElement("span");
        rob.className = "robot";
        rob.textContent = "🤖";
        const arrow = document.createElement("span");
        arrow.textContent = "▲";
        arrow.style.fontSize = "12px";
        arrow.style.position = "absolute";
        arrow.style.transform = `rotate(${robot.dir * 90}deg) translateY(-18px)`;
        cell.style.position = "relative";
        cell.appendChild(rob);
        cell.appendChild(arrow);
      }
      g.appendChild(cell);
    }
  }
}

// ---- Program rendering -----------------------------------------------------
function renderProgram() {
  const zone = $("program");
  zone.innerHTML = "";
  if (program.length === 0) {
    zone.innerHTML = '<div class="placeholder">Tap blocks to build here…</div>';
  } else {
    program.forEach((blk) => zone.appendChild(buildBlockEl(blk, program)));
  }
  highlightActive();
}

function buildBlockEl(blk, parentArr) {
  const el = document.createElement("div");
  el.className = "block program-block";
  el.dataset.type = blk.type;

  const label = { move: "⬆️ Move", left: "↪️ Turn Left", right: "↩️ Turn Right",
                  repeat: "🔁 Repeat", if: "❓ If Path Ahead" }[blk.type];
  const title = document.createElement("span");
  title.innerHTML = label;
  el.appendChild(title);

  // delete button
  const del = document.createElement("button");
  del.className = "del";
  del.textContent = "✕";
  del.onclick = (e) => {
    e.stopPropagation();
    const idx = parentArr.indexOf(blk);
    if (idx >= 0) parentArr.splice(idx, 1);
    if (activeContainer === blk.children) activeContainer = program;
    renderProgram();
  };
  el.appendChild(del);

  // repeat needs a counter
  if (blk.type === "repeat") {
    const step = document.createElement("span");
    step.className = "stepper repeat-count";
    const minus = document.createElement("button"); minus.textContent = "−";
    const num = document.createElement("b"); num.textContent = " " + blk.count + " ";
    const plus = document.createElement("button"); plus.textContent = "+";
    minus.onclick = (e) => { e.stopPropagation(); blk.count = Math.max(1, blk.count - 1); renderProgram(); };
    plus.onclick = (e) => { e.stopPropagation(); blk.count = Math.min(9, blk.count + 1); renderProgram(); };
    step.append(minus, num, plus);
    el.appendChild(step);
  }

  // repeat / if have a nested dropzone
  if (blk.type === "repeat" || blk.type === "if") {
    const nest = document.createElement("div");
    nest.className = "dropzone nested";
    nest._targetArray = blk.children;
    if (blk.children.length === 0) {
      nest.innerHTML = '<div class="placeholder">drop blocks inside</div>';
    } else {
      blk.children.forEach((c) => nest.appendChild(buildBlockEl(c, blk.children)));
    }
    enableDrop(nest);
    // tap the block body to make this the active spot for new blocks
    el.onclick = (e) => { e.stopPropagation(); activeContainer = blk.children; highlightActive(); };
    el.appendChild(nest);
  }

  // drag support (desktop)
  el.draggable = false;
  return el;
}

function highlightActive() {
  document.querySelectorAll(".dropzone").forEach((d) => (d.style.outline = ""));
  // find the dropzone whose _targetArray === activeContainer
  const all = [$("program"), ...document.querySelectorAll(".dropzone.nested")];
  all.forEach((d) => {
    const arr = d.id === "program" ? program : d._targetArray;
    if (arr === activeContainer) d.style.outline = "3px solid var(--green)";
  });
}

function newBlock(type) {
  const b = { type };
  if (type === "repeat") { b.count = 3; b.children = []; }
  if (type === "if") { b.children = []; }
  return b;
}

// ---- Adding blocks: tap + drag --------------------------------------------
function setupToolbox() {
  document.querySelectorAll(".block[data-type]").forEach((tb) => {
    // tap to add into the active container
    tb.addEventListener("click", () => {
      if (running) return;
      activeContainer.push(newBlock(tb.dataset.type));
      renderProgram();
    });
    // drag to nest
    tb.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/type", tb.dataset.type);
    });
  });
  enableDrop($("program"));
}

function enableDrop(zone) {
  zone.addEventListener("dragover", (e) => { e.preventDefault(); zone.classList.add("over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("over"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();
    zone.classList.remove("over");
    if (running) return;
    const type = e.dataTransfer.getData("text/type");
    if (!type) return;
    const arr = zone.id === "program" ? program : zone._targetArray;
    arr.push(newBlock(type));
    renderProgram();
  });
}

// ---- Interpreter -----------------------------------------------------------
const DR = [-1, 0, 1, 0]; // row delta for dir up,right,down,left
const DC = [0, 1, 0, -1];

function cellOpen(r, c) {
  return r >= 0 && r < grid.length && c >= 0 && c < grid[0].length && grid[r][c] !== "#";
}
function pathAhead() {
  return cellOpen(robot.r + DR[robot.dir], robot.c + DC[robot.dir]);
}

async function runProgram() {
  if (running) return;
  running = true;
  setButtons(false);
  // fresh start from current level
  loadLevelKeepProgram();
  const steps = { n: 0 };
  let crashed = false;

  async function exec(list) {
    for (const blk of list) {
      if (crashed) return;
      if (++steps.n > 500) return; // safety
      if (blk.type === "move") {
        const nr = robot.r + DR[robot.dir], nc = robot.c + DC[robot.dir];
        if (cellOpen(nr, nc)) { robot.r = nr; robot.c = nc; }
        else { crashed = true; }
      } else if (blk.type === "left") {
        robot.dir = (robot.dir + 3) % 4;
      } else if (blk.type === "right") {
        robot.dir = (robot.dir + 1) % 4;
      } else if (blk.type === "repeat") {
        for (let k = 0; k < blk.count && !crashed; k++) await exec(blk.children);
      } else if (blk.type === "if") {
        if (pathAhead()) await exec(blk.children);
      }
      renderGrid();
      await sleep(380);
      if (robot.r === goal.r && robot.c === goal.c) return; // reached!
    }
  }

  await exec(program);

  if (robot.r === goal.r && robot.c === goal.c) {
    done.add(levelIndex);
    renderPills();
    win("🎉 You did it! Great coding!");
  } else if (crashed) {
    oops("💥 Bonk! The robot hit a wall. Try again!");
  } else {
    oops("🤔 Almost! The robot didn't reach 🏁 yet.");
  }
  running = false;
  setButtons(true);
}

// reset robot to the level start but keep the built program
function loadLevelKeepProgram() {
  const lvl = LEVELS[levelIndex];
  grid = lvl.grid.map((row) => row.split(""));
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] === "S") { robot = { r, c, dir: lvl.dir }; grid[r][c] = "."; }
      if (grid[r][c] === "G") { goal = { r, c }; }
    }
  renderGrid();
}

// ---- Helpers ---------------------------------------------------------------
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
function setButtons(on) {
  $("runBtn").disabled = !on;
  $("clearBtn").disabled = !on;
}
function say(msg) { $("speech").textContent = msg; }
let toastTimer;
function toast(msg, cls) {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast show " + (cls || "");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = "toast"), 2600);
}
const win = (m) => toast(m, "win");
const oops = (m) => toast(m, "oops");

// ---- Wire up ---------------------------------------------------------------
$("runBtn").onclick = runProgram;
$("clearBtn").onclick = () => { if (!running) { program.length = 0; activeContainer = program; renderProgram(); } };
$("resetBtn").onclick = () => { if (!running) loadLevelKeepProgram(); };

setupToolbox();
loadLevel(0);
