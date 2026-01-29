/* ================================
   DOM ELEMENTS
================================ */
const container = document.getElementById("array-container");
const sizeSlider = document.getElementById("size");
const speedSlider = document.getElementById("speed");
const algoSelect = document.getElementById("algorithm");
const generateBtn = document.getElementById("generate");
const sortBtn = document.getElementById("sort");
const themeSelect = document.getElementById("theme");

/* ================================
   GLOBAL STATE
================================ */
let array = [];
let delay = 100;
let isSorting = false;

/* ================================
   UTILITIES
================================ */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function disableControls(disabled) {
  document.querySelectorAll("select, input, button").forEach(el => el.disabled = disabled);
}

function updateDelay() {
  delay = 200 - speedSlider.value * 1.8;
}

/* ================================
   ARRAY GENERATION
================================ */
function generateArray() {
  if (isSorting) return;

  array = [];
  container.innerHTML = "";

  const size = sizeSlider.value;

  for (let i = 0; i < size; i++) {
    const value = Math.floor(Math.random() * 300) + 20;
    array.push(value);

    const bar = document.createElement("div");
    bar.classList.add("bar");

    const label = document.createElement("div");
    label.classList.add("bar-label");
    label.innerText = value;
    bar.appendChild(label);

    bar.style.height = `${value}px`;
    container.appendChild(bar);
  }
}

/* ================================
   UPDATE BARS WITH HIGHLIGHTS
================================ */
function updateBars(activeIndices = [], pivotIndex = null, swapIndices = []) {
  const bars = document.querySelectorAll(".bar");

  bars.forEach((bar, i) => {
    bar.style.height = `${array[i]}px`;
    bar.classList.remove("active", "pivot", "swap");

    if (activeIndices.includes(i)) bar.classList.add("active");
    if (swapIndices.includes(i)) bar.classList.add("swap");
    if (i === pivotIndex) bar.classList.add("pivot");

    bar.querySelector(".bar-label").innerText = array[i];
  });
}

/* ================================
   SORTING ALGORITHMS
================================ */

/* BUBBLE SORT */
async function bubbleSort() {
  const bars = document.querySelectorAll(".bar");

  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      updateBars([j, j + 1]);
      await sleep(delay);

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        updateBars([], null, [j, j + 1]);
        await sleep(delay);
      }
    }
    bars[array.length - i - 1].classList.add("sorted");
  }
}

/* INSERTION SORT */
async function insertionSort() {
  const bars = document.querySelectorAll(".bar");

  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;

    while (j >= 0 && array[j] > key) {
      updateBars([j, j + 1]);
      await sleep(delay);

      array[j + 1] = array[j];
      updateBars([j, j + 1], null, [j, j + 1]);
      await sleep(delay);
      j--;
    }
    array[j + 1] = key;
    updateBars([j + 1]);
    await sleep(delay);
  }
  bars.forEach(bar => bar.classList.add("sorted"));
}

/* SELECTION SORT */
async function selectionSort() {
  const bars = document.querySelectorAll(".bar");

  for (let i = 0; i < array.length; i++) {
    let min = i;

    for (let j = i + 1; j < array.length; j++) {
      updateBars([min, j]);
      await sleep(delay);
      if (array[j] < array[min]) min = j;
    }

    [array[i], array[min]] = [array[min], array[i]];
    updateBars([], null, [i, min]);
    await sleep(delay);

    bars[i].classList.add("sorted");
  }
}

/* QUICK SORT */
async function quickSort(low = 0, high = array.length - 1) {
  if (low < high) {
    const pi = await partition(low, high);
    await quickSort(low, pi - 1);
    await quickSort(pi + 1, high);
  } else if (low >= 0 && high >= 0 && low < array.length && high < array.length) {
    document.querySelectorAll(".bar")[low].classList.add("sorted");
  }
}

