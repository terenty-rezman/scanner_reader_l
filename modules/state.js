export let scannedSet = new Set();
let scannedIndex = new Map();
let count = 0;

export function addScan(key, result) {
  if (scannedIndex.has(key)) return false;

  scannedSet.add(result);
  scannedIndex.set(key, result);
  console.log("Set:", scannedSet);
  count++;
  console.log("Count:", count);

  return true;
}

export function resetState() {
  scannedSet = new Set();
  scannedIndex = new Map();
  count = 0;
}

export function getState() {
  return {
    scannedSet,
    scannedIndex,
    count,
  };
}
