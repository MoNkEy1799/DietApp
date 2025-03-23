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
    if (window.storage === null) {
        window.storage = {
            person1: {
                proteinYesterday: [1],
                caloriesYesterday: [1],
                proteinToday: [2],
                caloriesToday: [2],
                proteinTomorrow: [3],
                caloriesTomorrow: [3],
                proteinSetting: 120,
                caloriesSetting: 2000,
                weights: [2, 3],
                dates: ["e", "f"],
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
    saveData(saveReceipes=false);
    document.getElementById("dateDisplay").innerHTML = "<b>Today: </b>" + window.storage.today;
}

function saveData(saveStorage = true, saveReceipes = true) {
    if (saveStorage) {
        localStorage.setItem("storage", JSON.stringify(window.storage));
    }
    if (saveReceipes) {
        localStorage.setItem("receipes", JSON.stringify(window.receipes));
    }
}

function getPerson() {
    return document.querySelector("input[name='person']:checked").value;
}

function updateTracker(person, refillTable) {
    const date = document.getElementById("dateSelector").value;
    const protein = window.storage[person]["protein"+date].reduce((acc, val) => acc + val, 0);
    const calories = window.storage[person]["calories"+date].reduce((acc, val) => acc + val, 0);
    document.getElementById("remainingProtein").innerHTML = window.storage[person].proteinSetting - protein;
    document.getElementById("remainingCalories").innerHTML = window.storage[person].caloriesSetting - calories;
    const table = document.getElementById("trackerTable");
    const root = getComputedStyle(document.documentElement);
    const lightColor = root.getPropertyValue('--lighter_color');
    if (refillTable) {
        table.getElementsByTagName("tbody")[0].innerHTML = "";
        for (let day of ["Yesterday", "Today", "Tomorrow"]) {
            const proteinList = window.storage[person]["protein"+day];
            const calorieList = window.storage[person]["calories"+day];
            const row = table.insertRow();
            row.style.backgroundColor = lightColor;
            const cell = row.insertCell(0);
            cell.colSpan = 3;
            cell.textContent = day;
            for (let i = 0; i < proteinList.length; i++) {
                const row = table.insertRow();
                row.insertCell(0).textContent = proteinList[i];
                row.insertCell(1).textContent = calorieList[i];
            }
        }
    }
    else {
        let rowNum = 0;
        for (let day of ["Yesterday", "Today", "Tomorrow"]) {
            rowNum += window.storage[person]["protein"+day].length;
            if (date === day) {
                break;
            }
        }
        const row = table.insertRow(rowNum);
        const index = window.storage[person]["protein"+date].length - 1;
        row.insertCell(0).textContent = window.storage[person]["protein"+date][index];
        row.insertCell(1).textContent = window.storage[person]["calories"+date][index];
    }
}

function updateWeight(person, updatePlot) {
    const table = document.getElementById("weightTable");
    table.getElementsByTagName("tbody")[0].innerHTML = "";
    for (let i = 0; i < window.storage[person].dates.length; i++) {
        const row = table.insertRow();
        row.insertCell(0).textContent = window.storage[person].dates[i];
        row.insertCell(1).textContent = window.storage[person].weights[i];
    }
    if (updatePlot) {
        weightChart.data.labels = window.storage[person].dates;
        weightChart.data.datasets[0] = window.storage[person].weights;
        weightChart.update();
    }
}

function addTrackerValue() {
    const protein = Number(document.getElementById("proteinInput").value());
    const calories = Number(document.getElementById("caloriesInput").value());
    // const amount = Number(document.getElementById("foodAmountInput").value());
    // const name = document.getElementById("foodNameInput").value();
    const person = getPerson();
    const daySelect = document.getElementById("dateSelector").value();
    window.storage[person]["protein" + daySelect].push(protein);
    window.storage[person]["calories" + daySelect].push(calories);
    updateTracker(person, false);
}

function pressPersonSelect() {
    const activeTab = document.querySelector('.tablink.active').value;
    const person = getPerson();
    if (activeTab === "tracker") {
        updateTracker(person, true);
    }
    else if (activeTab === "weight") {
        updateWeight(person, true);
    }
    else if (activeTab === "settings") {
        updateSettings(person);
    }
}

// first thing is load data from local storage
loadData();
updateTracker("person1", true);
updateWeight("person1", false);

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
