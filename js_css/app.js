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
    // set main global variables
    window.today = new Date();
    window.storage = JSON.parse(localStorage.getItem("storage"));
    window.receipes = JSON.parse(localStorage.getItem("receipes"));
    window.containers = JSON.parse(localStorage.getItem("containers"));
    window.logs = JSON.parse(localStorage.getItem("logs"));
    window.foodList = [];
    window.trackerTablePerson = undefined;
    window.weightTablePerson = undefined;

    // load default structure for storage if nothing is saved
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
            today: dateToString(window.today),
        }
    }
    // same for receipes, containers and logs, default is empty
    if (window.receipes === null) {
        window.receipes = {};
    }
    if (window.containers === null) {
        window.containers = {};
    }
    if (window.logs === null) {
        window.logs = [];
    }

    // fill the food/receipe and container table with loaded data
    fillReceipeContainerTable();

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

    // set the new date, save the data and set placeholder values
    window.storage.today = dateToString(window.today);
    saveData(saveStorage=true, saveReceipes=false, saveLogs=false, saveContainers = false);
    document.getElementById("dateDisplay").innerHTML = "<b>Today: </b>" + window.storage.today;
    document.getElementById("dailyProtein").placeholder = window.storage.person1.proteinSetting;
    document.getElementById("dailyCalories").placeholder = window.storage.person1.caloriesSetting;
    document.getElementById("weightDate").placeholder = window.storage.today;
}

function saveData(saveStorage, saveReceipes, saveLogs, saveContainers) {
    if (saveStorage) {
        localStorage.setItem("storage", JSON.stringify(window.storage));
    }
    if (saveReceipes) {
        localStorage.setItem("receipes", JSON.stringify(window.receipes));
    }
    if (saveLogs) {
        localStorage.setItem("logs", JSON.stringify(window.logs));
    }
    if (saveContainers) {
        localStorage.setItem("containers", JSON.stringify(window.containers));
    }
}

function getPerson() {
    return document.querySelector("input[name='person']:checked").value;
}

function addTrackerValue() {
    const proteinInput = document.getElementById("proteinInput");
    let protein = Number(proteinInput.value);
    const caloriesInput = document.getElementById("caloriesInput");
    let calories = Number(caloriesInput.value);
    const amountInput = document.getElementById("foodAmountInput");
    const amount = Number(amountInput.value);
    const nameInput = document.getElementById("foodNameInput");
    const name = nameInput.value;
    const info = document.getElementById("trackerInfo");
    let type = "Direct value input";
    if (!(protein+calories)) {
        if (!name || !amount) {
            info.innerHTML = "Enter a name and amount!"
            info.hidden = false;
            setTimeout(() => {info.hidden = true;}, 2000);
            return;
        }
        if (!(name in window.receipes)) {
            info.innerHTML = "Food/Receipe name not found!"
            info.hidden = false;
            setTimeout(() => {info.hidden = true;}, 2000);
            return;
        }
        protein = window.receipes[name].protein / 100 * amount;
        calories = window.receipes[name].calories / 100 * amount;
        type = `${amount}g ${name}`;
    }
    else if (name || amount) {
        info.innerHTML = "Enter either a value or a food/receipe!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }

    proteinInput.value = "";
    caloriesInput.value = "";
    amountInput.value = "";
    nameInput.value = "";
    const person = getPerson();
    const date = document.getElementById("dateSelector").value;
    window.storage[person]["protein"+date].push(protein);
    window.storage[person]["calories"+date].push(calories);
    window.storage[person]["types"+date].push(type);
    saveData(saveStorage=true, saveReceipes = false, saveLogs = false, saveContainers = false);
    logCommand(`Tracker: added value for ${document.querySelector(`label[for=${person}]`).innerHTML} (${date}). Protein: ${Math.round(protein)}, Calories: ${Math.round(calories)}, Type: ${type}`);
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
    saveData(saveStorage=true, saveReceipes = false, saveLogs = false, saveContainers = false);
    logCommand(`Tracker: removed value from ${document.querySelector(`label[for=${person}]`).innerHTML} (${date}). Protein: ${Math.round(protein)}, Calories: ${Math.round(calories)}, Type: ${type}`);
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
    document.getElementById("remainHeader").innerHTML = "Remaining for " + date + " :";
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
                row.insertCell(0).textContent = Math.round(proteinList[i]);
                row.insertCell(1).textContent = Math.round(calorieList[i]);
                row.insertCell(2).textContent = typeList[i];
            }
        }
    }
}