async function partition(low, high) {
  const pivot = array[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    updateBars([j], high);
    await sleep(delay);

    if (array[j] < pivot) {
      i++;
      [array[i], array[j]] = [array[j], array[i]];
      updateBars([], high, [i, j]);
      await sleep(delay);
    }
  }

  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  updateBars([], null, [i + 1, high]);
  await sleep(delay);

  document.querySelectorAll(".bar")[i + 1].classList.add("sorted");
  return i + 1;
}

/* MERGE SORT */
async function mergeSort(left = 0, right = array.length - 1) {
  if (left >= right) return;

  const mid = Math.floor((left + right) / 2);
  await mergeSort(left, mid);
  await mergeSort(mid + 1, right);
  await merge(left, mid, right);
}

async function merge(left, mid, right) {
  const leftArr = array.slice(left, mid + 1);
  const rightArr = array.slice(mid + 1, right + 1);

  let i = 0, j = 0, k = left;

  while (i < leftArr.length && j < rightArr.length) {
    updateBars([k]);
    await sleep(delay);

    array[k++] = leftArr[i] <= rightArr[j] ? leftArr[i++] : rightArr[j++];
    updateBars([k - 1]);
    await sleep(delay);
  }

  while (i < leftArr.length) {
    array[k++] = leftArr[i++];
    updateBars([k - 1]);
    await sleep(delay);
  }

  while (j < rightArr.length) {
    array[k++] = rightArr[j++];
    updateBars([k - 1]);
    await sleep(delay);
  }
  for (let t = left; t <= right; t++) document.querySelectorAll(".bar")[t].classList.add("sorted");
}

/* HEAP SORT */
async function heapSort() {
  const n = array.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    await heapify(n, i);
  }

  for (let i = n - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    updateBars([], null, [0, i]);
    await sleep(delay);
    document.querySelectorAll(".bar")[i].classList.add("sorted");
    await heapify(i, 0);
  }
  document.querySelectorAll(".bar")[0].classList.add("sorted");
}

async function heapify(n, i) {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;

  if (left < n && array[left] > array[largest]) largest = left;
  if (right < n && array[right] > array[largest]) largest = right;

  if (largest !== i) {
    [array[i], array[largest]] = [array[largest], array[i]];
    updateBars([], null, [i, largest]);
    await sleep(delay);
    await heapify(n, largest);
  }
}

/* RADIX SORT */
async function radixSort() {
  const max = Math.max(...array);

  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    await countingSort(exp);
  }
  document.querySelectorAll(".bar").forEach(bar => bar.classList.add("sorted"));
}

async function countingSort(exp) {
  const output = new Array(array.length).fill(0);
  const count = new Array(10).fill(0);

  for (let i = 0; i < array.length; i++) {
    count[Math.floor(array[i] / exp) % 10]++;
  }

  for (let i = 1; i < 10; i++) count[i] += count[i - 1];

  for (let i = array.length - 1; i >= 0; i--) {
    const idx = Math.floor(array[i] / exp) % 10;
    output[--count[idx]] = array[i];
  }

  for (let i = 0; i < array.length; i++) {
    array[i] = output[i];
    updateBars([i]);
    await sleep(delay);
  }
}

/* ================================
   EVENT HANDLERS
================================ */
generateBtn.addEventListener("click", generateArray);

sortBtn.addEventListener("click", async () => {
  if (isSorting) return;

  isSorting = true;
  disableControls(true);
  updateDelay();

  switch (algoSelect.value) {
    case "bubble": await bubbleSort(); break;
    case "insertion": await insertionSort(); break;
    case "selection": await selectionSort(); break;
    case "quick": await quickSort(); break;
    case "merge": await mergeSort(); break;
    case "heap": await heapSort(); break;
    case "radix": await radixSort(); break;
  }

  isSorting = false;
  disableControls(false);
});

sizeSlider.addEventListener("input", generateArray);
speedSlider.addEventListener("input", updateDelay);
themeSelect.addEventListener("change", () => document.body.className = themeSelect.value);

/* ================================
   INIT
================================ */
document.body.className = "neon";
generateArray();
