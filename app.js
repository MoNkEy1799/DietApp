function openTab(evt, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].style.backgroundColor = "";
        tablinks[i].classList.remove("active");
    }
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
    if (tabName === "Tracker") {
        document.getElementById("tracker-toggle").checked = false;
        updateTracker();
    }
    else if (tabName === "Weight") {
        document.getElementById("weight-toggle").checked = false;
        updateWeight();
    }
    else if (tabName === "Settings") {
        document.getElementById("settings-toggle").checked = false;
    }
}

function dateToString(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}

function stringToDate(string) {
    const parts = string.split('.');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
}

function checkDateDifference(date, diff) {
    date.setDate(date.getDate() - diff);
    return date.getDate() === window.today.getDate() &&
           date.getMonth() === window.today.getMonth() &&
           date.getFullYear() == window.today.getFullYear();
}

function loadData() {
    window.today = new Date();
    window.storage = JSON.parse(localStorage.getItem("storage"));
    window.receipes = JSON.parse(localStorage.getItem("receipes"));
    window.logs = JSON.parse(localStorage.getItem("logs"));
    window.trackerTablePerson = undefined;
    window.weightTablePerson = undefined;
    if (window.storage === null) {
        window.storage = {
            person1: {
                proteinYesterday: [],
                caloriesYesterday: [],
                typesYesterday: [],
                proteinToday: [],
                caloriesToday: [],
                typesToday: [],
                proteinTomorrow: [],
                caloriesTomorrow: [],
                typesTomorrow: [],
                proteinSetting: 120,
                caloriesSetting: 2000,
                weights: [],
                dates: [],
            },
            person2: {
                proteinYesterday: [],
                caloriesYesterday: [],
                proteinToday: [],
                caloriesToday: [],
                proteinTomorrow: [],
                caloriesTomorrow: [],
                proteinSetting: 90,
                caloriesSetting: 1500,
                weights: [],
                dates: [],
            },
            today: undefined,
        }
    }
    if (window.receipes === null) {
        window.receipes = {};
    }
    if (window.logs === null) {
        window.logs = [];
    }

    if (typeof window.storage.today === "undefined") {
        window.storage.today = dateToString(window.today);
    }
    // loading on same day --> keep data, do nothing
    if (checkDateDifference(window.today, 0)) {
    }
    // loading on next day -> today is becoming yesterday and tomorrow is becoming today
    else if (checkDateDifference(window.today, 1)) {
        for (let name of ["person1", "person2"]) {
            let item = window.storage[name];
            item.proteinYesterday = item.proteinToday;
            item.caloriesYesterday = item.caloriesToday;
            item.proteinToday = item.proteinTomorrow;
            item.caloriesToday = item.caloriesTomorrow;
            item.proteinTomorrow = 0;
            item.caloriesTomorrow = 0;
        }
    }
    // loading on any later date -> set everything to 0
    else {
        for (let name of ["person1", "person2"]) {
            let item = window.storage[name];
            item.proteinYesterday = 0;
            item.caloriesYesterday = 0;
            item.proteinToday = 0;
            item.caloriesToday = 0;
            item.proteinTomorrow = 0;
            item.caloriesTomorrow = 0;
        }
    }
    // set the new date
    window.storage.today = dateToString(window.today);
    saveData(saveStorage=true);
    document.getElementById("dateDisplay").innerHTML = "<b>Today: </b>" + window.storage.today;
    document.getElementById("dailyProtein").placeholder = window.storage.person1.proteinSetting;
    document.getElementById("dailyCalories").placeholder = window.storage.person1.caloriesSetting;
}

function saveData(saveStorage = false, saveReceipes = false, saveLogs = false) {
    if (saveStorage) {
        localStorage.setItem("storage", JSON.stringify(window.storage));
    }
    if (saveReceipes) {
        localStorage.setItem("receipes", JSON.stringify(window.receipes));
    }
    if (saveLogs) {
        localStorage.setItem("logs", JSON.stringify(window.logs));
    }
}

function getPerson() {
    return document.querySelector("input[name='person']:checked").value;
}

function addTrackerValue() {
    const protein = Number(document.getElementById("proteinInput").value);
    const calories = Number(document.getElementById("caloriesInput").value);
    document.getElementById("proteinInput").value = "";
    document.getElementById("caloriesInput").value = "";
    if (!(protein+calories)) {
        return;
    }
    // const amount = Number(document.getElementById("foodAmountInput").value);
    // const name = document.getElementById("foodNameInput").value;
    const person = getPerson();
    const date = document.getElementById("dateSelector").value;
    const type = "Direct value input";
    window.storage[person]["protein"+date].push(protein);
    window.storage[person]["calories"+date].push(calories);
    window.storage[person]["types"+date].push(type);
    saveData(saveStorage=true);
    logCommand(`Tracker: added value for ${document.querySelector(`label[for=${person}]`).innerHTML} (${date}). Protein: ${protein}, Calories: ${calories}, Type: ${type}`);
    updateTracker();
    window.trackerTablePerson = undefined;
    if (document.getElementById("tracker-toggle").checked) {
        fillTrackerTable();
    }
}

