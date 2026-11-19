"use strict";

const get = id => document.getElementById(id);
const board = get("board");
const status = get("status");
const difficulty = get("difficulty");
let game;
let values;
let selected;
let history;
let started;
let finished;

const cells = Sudoku.indices.map(index => {
  const cell = document.createElement("button");
  cell.className = "cell";
  cell.addEventListener("focus", () => selectCell(index));
  cell.addEventListener("click", () => selectCell(index));
  board.append(cell);
  return cell;
});
const numberButtons = Sudoku.digits.map(number => {
  const button = document.createElement("button");
  button.textContent = number;
  button.addEventListener("click", () => enter(number));
  get("keypad").append(button);
  return button;
});

function selectCell(index) {
  selected = index;
  render();
}

function render() {
  const related = Sudoku.peers[selected];
  const current = values[selected];
  const editable = !finished && !game.puzzle[selected];
  cells.forEach((cell, index) => {
    const value = values[index];
    const fixed = Boolean(game.puzzle[index]);
    const conflict = Boolean(value && Sudoku.peers[index].some(peer => values[peer] === value));
    cell.textContent = value || "";
    cell.tabIndex = index === selected ? 0 : -1;
    cell.classList.toggle("given", fixed);
    cell.classList.toggle("selected", index === selected);
    cell.classList.toggle("related", related.includes(index));
    cell.classList.toggle("match", Boolean(current && value === current));
    cell.classList.toggle("conflict", conflict);
    cell.setAttribute("aria-pressed", index === selected);
    cell.setAttribute("aria-label", [
      `Row ${Math.floor(index / 9) + 1}, column ${index % 9 + 1}`,
      value || "empty",
      fixed ? "fixed" : "",
      conflict ? "conflict" : ""
    ].filter(Boolean).join(", "));
  });
  numberButtons.forEach(button => { button.disabled = !editable; });
  get("erase").disabled = !editable || !current;
  get("hint").disabled = Boolean(finished);
  get("undo").disabled = !history.length;
  status.classList.toggle("win", Boolean(finished));
}

function elapsed() {
  const seconds = Math.floor(((finished || performance.now()) - started) / 1000);
  return [Math.floor(seconds / 60), seconds % 60].map(value => String(value).padStart(2, "0")).join(":");
}

function updateTimer() {
  get("timer").textContent = elapsed();
}

function reset(message) {
  values = [...game.puzzle];
  history = [];
  selected = values.indexOf(0);
  started = performance.now();
  finished = 0;
  status.textContent = message;
  updateTimer();
  render();
}

function newGame() {
  game = Sudoku.generate(difficulty.value);
  reset(`${difficulty.value} puzzle ready.`);
}

function enter(value, message = "") {
  if (finished || game.puzzle[selected] || values[selected] === value) return;
  history.push({ index: selected, value: values[selected] });
  values[selected] = value;
  if (values.every((number, index) => number === game.solution[index])) {
    finished = performance.now();
    updateTimer();
    status.textContent = `Congratulations! Puzzle solved in ${elapsed()}.`;
  } else {
    const conflict = value && Sudoku.peers[selected].some(peer => values[peer] === value);
    status.textContent = message || (conflict ? "That number conflicts with another cell." : "");
  }
  render();
}

function undo() {
  if (!history.length) return;
  const move = history.pop();
  values[move.index] = move.value;
  selected = move.index;
  // Exclude time spent on the completed puzzle before undoing.
  if (finished) started += performance.now() - finished;
  finished = 0;
  status.textContent = "Last move undone.";
  updateTimer();
  render();
  cells[selected].focus();
}

function hint() {
  if (finished) return;
  if (values[selected] === game.solution[selected]) {
    selected = values.findIndex((value, index) => value !== game.solution[index]);
  }
  enter(game.solution[selected], "Hint filled in a cell.");
}

get("new").addEventListener("click", newGame);
difficulty.addEventListener("change", newGame);
get("restart").addEventListener("click", () => reset("Puzzle restarted."));
get("erase").addEventListener("click", () => enter(0));
get("undo").addEventListener("click", undo);
get("hint").addEventListener("click", hint);

document.addEventListener("keydown", event => {
  if (get("info").open || event.altKey || event.ctrlKey || event.metaKey || event.target.tagName === "SELECT") return;
  if (/^[1-9]$/.test(event.key)) {
    event.preventDefault();
    enter(Number(event.key));
  } else if (event.key === "Backspace" || event.key === "Delete" || event.key === "0") {
    event.preventDefault();
    enter(0);
  } else if (board.contains(event.target)) {
    const next = {
      ArrowLeft: selected % 9 ? selected - 1 : selected,
      ArrowRight: selected % 9 < 8 ? selected + 1 : selected,
      ArrowUp: Math.max(selected % 9, selected - 9),
      ArrowDown: Math.min(72 + selected % 9, selected + 9)
    }[event.key];
    if (next !== undefined) {
      event.preventDefault();
      cells[next].focus();
    }
  }
});

const info = {
  about: "Sudoku offers free classic number puzzles at three difficulty levels. Every puzzle is generated in your browser and has a unique solution.",
  contact: "For feedback, bug reports, or questions about Sudoku, email us. Please include your browser and device if you are reporting a problem.",
  privacy: "The game runs in your browser and does not ask for an account, use analytics scripts, or store personal information. Our hosting provider may process standard request logs. External recommendations follow their own privacy policies.",
  terms: "Sudoku is available free for personal enjoyment. The game is provided as is. Third-party recommendations are governed by their own terms. Some links are referrals."
};
document.querySelectorAll("[data-info]").forEach(button => {
  button.addEventListener("click", () => {
    get("info-title").textContent = button.textContent;
    get("info-text").textContent = info[button.dataset.info];
    get("info").showModal();
  });
});

newGame();
setInterval(updateTimer, 250);
