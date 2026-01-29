// ---------- ELEMENTS ----------
const arrayContainer = document.getElementById("array");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const sizeSlider = document.getElementById("size");
const speedSlider = document.getElementById("speed");
const algoSelect = document.getElementById("algorithm");
const modeSelect = document.getElementById("mode");

const timeEl = document.getElementById("time");
const spaceEl = document.getElementById("space");

// ---------- STATE ----------
let array = [];
let bars = [];

// ---------- COMPLEXITY ----------
const complexity = {
    bubble: { time: "O(n²)", space: "O(1)" },
    selection: { time: "O(n²)", space: "O(1)" },
    insertion: { time: "O(n²)", space: "O(1)" },
    merge: { time: "O(n log n)", space: "O(n)" },
    heap: { time: "O(n log n)", space: "O(1)" }
};

function updateComplexity(algo) {
    timeEl.textContent = complexity[algo].time;
    spaceEl.textContent = complexity[algo].space;
}

// ---------- UTIL ----------
const sleep = () =>
    new Promise(r => setTimeout(r, 101 - speedSlider.value));

function disableUI(state) {
    document.querySelectorAll("button, select, input")
        .forEach(e => e.disabled = state);
}

// ---------- ARRAY ----------
function generateArray() {
    array = [];
    bars = [];
    arrayContainer.innerHTML = "";

    for (let i = 0; i < sizeSlider.value; i++) {
        array.push(Math.floor(Math.random() * 350) + 20);
    }

    render();
}

function render() {
    if (modeSelect.value === "dom") {
        canvas.style.display = "none";
        arrayContainer.style.display = "flex";
        renderDOM();
    } else {
        arrayContainer.style.display = "none";
        canvas.style.display = "block";
        drawCanvas();
    }
}

function renderDOM() {
    arrayContainer.innerHTML = "";
    bars = [];

    array.forEach(v => {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = `${v}px`;
        bar.style.width = `${100 / array.length}%`;
        arrayContainer.appendChild(bar);
        bars.push(bar);
    });
}

function drawCanvas(active = []) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width / array.length;

    array.forEach((v, i) => {
        ctx.fillStyle = active.includes(i) ? "#facc15" : "#38bdf8";
        ctx.fillRect(i * w, canvas.height - v, w - 1, v);
    });
}

// ---------- SORTING (RENDERER AGNOSTIC) ----------
async function swap(i, j) {
    [array[i], array[j]] = [array[j], array[i]];
    render();
    await sleep();
}

// Bubble Sort
async function bubbleSort() {
    for (let i = 0; i < array.length; i++)
        for (let j = 0; j < array.length - i - 1; j++)
            if (array[j] > array[j + 1])
                await swap(j, j + 1);
}

// Selection Sort
async function selectionSort() {
    for (let i = 0; i < array.length; i++) {
        let min = i;
        for (let j = i + 1; j < array.length; j++)
            if (array[j] < array[min]) min = j;
        await swap(i, min);
    }
}

// Insertion Sort
async function insertionSort() {
    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;
        while (j >= 0 && array[j] > key) {
            array[j + 1] = array[j];
            j--;
            render();
            await sleep();
        }
        array[j + 1] = key;
        render();
    }
}

// Merge Sort
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
        array[k++] = left[i] <= right[j] ? left[i++] : right[j++];
        render();
        await sleep();
    }
    while (i < left.length) array[k++] = left[i++];
    while (j < right.length) array[k++] = right[j++];
    render();
}

// Heap Sort
async function heapSort() {
    for (let i = Math.floor(array.length / 2) - 1; i >= 0; i--)
        await heapify(array.length, i);

    for (let i = array.length - 1; i > 0; i--) {
        await swap(0, i);
        await heapify(i, 0);
    }
}

async function heapify(n, i) {
    let largest = i;
    const l = 2 * i + 1;
    const r = 2 * i + 2;

    if (l < n && array[l] > array[largest]) largest = l;
    if (r < n && array[r] > array[largest]) largest = r;

    if (largest !== i) {
        await swap(i, largest);
        await heapify(n, largest);
    }
}

// ---------- CONTROLLER ----------
const algorithms = {
    bubble: bubbleSort,
    selection: selectionSort,
    insertion: insertionSort,
    merge: mergeSort,
    heap: heapSort
};

document.getElementById("generate").onclick = generateArray;

document.getElementById("sort").onclick = async () => {
    disableUI(true);
    updateComplexity(algoSelect.value);
    await algorithms[algoSelect.value]();
    disableUI(false);
};

modeSelect.onchange = render;

// ---------- INIT ----------
generateArray();