function undoTracker() {
    const person = getPerson();
    const date = document.getElementById("dateSelector").value;
    const protein = window.storage[person]["protein"+date].pop();
    const calories = window.storage[person]["calories"+date].pop();
    const type = window.storage[person]["types"+date].pop();
    saveData(saveStorage=true);
    logCommand(`Tracker: removed value from ${document.querySelector(`label[for=${person}]`).innerHTML} (${date}). Protein: ${protein}, Calories: ${calories}, Type: ${type}`);
    updateTracker();
    window.trackerTablePerson = undefined;
    if (document.getElementById("tracker-toggle").checked) {
        fillTrackerTable();
    }
}

function updateTracker() {
    const person = getPerson();
    const date = document.getElementById("dateSelector").value;
    const sumProtein = window.storage[person]["protein"+date].reduce((acc, val) => acc + val, 0);
    const sumCalories = window.storage[person]["calories"+date].reduce((acc, val) => acc + val, 0);
    document.getElementById("remainHeader").innerHTML = "Remaining For " + date + " :";
    document.getElementById("remainingProtein").innerHTML = window.storage[person].proteinSetting - sumProtein;
    document.getElementById("remainingCalories").innerHTML = window.storage[person].caloriesSetting - sumCalories;
}

function fillTrackerTable() {
    const person = getPerson();
    if (person === window.trackerTablePerson) {
        return;
    }
    window.trackerTablePerson = person;
    const table = document.getElementById("trackerTable").getElementsByTagName("tbody")[0];
    const lightColor = getComputedStyle(document.documentElement).getPropertyValue('--lighter_color');
    table.innerHTML = "";
    for (let day of ["Yesterday", "Today", "Tomorrow"]) {
        const proteinList = window.storage[person]["protein"+day];
        const calorieList = window.storage[person]["calories"+day];
        const typeList = window.storage[person]["types"+day];
        const row = table.insertRow();
        row.style.backgroundColor = lightColor;
        const cell = row.insertCell(0);
        cell.colSpan = 3;
        cell.textContent = day;
        if (proteinList.length === 0) {
            const row = table.insertRow();
            row.insertCell(0).textContent = "-";
            row.insertCell(1).textContent = "-";
            row.insertCell(2).textContent = "-";
        }
        else {
            for (let i = 0; i < proteinList.length; i++) {
                const row = table.insertRow();
                row.insertCell(0).textContent = proteinList[i];
                row.insertCell(1).textContent = calorieList[i];
                row.insertCell(2).textContent = typeList[i];
            }
        }
    }
}

function addWeightValue() {
    const weight = Number(document.getElementById("weightInput").value);
    document.getElementById("weightInput").value = "";
    if (!weight) {
        return;
    }
    const person = getPerson();
    window.storage[person].dates.push(window.storage.today);
    window.storage[person].weights.push(weight);
    saveData(saveStorage=true);
    logCommand(`Weight: added value for ${document.querySelector(`label[for=${person}]`).innerHTML}. Weight: ${weight}, Date: ${window.storage.today}`);
    updateWeight();
    window.weightTablePerson = undefined;
    if (document.getElementById("weight-toggle").checked) {
        fillWeightTable();
    }
}

function undoWeight() {
    const person = getPerson();
    const date = window.storage[person].dates.pop();
    const weight = window.storage[person].weights.pop();
    saveData(saveStorage=true);
    logCommand(`Weight: removed value from ${document.querySelector(`label[for=${person}]`).innerHTML}. Weight: ${weight}, Date: ${date}`);
    updateWeight();
    window.weightTablePerson = undefined;
    if (document.getElementById("weight-toggle").checked) {
        fillWeightTable();
    }
}

function updateWeight() {
    const person = getPerson();
    const weights = window.storage[person].weights;
    const diff = -(weights[weights.length-1] - weights[0]);
    document.getElementById("weightLoss").innerHTML = isNaN(diff) ? "0 kg" : diff + " kg";
    weightChart.data.labels = window.storage[person].dates;
    weightChart.data.datasets[0].data = window.storage[person].weights;
    weightChart.update();
}

