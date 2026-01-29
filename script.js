const container = document.getElementById("array-container");
const sizeSlider = document.getElementById("size");
const speedSlider = document.getElementById("speed");
const algoSelect = document.getElementById("algorithm");

let array = [];
let bars = [];

// ---------- Utilities ----------

function sleep() {
    return new Promise(resolve =>
        setTimeout(resolve, 101 - speedSlider.value)
    );
}

function swap(i, j) {
    [array[i], array[j]] = [array[j], array[i]];
    bars[i].style.height = `${array[i]}px`;
    bars[j].style.height = `${array[j]}px`;
}

// ---------- Array Generation ----------

function generateArray() {
    container.innerHTML = "";
    array = [];
    bars = [];

    const size = sizeSlider.value;

    for (let i = 0; i < size; i++) {
        const value = Math.floor(Math.random() * 350) + 20;
        array.push(value);

        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${value}px`;
        bar.style.width = `${100 / size}%`;

        container.appendChild(bar);
        bars.push(bar);
    }
}

generateArray();

const complexity = {
    bubble: { time: "O(n²)", space: "O(1)" },
    selection: { time: "O(n²)", space: "O(1)" },
    insertion: { time: "O(n²)", space: "O(1)" },
    merge: { time: "O(n log n)", space: "O(n)" },
    heap: { time: "O(n log n)", space: "O(1)" },
    quick: { time: "O(n log n)", space: "O(log n)" }
};

function updateComplexity(algo) {
    document.getElementById("time").innerText = complexity[algo].time;
    document.getElementById("space").innerText = complexity[algo].space;
}

// ---------- Sorting Algorithms ----------

async function bubbleSort() {
    for (let i = 0; i < array.length; i++) {
        for (let j = 0; j < array.length - i - 1; j++) {
            bars[j].classList.add("active");
            bars[j + 1].classList.add("active");

            if (array[j] > array[j + 1]) {
                swap(j, j + 1);
            }

            await sleep();
            bars[j].classList.remove("active");
            bars[j + 1].classList.remove("active");
        }
        bars[array.length - i - 1].classList.add("sorted");
    }
}

async function selectionSort() {
    for (let i = 0; i < array.length; i++) {
        let min = i;
        bars[min].classList.add("active");

        for (let j = i + 1; j < array.length; j++) {
            bars[j].classList.add("active");
            await sleep();

            if (array[j] < array[min]) {
                bars[min].classList.remove("active");
                min = j;
                bars[min].classList.add("active");
            } else {
                bars[j].classList.remove("active");
            }
        }

        swap(i, min);
        bars[min].classList.remove("active");
        bars[i].classList.add("sorted");
    }
}

async function insertionSort() {
    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;

        while (j >= 0 && array[j] > key) {
            array[j + 1] = array[j];
            bars[j + 1].style.height = `${array[j]}px`;
            j--;
            await sleep();
        }
        array[j + 1] = key;
        bars[j + 1].style.height = `${key}px`;
    }
}

async function quickSort(low = 0, high = array.length - 1) {
    if (low < high) {
        const pi = await partition(low, high);
        await quickSort(low, pi - 1);
        await quickSort(pi + 1, high);
    }
}

async function partition(low, high) {
    let pivot = array[high];
    bars[high].classList.add("active");
    let i = low - 1;

    for (let j = low; j < high; j++) {
        bars[j].classList.add("active");
        await sleep();

        if (array[j] < pivot) {
            i++;
            swap(i, j);
        }
        bars[j].classList.remove("active");
    }

    swap(i + 1, high);
    bars[high].classList.remove("active");
    return i + 1;
}

async function mergeSort(l = 0, r = array.length - 1) {
    if (l >= r) return;

    const mid = Math.floor((l + r) / 2);
    await mergeSort(l, mid);
    await mergeSort(mid + 1, r);
    await merge(l, mid, r);
}

async function merge(l, m, r) {
    let left = array.slice(l, m + 1);
    let right = array.slice(m + 1, r + 1);

    let i = 0, j = 0, k = l;

    while (i < left.length && j < right.length) {
        bars[k].classList.add("active");
        await sleep();

        if (left[i] <= right[j]) {
            array[k] = left[i++];
        } else {
            array[k] = right[j++];
        }

        bars[k].style.height = `${array[k]}px`;
        bars[k].classList.remove("active");
        k++;
    }

    while (i < left.length) {
        array[k] = left[i++];
        bars[k].style.height = `${array[k]}px`;
        await sleep();
        k++;
    }

    while (j < right.length) {
        array[k] = right[j++];
        bars[k].style.height = `${array[k]}px`;
        await sleep();
        k++;
    }
}

async function heapSort() {
    let n = array.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--)
        await heapify(n, i);

    for (let i = n - 1; i > 0; i--) {
        swap(0, i);
        bars[i].classList.add("sorted");
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
        swap(i, largest);
        await sleep();
        await heapify(n, largest);
    }
}


// ---------- Algorithm Map ----------

const algorithms = {
    bubble: bubbleSort,
    selection: selectionSort,
    insertion: insertionSort,
    quick: quickSort,
    merge = mergeSort,
    heap = heapSort
};

// ---------- Start Sorting ----------

async function startSort() {
    disableControls(true);
    updateComplexity(algoSelect.value);
    await algorithms[algoSelect.value]();
    disableControls(false);
}

function disableControls(disabled) {
    document.querySelectorAll("button, select, input")
        .forEach(el => el.disabled = disabled);
}
