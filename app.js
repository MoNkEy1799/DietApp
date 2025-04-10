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
    if (window.storage === null) {
        window.storage = {
            louis: {
                proteinYesterday: 0,
                caloriesYesterday: 0,
                proteinToday: 0,
                caloriesToday: 0,
                proteinTomorrow: 0,
                caloriesTomorrow: 0,
                proteinSetting: 120,
                caloriesSetting: 2000,
                weights: [2, 3],
                dates: ["e", "f"],
            },
            julia: {
                proteinYesterday: 0,
                caloriesYesterday: 0,
                proteinToday: 0,
                caloriesToday: 0,
                proteinTomorrow: 0,
                caloriesTomorrow: 0,
                proteinSetting: 90,
                caloriesSetting: 1500,
                weights: [],
                dates: [],
            },
            receipes: [],
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
        for (let name of ["louis", "julia"]) {
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
        for (let name of ["louis", "julia"]) {
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
    saveData();
    document.getElementById("dateDisplay").innerHTML = "<b>Today: </b>" + window.storage.today;
}

function saveData() {
    localStorage.setItem("data", JSON.stringify(window.storage));
}

function updateTracker(person) {
    const date = document.getElementById("dateSelector").value;
    document.getElementById("remainingProtein").innerHTML = window.storage[person].proteinSetting - window.storage[person]["protein"+date];
    document.getElementById("remainingCalories").innerHTML = window.storage[person].caloriesSetting - window.storage[person]["calories"+date];
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

function pressPersonSelect() {
    const activeTab = document.querySelector('.tablink.active').value;
    const person = document.querySelector("input[name='person']:checked").value;
    if (activeTab === "tracker") {
        updateTracker(person);
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
updateTracker("louis");
updateWeight("louis");

const weightChart = new Chart(document.getElementById('scatter').getContext('2d'), {
    type: 'line',
    data: {
        labels: window.storage.louis.dates,
        datasets: [{
            data: window.storage.louis.weights,
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

// const table = document.getElementById("weightTable");

// weightData.forEach(item => {
//     const row = table.insertRow();
//     row.insertCell(0).textContent = item.date;
//     row.insertCell(1).textContent = item.weight;
// });

// const ctx = document.getElementById('scatter').getContext('2d');
// const myChart = new Chart(ctx, {
//     type: 'line',
//     data: {
//         labels: weightData.map(item => item.date),
//         datasets: [{
//             data: weightData.map(item => item.weight),
//             borderWidth: 1
//         }]
//     },
//     options: {
//         plugins: {
//             legend: {
//                 display: false
//             }
//         },
//         scales: {
//             x: {
//                 ticks: {
//                     maxRotation: 60,
//                     minRotation: 60
//                 }
//             }
//         }
//     }
// });
