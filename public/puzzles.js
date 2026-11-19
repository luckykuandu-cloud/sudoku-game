"use strict";

const Sudoku = (() => {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const indices = Array.from({ length: 81 }, (_, index) => index);
  const box = index => Math.floor(index / 27) * 3 + Math.floor(index % 9 / 3);
  const peers = indices.map(index => indices.filter(other => other !== index && (
    Math.floor(other / 9) === Math.floor(index / 9) ||
    other % 9 === index % 9 || box(other) === box(index)
  )));
  const clues = { Easy: 42, Medium: 34, Hard: 27 };

  function shuffle(values) {
    const result = [...values];
    for (let index = result.length - 1; index > 0; index--) {
      const target = Math.floor(Math.random() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  }

  function countSolutions(values, limit = 2) {
    const board = [...values];
    if (board.some((value, index) => value && peers[index].some(peer => board[peer] === value))) {
      return 0;
    }
    const rows = Array(9).fill(0);
    const columns = Array(9).fill(0);
    const boxes = Array(9).fill(0);

    function toggle(index, bit) {
      rows[Math.floor(index / 9)] ^= bit;
      columns[index % 9] ^= bit;
      boxes[box(index)] ^= bit;
    }

    board.forEach((value, index) => {
      if (value) toggle(index, 1 << (value - 1));
    });

    let count = 0;
    function search() {
      let selected = -1;
      let options = 0;
      let fewest = 10;
      for (const index of indices) {
        if (board[index]) continue;
        const mask = 511 & ~(rows[Math.floor(index / 9)] | columns[index % 9] | boxes[box(index)]);
        if (!mask) return;
        let size = 0;
        for (let remaining = mask; remaining; remaining &= remaining - 1) size++;
        if (size < fewest) {
          selected = index;
          options = mask;
          fewest = size;
          if (size === 1) break;
        }
      }
      if (selected < 0) {
        count++;
        return;
      }
      while (options && count < limit) {
        const bit = options & -options;
        options ^= bit;
        board[selected] = 32 - Math.clz32(bit);
        toggle(selected, bit);
        search();
        toggle(selected, bit);
        board[selected] = 0;
      }
    }

    search();
    return count;
  }

  function generate(difficulty) {
    const target = clues[difficulty];
    if (!target) throw new RangeError("Unknown difficulty");
    const order = () => shuffle([0, 1, 2]).flatMap(group =>
      shuffle([0, 1, 2]).map(offset => group * 3 + offset));
    for (;;) {
      const numbers = shuffle(digits);
      const columns = order();
      const solution = order().flatMap(row => columns.map(column =>
        numbers[(row * 3 + Math.floor(row / 3) + column) % 9]));
      const puzzle = [...solution];
      let remaining = 81;
      for (const index of shuffle(indices)) {
        puzzle[index] = 0;
        if (countSolutions(puzzle) === 1) {
          remaining--;
          if (remaining === target) return { puzzle, solution };
        } else {
          puzzle[index] = solution[index];
        }
      }
    }
  }

  return { digits, indices, peers, generate, countSolutions };
})();

if (typeof module !== "undefined") module.exports = Sudoku;
