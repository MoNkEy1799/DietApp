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
    window.containers = {
        "Pan (small)": 666,
        "Pan (mid)": 882,
        "Pan (big)": 1147,
        "Pan (deep)": 1288,
        "Pot (small)": 693,
        "Pot (mid)": 1005,
        "Pot (big)": 1304,
        "Pot old (sauce)": 602,
        "Pot old (small)": 846,
        "Pot old (mid)": 1114,
        "Pot old (big)": 1221,
        "Pot old (deep)": 1708,
        "Backing Pan (small)": 402,
        "Backing Pan (big)": 527,
        "Backing Pan (silicone)": 305,
        "Rice Cooker": 310,
        "Mixer Ninja (small)": 0,
        "Mixer Ninja (mid)": 0,
        "Mixer Ninja (big)": 0,
        "Le Creuset (Pan)": 2895,
        "Le Creuset (Pot)": 3041,
        "Le Creuset (Roaster)": 4104,
        "Backing Tray": 1239,
        "Plastic Bowl (small)": 73,
        "Plastic Bowl (mid)": 115,
        "Plastic Bowl (big)": 170,
        "Plastic Bowl (very big)": 252,
        "Plastic Bowl (blue)": 195,
        "Tin Bowl (small)": 165,
        "Tin Bowl (big)": 441,
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
    saveData(saveStorage=true, saveReceipes=false, saveLogs=false);
    document.getElementById("dateDisplay").innerHTML = "<b>Today: </b>" + window.storage.today;
    document.getElementById("dailyProtein").placeholder = window.storage.person1.proteinSetting;
    document.getElementById("dailyCalories").placeholder = window.storage.person1.caloriesSetting;
    document.getElementById("weightDate").placeholder = window.storage.today;
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
    let protein = Number(document.getElementById("proteinInput").value);
    let calories = Number(document.getElementById("caloriesInput").value);
    const amount = Number(document.getElementById("foodAmountInput").value);
    const name = document.getElementById("foodNameInput").value;
    const info = document.getElementById("trackerInfo");
    let type = "Direct value input";
    if (!(protein+calories)) {
        if (!name || !amount) {
            info.innerHTML = "Enter a name and amount!"
            info.hidden = false;
            setTimeout(() => {document.getElementById("trackerInfo").hidden = true;}, 2000);
            return;
        }
        if (!(name in window.receipes)) {
            info.innerHTML = "Food name not found!"
            info.hidden = false;
            setTimeout(() => {document.getElementById("trackerInfo").hidden = true;}, 2000);
            return;
        }
        protein = window.receipes[name].protein / 100 * amount;
        calories = window.receipes[name].calories / 100 * amount;
        type = `${amount}g ${name}`;
    }
    else if (name || amount) {
        info.innerHTML = "Enter either a value or a food!";
        info.hidden = false;
        setTimeout(() => {document.getElementById("trackerInfo").hidden = true;}, 2000);
        return;
    }

    document.getElementById("proteinInput").value = "";
    document.getElementById("caloriesInput").value = "";
    document.getElementById("foodAmountInput").value = "";
    document.getElementById("foodNameInput").value = "";
    const person = getPerson();
    const date = document.getElementById("dateSelector").value;
    window.storage[person]["protein"+date].push(protein);
    window.storage[person]["calories"+date].push(calories);
    window.storage[person]["types"+date].push(type);
    saveData(saveStorage=true, saveReceipes = false, saveLogs = false);
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
    saveData(saveStorage=true, saveReceipes = false, saveLogs = false);
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
    document.getElementById("remainingProtein").innerHTML = Math.round(window.storage[person].proteinSetting - sumProtein);
    document.getElementById("remainingCalories").innerHTML = Math.round(window.storage[person].caloriesSetting - sumCalories);
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

function addNewFood() {
    const nameInput = document.getElementById("newFoodName");
    const name = nameInput.value;
    const info = document.getElementById("newFoodInfo");
    if (!name) {
        info.innerHTML = "No Name given!"
        info.hidden = false;
        setTimeout(() => {document.getElementById("weightInfo").hidden = true;}, 2000);
        return;
    }
    else if (name in window.receipes) {
        info.innerHTML = "Name already exists!"
        info.hidden = false;
        setTimeout(() => {document.getElementById("weightInfo").hidden = true;}, 2000);
        return;
    }
    const proteinInput = document.getElementById("newFoodProtein");
    const protein = Number(proteinInput.value);
    const caloriesInput = document.getElementById("newFoodCalories");
    const calories = Number(caloriesInput.value);
    if (!calories) {
        info.innerHTML = "No calories given!"
        info.hidden = false;
        setTimeout(() => {document.getElementById("weightInfo").hidden = true;}, 2000);
        return;
    }
    nameInput.value = "";
    proteinInput.value = "";
    caloriesInput.value = "";
    window.receipes[name] = {"protein": protein, "calories": calories};
    saveData(saveStorage = false, saveReceipes = true, saveLogs = false);
    logCommand(`Food: added new food/receipe. Name: ${name}, Protein: ${protein}, Calories: ${calories}`);
    // updateWeight();
    // window.weightTablePerson = undefined;
    // if (document.getElementById("weight-toggle").checked) {
    //     fillWeightTable();
    // }
}

function undoNewFood() {
    const person = getPerson();
    const date = window.storage[person].dates.pop();
    const weight = window.storage[person].weights.pop();
    saveData(saveStorage = true, saveReceipes = false, saveLogs = false);
    logCommand(`Weight: removed value from ${document.querySelector(`label[for=${person}]`).innerHTML}. Weight: ${weight}, Date: ${date}`);
    updateWeight();
    window.weightTablePerson = undefined;
    if (document.getElementById("weight-toggle").checked) {
        fillWeightTable();
    }
}

function addWeightValue() {
    const weightInput = document.getElementById("weightInput");
    const weight = Number(weightInput.value);
    const info = document.getElementById("weightInfo");
    if (!weight) {
        info.innerHTML = "No weight given!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    const dateInput = document.getElementById("weightDate");
    const date = dateInput.value;
    if (!date) {
        date = window.storage.today;
    }
    else if (!/^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.(\d{4})$/.test(date)) {
        info.innerHTML = "Invalid date!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    dateInput.value = "";
    weightInput.value = "";
    const person = getPerson();
    window.storage[person].dates.push(date);
    window.storage[person].weights.push(weight);
    saveData(saveStorage = true, saveReceipes = false, saveLogs = false);
    logCommand(`Weight: added value for ${document.querySelector(`label[for=${person}]`).innerHTML}. Date: ${date}, Weight: ${weight}`);
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
    saveData(saveStorage=true, saveReceipes = false, saveLogs = false);
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
    saveData(saveStorage = false, saveReceipes = false, saveLogs = true);
}

function changeSettings() {
    const person = getPerson();
    let protein = Number(document.getElementById("dailyProtein").value);
    let calories = Number(document.getElementById("dailyCalories").value);
    protein = protein ? protein : window.storage[person].proteinSetting;
    calories = calories ? calories : window.storage[person].caloriesSetting;
    window.storage[person].proteinSetting = protein;
    window.storage[person].caloriesSetting = calories;
    saveData(saveStorage = true, saveReceipes = false, saveLogs = false);
    logCommand(`Settings: changed dailys for ${document.querySelector(`label[for=${person}]`).innerHTML}. Protein: ${protein}, Calories: ${calories}`);
    const info = document.getElementById("settingsInfo");
    info.hidden = false;
    setTimeout(() => {info.hidden = true;}, 2000);
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

function searchSuggestions(input, container, searchArray) {
    const results = searchArray.filter(item => item.toLowerCase().includes(input.value.toLowerCase()));
    container.innerHTML = "";
    results.slice(0, 5).forEach(result => {
        const element = document.createElement("div");
        element.classList.add("suggestion");
        element.textContent = result;
        element.onclick = () => {
            input.value = result;
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
        const fileHandle = await window.showSaveFilePicker({
            suggestedName: "dietAppData.txt",
            types: [{ accept: { "text/plain": [".txt"] } }],
        });
        const data = {
            "storage": window.storage,
            "receipes": window.receipes,
            "logs": window.logs
        };
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(data));
        await writable.close();
        window.alert(`File saved successfully to '${fileHandle.name}'!`);
    } catch (err) {
        window.alert(`File save failed due to the following error: ${err}`);
    }
}

async function readFile() {
    try {
        const [fileHandle] = await window.showOpenFilePicker();
        const file = await fileHandle.getFile();
        const text = await file.text();
        const confirm = window.confirm(`Do you want to overwrite the app data with the file: '${file.name}'?`)
        if (confirm) {
            const loadedData = JSON.parse(text);
            window.storage = loadedData.storage;
            window.receipes = loadedData.receipes;
            window.logs = loadedData.logs;
            saveData(saveStorage=true, saveReceipes=true, saveLogs=true);
            window.alert(`Data was successfully loaded from '${file.name}'!`)
        }
        return;
    } catch (err) {
        window.alert(`File reading failed due to the following error: ${err}`);
    }
}

// first thing is load data from local storage
loadData();
updateTracker();
document.getElementById("foodNameInput").addEventListener("input", () => {
    const input = document.getElementById("foodNameInput");
    const container = document.getElementById("suggestionsContainer");
    if (input.value) {
        searchSuggestions(input, container, Object.keys(window.receipes));
    }
    else {
        container.style.display = "none";
    }
});
document.getElementById("removeInput").addEventListener("input", () => {
    const input = document.getElementById("removeInput");
    const container = document.getElementById("removeContainer");
    if (input.value) {
        searchSuggestions(input, container, Object.keys(window.receipes));
    }
    else {
        container.style.display = "none";
    }
});
document.getElementById("toReceipeNameInput").addEventListener("input", () => {
    const input = document.getElementById("toReceipeNameInput");
    const container = document.getElementById("receipeContainer");
    if (input.value) {
        searchSuggestions(input, container, Object.keys(window.receipes));
    }
    else {
        container.style.display = "none";
    }
});
document.getElementById("containerInput").addEventListener("input", () => {
    const input = document.getElementById("containerInput");
    const container = document.getElementById("containerContainer");
    if (input.value) {
        searchSuggestions(input, container, Object.keys(window.containers));
    }
    else {
        container.style.display = "none";
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
