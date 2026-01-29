const container = document.getElementById("array-container");
const sizeSlider = document.getElementById("size");
const speedSlider = document.getElementById("speed");
const algoSelect = document.getElementById("algorithm");

let array = [];
let delay = 100;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function generateArray() {
  container.innerHTML = "";
  array = [];
  const size = sizeSlider.value;

  for (let i = 0; i < size; i++) {
    const value = Math.floor(Math.random() * 300) + 20;
    array.push(value);

    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = `${value}px`;
    container.appendChild(bar);
  }
}

function updateBars() {
  document.querySelectorAll(".bar").forEach((bar, i) => {
    bar.style.height = `${array[i]}px`;
  });
}

/* ---------------- SORTING ALGORITHMS ---------------- */

async function bubbleSort() {
  const bars = document.querySelectorAll(".bar");
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      bars[j].classList.add("active");
      bars[j + 1].classList.add("active");

      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
        updateBars();
      }

      await sleep(delay);
      bars[j].classList.remove("active");
      bars[j + 1].classList.remove("active");
    }
    bars[array.length - i - 1].classList.add("sorted");
  }
}

async function insertionSort() {
  const bars = document.querySelectorAll(".bar");
  for (let i = 1; i < array.length; i++) {
    let key = array[i];
    let j = i - 1;

    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j];
      j--;
      updateBars();
      await sleep(delay);
    }
    array[j + 1] = key;
  }
}

async function selectionSort() {
  const bars = document.querySelectorAll(".bar");
  for (let i = 0; i < array.length; i++) {
    let min = i;
    for (let j = i + 1; j < array.length; j++) {
      if (array[j] < array[min]) min = j;
      await sleep(delay);
    }
    [array[i], array[min]] = [array[min], array[i]];
    updateBars();
  }
}

async function quickSort(low = 0, high = array.length - 1) {
  if (low < high) {
    let pi = await partition(low, high);
    await quickSort(low, pi - 1);
    await quickSort(pi + 1, high);
  }
}

async function partition(low, high) {
  let pivot = array[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    if (array[j] < pivot) {
      i++;
      [array[i], array[j]] = [array[j], array[i]];
      updateBars();
      await sleep(delay);
    }
  }
  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  updateBars();
  return i + 1;
}

async function mergeSort(l = 0, r = array.length - 1) {
  if (l >= r) return;
  const m = Math.floor((l + r) / 2);
  await mergeSort(l, m);
  await mergeSort(m + 1, r);
  await merge(l, m, r);
}

async function merge(l, m, r) {
  const left = array.slice(l, m + 1);
  const right = array.slice(m + 1, r + 1);

  let i = 0, j = 0, k = l;

  while (i < left.length && j < right.length) {
    array[k++] = left[i] < right[j] ? left[i++] : right[j++];
    updateBars();
    await sleep(delay);
  }

  while (i < left.length) {
    array[k++] = left[i++];
    updateBars();
    await sleep(delay);
  }
}

async function heapSort() {
  const n = array.length;

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--)
    await heapify(n, i);

  for (let i = n - 1; i > 0; i--) {
    [array[0], array[i]] = [array[i], array[0]];
    updateBars();
    await sleep(delay);
    await heapify(i, 0);
  }
}

async function heapify(n, i) {
  let largest = i;
  let l = 2 * i + 1;
  let r = 2 * i + 2;

  if (l < n && array[l] > array[largest]) largest = l;
  if (r < n && array[r] > array[largest]) largest = r;

  if (largest !== i) {
    [array[i], array[largest]] = [array[largest], array[i]];
    updateBars();
    await sleep(delay);
    await heapify(n, largest);
  }
}

async function radixSort() {
  const max = Math.max(...array);
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    await countingSort(exp);
  }
}

async function countingSort(exp) {
  const output = new Array(array.length).fill(0);
  const count = new Array(10).fill(0);

  for (let i = 0; i < array.length; i++)
    count[Math.floor(array[i] / exp) % 10]++;

  for (let i = 1; i < 10; i++)
    count[i] += count[i - 1];

  for (let i = array.length - 1; i >= 0; i--) {
    let idx = Math.floor(array[i] / exp) % 10;
    output[--count[idx]] = array[i];
  }

  for (let i = 0; i < array.length; i++) {
    array[i] = output[i];
    updateBars();
    await sleep(delay);
  }
}

/* ---------------- EVENTS ---------------- */

document.getElementById("generate").onclick = generateArray;

document.getElementById("sort").onclick = async () => {
  delay = 200 - speedSlider.value * 2;

  switch (algoSelect.value) {
    case "bubble": await bubbleSort(); break;
    case "insertion": await insertionSort(); break;
    case "selection": await selectionSort(); break;
    case "quick": await quickSort(); break;
    case "merge": await mergeSort(); break;
    case "heap": await heapSort(); break;
    case "radix": await radixSort(); break;
  }
};

generateArray();

const themeSelect = document.getElementById("theme");

themeSelect.addEventListener("change", () => {
  document.body.className = themeSelect.value;
});

// Default theme
document.body.className = "neon";

