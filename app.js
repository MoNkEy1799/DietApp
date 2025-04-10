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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
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

function checkdateDifference(date, diff) {
    date.setDate(date.getDate() - diff);
    return date.getDate() === window.today.getDate() &&
           date.getMonth() === window.today.getMonth() &&
           date.getFullYear() == window.today.getFullYear();
}

function loadData() {
    window.today = new Date();
    try {
        window.data = JSON.parse(localStorage.getItem("data"));
    }
    catch (error) {
        window.data = {
            louis: {
                proteinToday: 0,
                caloriesToday: 0,
                proteinTomorrow: 0,
                caloriesTomorrow: 0,
                proteinSetting: 120,
                caloriesSetting: 2000,
                weights: [],
                dates: [],
            },
            julia: {
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
    if (typeof window.data.today === "undefined") {
        window.data.today = dateToString(window.today);
    }
    // save data is from yesterday
    if (checkdateDifference(window.date.today, 0)) {

    }
    if (checkIfYesterday(window.data.today)) {
        for (let name of ["louis", "julia"]) {
            let item = window.data[name];
            item.proteinToday = item.proteinTomorrow;
            item.caloriesToday = item.caloriesTomorrow;
            item.proteinTomorrow = 0;
            item.caloriesTomorrow = 0;
        }
    }
}

function saveData() {

}

const table = document.getElementById("weightTable");

weightData.forEach(item => {
    const row = table.insertRow();
    row.insertCell(0).textContent = item.date;
    row.insertCell(1).textContent = item.weight;
});

const ctx = document.getElementById('scatter').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: weightData.map(item => item.date),
        datasets: [{
            data: weightData.map(item => item.weight),
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