function addNewFood() {
    const nameInput = document.getElementById("newFoodName");
    const name = nameInput.value.trim();
    const info = document.getElementById("newFoodInfo");
    if (!name) {
        info.innerHTML = "No Name given!"
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    else if (name in window.receipes) {
        info.innerHTML = "Name already exists!"
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    const proteinInput = document.getElementById("newFoodProtein");
    const protein = Number(proteinInput.value);
    const caloriesInput = document.getElementById("newFoodCalories");
    const calories = Number(caloriesInput.value);
    if (!calories) {
        info.innerHTML = "No calories given!"
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    nameInput.value = "";
    proteinInput.value = "";
    caloriesInput.value = "";
    window.receipes[name] = {"protein": protein, "calories": calories};
    saveData(saveStorage = false, saveReceipes = true, saveLogs = false, saveContainers = false);
    logCommand(`Food: added. Name: ${name}, Protein: ${Math.round(protein)}, Calories: ${Math.round(calories)}`);

    const table = document.getElementById("foodListTable").getElementsByTagName("tbody")[0];
    if (table.rows[0] && table.rows[0].cells[0].textContent === "-") {
        table.deleteRow(0);
    }
    const newRow = table.insertRow();
    const cell = newRow.insertCell(0);
    const div = document.createElement("div");
    const text = document.createElement("span");
    const button = document.createElement("button");
    div.classList.add("table-entry");
    button.classList.add("table-entry-button");
    button.innerHTML = "&times";
    button.onclick = function () {
        const confirm = window.confirm(`Do you want to delete the food: '${name}'?`)
        if (confirm) {
            table.deleteRow(this.closest("tr").rowIndex - 1);
            delete window.receipes[name];
            saveData(saveStorage = false, saveReceipes = true, saveLogs = false, saveContainers = false);
            logCommand(`Food: removed. Name: ${name}, Protein: ${Math.round(protein)}, Calories: ${Math.round(calories)}`);
        }
    };
    text.textContent = name;
    text.onclick = () => showFoodPrompt(name);
    div.appendChild(text);
    div.appendChild(button);
    cell.appendChild(div);

    const rows = Array.from(table.rows);
    const index = rows.findIndex(row => row.cells[0].textContent.localeCompare(name) > 0);
    if (index === -1) {
        table.appendChild(newRow);
    } else {
        table.insertBefore(newRow, rows[index]);
    }
}

function addToReceipe() {
    const amountInput = document.getElementById("receipeAmountInput");
    const amount = Number(amountInput.value);
    const nameInput = document.getElementById("toReceipeNameInput");
    const name = nameInput.value;
    const info = document.getElementById("addFoodInfo");
    if (!name || !amount) {
        info.innerHTML = "Enter a name and amount!"
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    if (!(name in window.receipes)) {
        info.innerHTML = "Food name not found!"
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    amountInput.value = "";
    nameInput.value = "";
    window.foodList.push({"name": name, "amount": amount});
    logCommand(`Receipe: added food to list. Name: ${name}, Amount: ${Math.round(amount)}`);

    const table = document.getElementById("receipeTable").getElementsByTagName("tbody")[0];
    if (table.rows[0] && table.rows[0].cells[0].textContent === "-") {
        table.deleteRow(0);
    }
    const cell = table.insertRow().insertCell(0);
    const div = document.createElement("div");
    const text = document.createElement("span");
    const button = document.createElement("button");
    div.classList.add("table-entry");
    button.classList.add("table-entry-button");
    button.innerHTML = "&times";
    button.onclick = function () {
        const confirm = window.confirm(`Do you want to delete the food from the receipe: '${name}'?`)
        if (confirm) {
            const rowIndex = this.closest("tr").rowIndex - 1;
            table.deleteRow(rowIndex);
            window.foodList.splice(rowIndex, 1);
            logCommand(`Receipe: removed food from list. Name: ${name}, Amount: ${Math.round(amount)}`);
        }
    };
    text.textContent = `${Math.round(amount)}g ${name}`;
    div.appendChild(text);
    div.appendChild(button);
    cell.appendChild(div);
}

function addNewReceipe() {
    const nameInput = document.getElementById("receipeNameInput");
    const name = nameInput.value.trim();
    const containerInput = document.getElementById("containerInput");
    const container = containerInput.value;
    const weightInput = document.getElementById("totalWeight");
    const weight = Number(weightInput.value);
    const info = document.getElementById("saveReceipeInfo");
    if (!name) {
        info.innerHTML = "No Name given!"
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    if (name in window.receipes) {
        info.innerHTML = "Name already exists!"
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    if (!container) {
        info.innerHTML = "No container given!"
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    if (!(container in window.containers)) {
        info.innerHTML = "Container not found!"
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    if (!weight) {
        info.innerHTML = "No weight given!"
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    nameInput.value = "";
    containerInput.value = "";
    weightInput.value = "";

    let totalProtein = 0;
    let totalCalories = 0;
    window.foodList.forEach((entry) => {
        const food = window.receipes[entry.name];
        totalProtein += food.protein / 100 * entry.amount;
        totalCalories += food.calories / 100 * entry.amount;
    })
    totalProtein = totalProtein / (weight - window.containers[container]) * 100;
    totalCalories = totalCalories / (weight - window.containers[container]) * 100;
    window.receipes[name] = {"protein": totalProtein, "calories": totalCalories, "receipe": [...window.foodList]};
    saveData(saveStorage = false, saveReceipes = true, saveLogs = false, saveContainers = false);
    logCommand(`Receipe: added. Name: ${name}, Protein: ${Math.round(totalProtein)}, Calories: ${Math.round(totalCalories)}`);
    window.foodList = [];
    document.getElementById("receipeTable").getElementsByTagName("tbody")[0].innerHTML = "";

    const table = document.getElementById("receipeListTable").getElementsByTagName("tbody")[0];
    if (table.rows[0] && table.rows[0].cells[0].textContent === "-") {
        table.deleteRow(0);
    }
    const newRow = table.insertRow();
    const cell = newRow.insertCell(0);
    const div = document.createElement("div");
    const text = document.createElement("span");
    const button = document.createElement("button");
    div.classList.add("table-entry");
    button.classList.add("table-entry-button");
    button.innerHTML = "&times";
    button.onclick = function () {
        const confirm = window.confirm(`Do you want to delete the receipe: '${name}'?`)
        if (confirm) {
            table.deleteRow(this.closest("tr").rowIndex - 1);
            delete window.receipes[name];
            saveData(saveStorage = false, saveReceipes = true, saveLogs = false, saveContainers = false);
            logCommand(`Receipe: removed. Name: ${name}, Protein: ${Math.round(totalProtein)}, Calories: ${Math.round(totalCalories)}`);
        }
    };
    text.textContent = name;
    text.onclick = () => showFoodPrompt(name);
    div.appendChild(text);
    div.appendChild(button);
    cell.appendChild(div);

    const rows = Array.from(table.rows);
    const index = rows.findIndex(row => row.cells[0].textContent.localeCompare(name) > 0);
    if (index === -1) {
        table.appendChild(newRow);
    } else {
        table.insertBefore(newRow, rows[index]);
    }
}

function fillReceipeContainerTable() {
    const foodTable = document.getElementById("foodListTable").getElementsByTagName("tbody")[0];
    foodTable.innerHTML = "";
    const receipeTable = document.getElementById("receipeListTable").getElementsByTagName("tbody")[0];
    receipeTable.innerHTML = "";
    let table, type;
    for (const [name, entry] of Object.entries(window.receipes)) {
        if ("receipe" in entry) {
            table = receipeTable;
            type = "receipe";
        }
        else {
            table = foodTable;
            type = "food";
        }
        const newRow = table.insertRow();
        const cell = newRow.insertCell(0);
        const div = document.createElement("div");
        const text = document.createElement("span");
        const button = document.createElement("button");
        div.classList.add("table-entry");
        button.classList.add("table-entry-button");
        button.innerHTML = "&times";
        button.onclick = function () {
            const confirm = window.confirm(`Do you want to delete the ${type}: '${name}'?`)
            if (confirm) {
                table.deleteRow(this.closest("tr").rowIndex - 1);
                delete window.receipes[name];
                saveData(saveStorage = false, saveReceipes = true, saveLogs = false, saveContainers = false);
                logCommand(`${type.charAt(0).toUpperCase()+type.slice(1)}: removed. Name: ${name}, Protein: ${Math.round(entry.protein)}, Calories: ${Math.round(entry.calories)}`);
            }
        };
        text.textContent = name;
        text.onclick = () => showFoodPrompt(name);
        div.appendChild(text);
        div.appendChild(button);
        cell.appendChild(div);
    
        const rows = Array.from(table.rows);
        const index = rows.findIndex(row => row.cells[0].textContent.localeCompare(name) > 0);
        if (index === -1) {
            table.appendChild(newRow);
        } else {
            table.insertBefore(newRow, rows[index]);
        }
    }
    // insert '-' if table is empty
    if (receipeTable.rows.length === 0) {
        receipeTable.insertRow().insertCell(0).textContent = "-";
    }
    if (foodTable.rows.length === 0) {
        foodTable.insertRow().insertCell(0).textContent = "-";
    }

    // fill container table
    const containerTable = document.getElementById("containerListTable").getElementsByTagName("tbody")[0];
    containerTable.innerHTML = "";
    for (const name of Object.keys(window.containers)) {
        const newRow = containerTable.insertRow();
        const cell = newRow.insertCell(0);
        const div = document.createElement("div");
        const text = document.createElement("span");
        const button = document.createElement("button");
        div.classList.add("table-entry");
        button.classList.add("table-entry-button");
        button.innerHTML = "&times";
        button.onclick = function () {
            const confirm = window.confirm(`Do you want to delete the container: '${name}'?`)
            if (confirm) {
                containerTable.deleteRow(this.closest("tr").rowIndex - 1);
                delete window.containers[name];
                saveData(saveStorage = false, saveReceipes = false, saveLogs = false, saveContainers = true);
                logCommand(`Container: removed. Name: ${name}, Weight: ${Math.round(window.containers[name])}`);
            }
        };
        text.textContent = name;
        text.onclick = () => showFoodPrompt(name);
        div.appendChild(text);
        div.appendChild(button);
        cell.appendChild(div);
    
        const rows = Array.from(containerTable.rows);
        const index = rows.findIndex(row => row.cells[0].textContent.localeCompare(name) > 0);
        if (index === -1) {
            containerTable.appendChild(newRow);
        } else {
            containerTable.insertBefore(newRow, rows[index]);
        }
    }
    if (containerTable.rows.length === 0) {
        containerTable.insertRow().insertCell(0).textContent = "-";
    }
}

function expandToggle(toggle) {
    if (toggle === "food") {
        document.getElementById("receipe-toggle").checked = false;
        document.getElementById("container-toggle").checked = false;
    }
    else if (toggle === "receipe") {
        document.getElementById("food-toggle").checked = false;
        document.getElementById("container-toggle").checked = false;
    }
    else if (toggle === "container") {
        document.getElementById("food-toggle").checked = false;
        document.getElementById("receipe-toggle").checked = false;
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
    let date = dateInput.value;
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
    saveData(saveStorage = true, saveReceipes = false, saveLogs = false, saveContainers = false);
    logCommand(`Weight: added for ${document.querySelector(`label[for=${person}]`).innerHTML}. Date: ${date}, Weight: ${weight.toFixed(1)}`);
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
    saveData(saveStorage=true, saveReceipes = false, saveLogs = false, saveContainers = false, saveContainers = false);
    logCommand(`Weight: removed from ${document.querySelector(`label[for=${person}]`).innerHTML}. Weight: ${weight.toFixed(1)}, Date: ${date}`);
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
    if (window.storage[person].weights.length === 0) {
        const row = table.insertRow();
        row.insertCell(0).textContent = "-";
        row.insertCell(1).textContent = "-";
    }
    for (let i = 0; i < window.storage[person].weights.length; i++) {
        const row = table.insertRow();
        row.insertCell(0).textContent = window.storage[person].dates[i];
        row.insertCell(1).textContent = window.storage[person].weights[i].toFixed(1);
    }
}

function logCommand(log) {
    colon_index = log.indexOf(":");
    log = `<b>${log.slice(0, colon_index)}</b>${log.slice(colon_index)}`
    window.logs.unshift(log);
    if (window.logs.length > 20) {
        window.logs.pop();
    }
    saveData(saveStorage = false, saveReceipes = false, saveLogs = true, saveContainers = false);
}

function changeSettings() {
    const person = getPerson();
    const proteinInput = document.getElementById("dailyProtein");
    let protein = Number(proteinInput.value);
    const caloriesInput = document.getElementById("dailyCalories");
    let calories = Number(caloriesInput.value);
    protein = protein ? protein : window.storage[person].proteinSetting;
    calories = calories ? calories : window.storage[person].caloriesSetting;
    proteinInput.value = "";
    caloriesInput.value = "";
    window.storage[person].proteinSetting = protein;
    window.storage[person].caloriesSetting = calories;
    saveData(saveStorage = true, saveReceipes = false, saveLogs = false, saveContainers = false);
    logCommand(`Settings: changed dailys for ${document.querySelector(`label[for=${person}]`).innerHTML}. Protein: ${Math.round(protein)}, Calories: ${Math.round(calories)}`);
    const info = document.getElementById("settingsInfo");
    info.hidden = false;
    setTimeout(() => {info.hidden = true;}, 2000);
}

function addContainer() {
    const weightInput = document.getElementById("containerWeightInput");
    const weight = Number(weightInput.value);
    const nameInput = document.getElementById("containerNameInput");
    const name = nameInput.value.trim();
    const info = document.getElementById("saveContainerInfo");
    if (!name || !weight) {
        info.innerHTML = "Enter a name and weight!"
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    if (name in window.containers) {
        info.innerHTML = "Name already exists!"
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    document.getElementById("containerWeightInput").value = "";
    nameInput.value = "";
    window.containers[name] = weight;
    saveData(saveStorage = false, saveReceipes = false, saveLogs = false, saveContainers = true);
    logCommand(`Container: added. Name: ${name}, Weight: ${Math.round(weight)}`);

    const table = document.getElementById("containerListTable").getElementsByTagName("tbody")[0];
    if (table.rows[0] && table.rows[0].cells[0].textContent === "-") {
        table.deleteRow(0);
    }
    const newRow = table.insertRow();
    const cell = newRow.insertCell(0);
    const div = document.createElement("div");
    const text = document.createElement("span");
    const button = document.createElement("button");
    div.classList.add("table-entry");
    button.classList.add("table-entry-button");
    button.innerHTML = "&times";
    button.onclick = function () {
        const confirm = window.confirm(`Do you want to delete the container: '${name}'?`)
        if (confirm) {
            table.deleteRow(this.closest("tr").rowIndex - 1);
            delete window.containers[name];
            saveData(saveStorage = false, saveReceipes = false, saveLogs = false, saveContainers = true);
            logCommand(`Container: removed. Name: ${name}, Weight: ${Math.round(weight)}`);
        }
    };
    text.textContent = name;
    text.onclick = () => showFoodPrompt(name);
    div.appendChild(text);
    div.appendChild(button);
    cell.appendChild(div);

    const rows = Array.from(table.rows);
    const index = rows.findIndex(row => row.cells[0].textContent.localeCompare(name) > 0);
    if (index === -1) {
        table.appendChild(newRow);
    } else {
        table.insertBefore(newRow, rows[index]);
    }
}

function scrollToTable(table) {
    const element = document.getElementById(table);
    window.scrollTo({top: element.offsetTop, behavior: "smooth"});
}

function fillSettingsTable() {
    if (!document.getElementById("settings-toggle").checked) {
        return;
    }
    const table = document.getElementById("settingsTable").getElementsByTagName("tbody")[0];
    table.innerHTML = "";
    for (let i = 0; i < window.logs.length; i++) {
        table.insertRow().insertCell(0).innerHTML = window.logs[i];
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
    results.sort((a, b) => a.indexOf(input.value) - b.indexOf(input.value));
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

function hideSuggestions(container) {
    document.getElementById(container).style.display = "none";
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
            "logs": window.logs,
            "containers": window.containers
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
            window.storage.today = dateToString(window.today);
            window.receipes = loadedData.receipes;
            window.logs = loadedData.logs;
            window.containers = loadedData.containers;
            saveData(saveStorage=true, saveReceipes=true, saveLogs=true, saveContainers = true);
            window.alert(`Data was successfully loaded from '${file.name}'!`)
        }
        fillReceipeContainerTable();
    } catch (err) {
        window.alert(`File reading failed due to the following error: ${err}`);
    }
}

function showFoodPrompt(item) {
    document.getElementById("foodOverlay").style.display = "block";
    const prompt = document.getElementById("foodPrompt");
    prompt.innerHTML = `<h3>${item}</h3>`
    if (item in window.receipes) {
        const food = window.receipes[item];
        prompt.innerHTML += `<p>Protein: ${food.protein}</p><p>Calories: ${food.calories}</p>`;
        if ("receipe" in food) {
            prompt.innerHTML += "<p>Receipe list:</p>"
            food.receipe.forEach((entry) => {
                prompt.innerHTML += `<p>- ${entry.amount}g ${entry.name}</p>`
            })
        }
    }
    else if (item in window.containers) {
        prompt.innerHTML += `<p>Weight: ${window.containers[item]}</p>`;
    }
    prompt.style.display = "block";
}

function hidePrompt(prompt) {
    document.getElementById("foodOverlay").style.display = "none";
    document.getElementById(prompt).style.display = "none";
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