function fillWeightTable() {
    const person = getPerson();
    if (person === window.weightTablePerson) {
        return;
    }
    window.weightTablePerson = person;
    const table = document.getElementById("weightTable").getElementsByTagName("tbody")[0];
    table.innerHTML = "";
    for (let i = 0; i < window.storage[person].weights.length; i++) {
        const row = table.insertRow();
        row.insertCell(0).textContent = window.storage[person].dates[i];
        row.insertCell(1).textContent = window.storage[person].weights[i].toFixed(1);
    }
}

function logCommand(log) {
    window.logs.unshift(log);
    if (window.logs.length > 20) {
        window.logs.pop();
    }
    saveData(saveLogs=true);
}

function changeSettings() {
    const person = getPerson();
    let protein = Number(document.getElementById("dailyProtein").value);
    let calories = Number(document.getElementById("dailyCalories").value);
    protein = protein ? protein : window.storage[person].proteinSetting;
    calories = calories ? calories : window.storage[person].caloriesSetting;
    window.storage[person].proteinSetting = protein;
    window.storage[person].caloriesSetting = calories;
    saveData(saveStorage=true);
    logCommand(`Settings: changed dailys for ${document.querySelector(`label[for=${person}]`).innerHTML}. Protein: ${protein}, Calories: ${calories}`);
    document.getElementById("settingsInfo").hidden = false;
    setTimeout(() => {document.getElementById("settingsInfo").hidden = true;}, 2000);
}

function fillSettingsTable() {
    if (!document.getElementById("settings-toggle").checked) {
        return;
    }
    const table = document.getElementById("settingsTable").getElementsByTagName("tbody")[0];
    table.innerHTML = "";
    for (let i = 0; i < window.logs.length; i++) {
        const row = table.insertRow();
        row.insertCell(0).textContent = window.logs[i];
    }
}

function pressPersonSelect() {
    const activeTab = document.querySelector('.tablink.active').value;
    if (activeTab === "tracker") {
        updateTracker();
        document.getElementById("tracker-toggle").checked = false;
    }
    else if (activeTab === "weight") {
        updateWeight();
        document.getElementById("weight-toggle").checked = false;
    }
    else if (activeTab === "settings") {
        const person = getPerson();
        document.getElementById("dailyProtein").placeholder = window.storage[person].proteinSetting;
        document.getElementById("dailyCalories").placeholder = window.storage[person].caloriesSetting;
    }
}

function searchSuggestions(input) {
    const searchInput = document.getElementById("foodNameInput");
    const container = document.getElementById("suggestionsContainer");
    const results = searchArray.filter(item => item.toLowerCase().includes(input.toLowerCase()));
    container.innerHTML = "";
    results.slice(0, 5).forEach(result => {
        const element = document.createElement("div");
        element.classList.add("suggestion");
        element.textContent = result;
        element.onclick = () => {
            searchInput.value = result;
            container.style.display = "none";
        }
        container.appendChild(element);
    });
    if (results.length > 0) {
        container.style.display = "block";
    }
    else {
        container.style.display = "none";
    }
}

async function saveFile() {
    try {
        const handle = await window.showSaveFilePicker({
            suggestedName: "data.txt",
            types: [{ accept: { "text/plain": [".txt"] } }],
        });
        const data = {
            "storage": window.storage,
            "receipes": window.receipes,
            "logs": window.logs
        };
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(data));
        await writable.close();
    } catch (err) {
        console.error("File save failed:", err);
    }
}

async function readFile() {
    try {
        const [fileHandle] = await window.showOpenFilePicker();
        const file = await fileHandle.getFile();
        const text = await file.text();
        console.log("File content:", text);
    } catch (err) {
        console.error("File read failed:", err);
    }
}

// first thing is load data from local storage
loadData();
updateTracker();
const searchArray = [
    "Apple",
    "Banana",
    "Grapes",
    "Orange",
    "Pineapple",
    "Strawberry",
    "Blueberry",
    "Mango",
    "Watermelon",
    "Lemon"
];
document.getElementById("foodNameInput").addEventListener("input", () => {
    const input = document.getElementById("foodNameInput").value;
    if (input) {
        searchSuggestions(input);
    }
    else {
        document.getElementById("suggestionsContainer").style.display = "none";
    }
});

const weightChart = new Chart(document.getElementById('scatter').getContext('2d'), {
    type: 'line',
    data: {
        labels: window.storage.person1.dates,
        datasets: [{
            data: window.storage.person1.weights,
            borderWidth: 1
        }]
    },
    options: {
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(item) {return item.raw.toFixed(1) + " kg";},
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    maxRotation: 60,
                    minRotation: 60
                }
            }
        }
    }
});
