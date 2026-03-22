

function shuffle(array) {
  const arr = [...array]; // copy to avoid mutating original

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    // swap
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
}

function pickRandom(arr, count) {
  const result = [];
  const used = new Set();

  while (result.length < count && result.length < arr.length) {
    const randomIndex = Math.floor(Math.random() * arr.length);

    if (!used.has(randomIndex)) {
      used.add(randomIndex);
      result.push(arr[randomIndex]);
    }
  }

  return result;
}
module.exports = {shuffle, pickRandom};