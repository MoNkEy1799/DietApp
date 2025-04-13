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
        document.getElementById("dailyProtein").placeholder = window.storage[window.person].proteinSetting;
        document.getElementById("dailyCalories").placeholder = window.storage[window.person].caloriesSetting;
        document.getElementById("weightGoal").placeholder = window.storage[window.person].weightGoal;
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
    const parts = string.split(".");
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);

    return new Date(year, month, day);
}

function checkDateDifference(date, diff) {
    date.setDate(date.getDate() + diff);
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
    window.trackerTablePerson = undefined;
    window.weightTablePerson = undefined;
    window.person = document.querySelector("input[name='person']:checked").value;

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
                proteinSetting: 0,
                caloriesSetting: 0,
                weightGoal: 0,
                weights: [],
                dates: [],
            },
            person2: {
                proteinYesterday: [],
                caloriesYesterday: [],
                typesYesterday: [],
                proteinToday: [],
                caloriesToday: [],
                typesToday: [],
                proteinTomorrow: [],
                caloriesTomorrow: [],
                typesTomorrow: [],
                proteinSetting: 0,
                caloriesSetting: 0,
                weightGoal: 0,
                weights: [],
                dates: [],
            },
            today: dateToString(window.today),
            foodList: []
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

    // loading on same day --> do nothing
    if (checkDateDifference(stringToDate(window.storage.today), 0)) {
    }
    // loading on next day -> today is becoming yesterday and tomorrow is becoming today
    else if (checkDateDifference(stringToDate(window.storage.today), 1)) {
        for (let name of ["person1", "person2"]) {
            let item = window.storage[name];
            item.proteinYesterday = item.proteinToday;
            item.caloriesYesterday = item.caloriesToday;
            item.typesYesterday = item.typesToday;
            item.proteinToday = item.proteinTomorrow;
            item.caloriesToday = item.caloriesTomorrow;
            item.typesToday = item.typesTomorrow;
            item.proteinTomorrow = [];
            item.caloriesTomorrow = [];
            item.typesTomorrow = [];
        }
    }
    // load two days later -> tomorrow is becoming yesterday
    else if (checkDateDifference(stringToDate(window.storage.today), 2)) {
        for (let name of ["person1", "person2"]) {
            let item = window.storage[name];
            item.proteinYesterday = item.proteinTomorrow;
            item.caloriesYesterday = item.caloriesTomorrow;
            item.typesYesterday = item.typesTomorrow;
            item.proteinToday = [];
            item.caloriesToday = [];
            item.typesToday = [];
            item.proteinTomorrow = [];
            item.caloriesTomorrow = [];
            item.typesTomorrow = [];
        }
    }
    // loading on any later date -> reset everything
    else {
        for (let name of ["person1", "person2"]) {
            let item = window.storage[name];
            item.proteinYesterday = [];
            item.caloriesYesterday = [];
            item.typesYesterday = [];
            item.proteinToday = [];
            item.caloriesToday = [];
            item.typesToday = [];
            item.proteinTomorrow = [];
            item.caloriesTomorrow = [];
            item.typesTomorrow = [];
        }
    }

    // set the new date, save the data and set placeholder values
    window.storage.today = dateToString(window.today);
    saveData(saveStorage=true, saveReceipes=false, saveLogs=false, saveContainers = false);
    document.getElementById("dateDisplay").innerHTML = "<b>Today: </b>" + window.storage.today;
    document.getElementById("weightDate").placeholder = window.storage.today;
    document.getElementById("dailyProtein").placeholder = window.storage.person1.proteinSetting;
    document.getElementById("dailyCalories").placeholder = window.storage.person1.caloriesSetting;
    document.getElementById("weightGoal").placeholder = window.storage.person1.weightGoal;
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
    let type = "Direct input";
    if (!proteinInput.value && !caloriesInput.value) {
        if (!name || !amount) {
            info.innerHTML = "Enter a name and amount!";
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
    const date = document.getElementById("dateSelector").value;
    window.storage[window.person]["protein"+date].push(protein);
    window.storage[window.person]["calories"+date].push(calories);
    window.storage[window.person]["types"+date].push(type);
    saveData(saveStorage=true, saveReceipes = false, saveLogs = false, saveContainers = false);
    logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Tracker</b><br>`+
    `Added value for ${document.querySelector(`label[for=${window.person}]`).innerHTML} (${date}). `+
    `Protein: ${protein.toFixed(1)}, Calories: ${Math.round(calories)}, Type: ${type}`);
    updateTracker();
    window.trackerTablePerson = undefined;
    if (document.getElementById("tracker-toggle").checked) {
        fillTrackerTable();
    }
}

function undoTracker() {
    const date = document.getElementById("dateSelector").value;
    const protein = window.storage[window.person]["protein"+date].pop();
    const calories = window.storage[window.person]["calories"+date].pop();
    const type = window.storage[window.person]["types"+date].pop();
    saveData(saveStorage=true, saveReceipes = false, saveLogs = false, saveContainers = false);
    logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Tracker</b><br>`+
    `Removed value from ${document.querySelector(`label[for=${window.person}]`).innerHTML} (${date}). `+
    `Protein: ${protein.toFixed(1)}, Calories: ${Math.round(calories)}, Type: ${type}`);
    updateTracker();
    window.trackerTablePerson = undefined;
    if (document.getElementById("tracker-toggle").checked) {
        fillTrackerTable();
    }
}

function updateTracker() {
    const date = document.getElementById("dateSelector").value;
    const sumProtein = window.storage[window.person]["protein"+date].reduce((acc, val) => acc + val, 0);
    const sumCalories = window.storage[window.person]["calories"+date].reduce((acc, val) => acc + val, 0);
    document.getElementById("remainHeader").innerHTML = "Remaining for " + date + " :";
    document.getElementById("remainingProtein").innerHTML = Math.round(window.storage[window.person].proteinSetting - sumProtein);
    document.getElementById("remainingCalories").innerHTML = Math.round(window.storage[window.person].caloriesSetting - sumCalories);
}

function fillTrackerTable() {
    if (window.person === window.trackerTablePerson) {
        return;
    }
    window.trackerTablePerson = window.person;
    const table = document.getElementById("trackerTable").getElementsByTagName("tbody")[0];
    const lightColor = getComputedStyle(document.documentElement).getPropertyValue("--lighter_color");
    table.innerHTML = "";
    for (let day of ["Tomorrow", "Today", "Yesterday"]) {
        const proteinList = window.storage[window.person]["protein"+day];
        const calorieList = window.storage[window.person]["calories"+day];
        const typeList = window.storage[window.person]["types"+day];
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
                row.insertCell(0).textContent = proteinList[i].toFixed(1);
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
        info.innerHTML = "No Name given!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    else if (name in window.receipes) {
        info.innerHTML = "Name already exists!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    const proteinInput = document.getElementById("newFoodProtein");
    const protein = Number(proteinInput.value);
    const caloriesInput = document.getElementById("newFoodCalories");
    const calories = Number(caloriesInput.value);
    if (!calories) {
        info.innerHTML = "No calories given!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    nameInput.value = "";
    proteinInput.value = "";
    caloriesInput.value = "";
    window.receipes[name] = {"protein": protein, "calories": calories};
    saveData(saveStorage = false, saveReceipes = true, saveLogs = false, saveContainers = false);
    logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Food</b><br>`+
    `Added. Name: ${name}, Protein: ${protein.toFixed(1)}, Calories: ${Math.round(calories)}`);

    const table = document.getElementById("foodListTable").getElementsByTagName("tbody")[0];
    if (table.rows[0] && table.rows[0].cells[0].textContent === "-") {
        table.deleteRow(0);
    }
    const newRow = table.insertRow();
    const cell = newRow.insertCell(0);
    const div = document.createElement("div");
    const text = document.createElement("span");
    div.classList.add("table-entry");
    text.textContent = name;
    text.onclick = function() {
        showFoodPrompt(name, this.closest("tr").rowIndex);
    };
    div.onclick = function() {
        showFoodPrompt(name, this.closest("tr").rowIndex);
    };
    div.appendChild(text);
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
    let amount = Number(amountInput.value);
    const nameInput = document.getElementById("toReceipeNameInput");
    const name = nameInput.value;
    const info = document.getElementById("addFoodInfo");
    if (!name || !amount) {
        info.innerHTML = "Enter a name and amount!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    if (!(name in window.receipes)) {
        info.innerHTML = "Food name not found!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    amountInput.value = "";
    nameInput.value = "";
    const index = window.storage.foodList.findIndex(entry => name === entry.name);
    if (index === -1) {
        window.storage.foodList.push({"name": name, "amount": amount});
    }
    else {
        window.storage.foodList[index].amount += amount;
    }
    saveData(saveStorage = true, saveReceipes = false, saveLogs = false, saveContainers = false);
    logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Receipe</b><br>`+
    `Added food to list. Name: ${name}, Amount: ${Math.round(amount)}`);

    const table = document.getElementById("receipeTable").getElementsByTagName("tbody")[0];
    let cell, div, text, button;
    if (index === -1) {
        cell = table.insertRow().insertCell(0);
        div = document.createElement("div");
        text = document.createElement("span");
        button = document.createElement("button");
        div.classList.add("table-entry");
        button.classList.add("table-entry-button");
        button.innerHTML = "&times";
        div.appendChild(text);
        div.appendChild(button);
        cell.appendChild(div);
    }
    else {
        cell = table.rows[index].cells[0];
        div = cell.querySelector("div");
        text = cell.querySelector("span");
        button = cell.querySelector("button");
        amount = window.storage.foodList[index].amount;
    }
    button.onclick = function () {
        const rowIndex = this.closest("tr").rowIndex - 1;
        table.deleteRow(rowIndex);
        window.storage.foodList.splice(rowIndex, 1);
        saveData(saveStorage = true, saveReceipes = false, saveLogs = false, saveContainers = false);
        logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Receipe</b><br>`+
        `Removed food from list. Name: ${name}, Amount: ${Math.round(amount)}`);
    };
    text.textContent = `${Math.round(amount)}g ${name}`;
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
        info.innerHTML = "No Name given!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    if (name in window.receipes) {
        info.innerHTML = "Name already exists!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    if (!container) {
        info.innerHTML = "No container given!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    if (!(container in window.containers)) {
        info.innerHTML = "Container not found!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    if (!weight) {
        info.innerHTML = "No weight given!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    nameInput.value = "";
    containerInput.value = "";
    weightInput.value = "";

    let totalProtein = 0;
    let totalCalories = 0;
    window.storage.foodList.forEach((entry) => {
        const food = window.receipes[entry.name];
        totalProtein += food.protein / 100 * entry.amount;
        totalCalories += food.calories / 100 * entry.amount;
    });
    const weightDiff = weight - window.containers[container];
    totalProtein = totalProtein / weightDiff * 100;
    totalCalories = totalCalories / weightDiff * 100;
    window.receipes[name] = {"protein": totalProtein, "calories": totalCalories, "weight": weightDiff, "receipe": [...window.storage.foodList]};
    window.storage.foodList = [];
    saveData(saveStorage = true, saveReceipes = true, saveLogs = false, saveContainers = false);
    logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Receipe</b><br>`+
    `Added. Name: ${name}, Protein: ${totalProtein.toFixed(1)}, Calories: ${Math.round(totalCalories)}`);
    document.getElementById("receipeTable").getElementsByTagName("tbody")[0].innerHTML = "";

    const table = document.getElementById("receipeListTable").getElementsByTagName("tbody")[0];
    if (table.rows[0] && table.rows[0].cells[0].textContent === "-") {
        table.deleteRow(0);
    }
    const newRow = table.insertRow();
    const cell = newRow.insertCell(0);
    const div = document.createElement("div");
    const text = document.createElement("span");
    div.classList.add("table-entry");
    text.textContent = name;
    text.onclick = function() {
        showFoodPrompt(name, this.closest("tr").rowIndex);
    };
    div.onclick = function() {
        showFoodPrompt(name, this.closest("tr").rowIndex);
    };
    div.appendChild(text);
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
    let table;
    for (const [name, entry] of Object.entries(window.receipes)) {
        if ("receipe" in entry) {
            table = receipeTable;
        }
        else {
            table = foodTable;
        }
        const newRow = table.insertRow();
        const cell = newRow.insertCell(0);
        const div = document.createElement("div");
        const text = document.createElement("span");
        div.classList.add("table-entry");
        text.textContent = name;
        text.onclick = function() {
            showFoodPrompt(name, this.closest("tr").rowIndex);
        };
        div.onclick = function() {
            showFoodPrompt(name, this.closest("tr").rowIndex);
        };
        div.appendChild(text);
        cell.appendChild(div);
    
        const rows = Array.from(table.rows);
        const index = rows.findIndex(row => row.cells[0].textContent.localeCompare(name) > 0);
        if (index === -1) {
            table.appendChild(newRow);
        } else {
            table.insertBefore(newRow, rows[index]);
        }
    }
    // insert "-" if table is empty
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
        div.classList.add("table-entry");
        text.textContent = name;
        text.onclick = function() {
            showFoodPrompt(name, this.closest("tr").rowIndex);
        };
        div.onclick = function() {
            showFoodPrompt(name, this.closest("tr").rowIndex);
        };
        div.appendChild(text);
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
    // fill food list for receipe
    table = document.getElementById("receipeTable").getElementsByTagName("tbody")[0];
    table.innerHTML = "";
    window.storage.foodList.forEach(entry => {
        const cell = table.insertRow().insertCell(0);
        const div = document.createElement("div");
        const text = document.createElement("span");
        const button = document.createElement("button");
        div.classList.add("table-entry");
        button.classList.add("table-entry-button");
        button.innerHTML = "&times";
        button.onclick = function () {
            const rowIndex = this.closest("tr").rowIndex - 1;
            table.deleteRow(rowIndex);
            window.storage.foodList.splice(rowIndex, 1);
            saveData(saveStorage = true, saveReceipes = false, saveLogs = false, saveContainers = false);
            logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Receipe</b><br>`+
            `Removed food from list. Name: ${entry.name}, Amount: ${Math.round(entry.amount)}`);
        };
        text.textContent = `${Math.round(entry.amount)}g ${entry.name}`;
        div.appendChild(text);
        div.appendChild(button);
        cell.appendChild(div);
    })
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
    if (!weightInput.value) {
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
    window.storage[window.person].dates.push(date);
    window.storage[window.person].weights.push(weight);
    saveData(saveStorage = true, saveReceipes = false, saveLogs = false, saveContainers = false);
    logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Weight</b><br>`+
    `Added for ${document.querySelector(`label[for=${window.person}]`).innerHTML}. Date: ${date}, Weight: ${weight.toFixed(1)}`);
    updateWeight();
    window.weightTablePerson = undefined;
    if (document.getElementById("weight-toggle").checked) {
        fillWeightTable();
    }
}

function undoWeight() {
    const date = window.storage[window.person].dates.pop();
    const weight = window.storage[window.person].weights.pop();
    saveData(saveStorage=true, saveReceipes = false, saveLogs = false, saveContainers = false, saveContainers = false);
    logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Weight</b><br>`+
    `Removed from ${document.querySelector(`label[for=${window.person}]`).innerHTML}.  Date: ${date}, Weight: ${weight.toFixed(1)}`);
    updateWeight();
    window.weightTablePerson = undefined;
    if (document.getElementById("weight-toggle").checked) {
        fillWeightTable();
    }
}

function updateWeight() {
    const weights = window.storage[window.person].weights;
    const diff = -(weights[weights.length-1] - weights[0]);
    document.getElementById("weightLoss").innerHTML = isNaN(diff) ? "0 kg" : diff.toFixed(1) + " kg";
    const timeDiffs = window.storage[window.person].dates.map(date =>
        (stringToDate(date) - stringToDate(window.storage[window.person].dates[0])) / (1000 * 60 * 60 * 24));
    weightChart.data.datasets[0].data = timeDiffs.map((diff, index) => ({x: diff, y: window.storage[window.person].weights[index]}));
    weightChart.options.plugins.annotation.annotations.goal.yMin = window.storage[window.person].weightGoal;
    weightChart.options.plugins.annotation.annotations.goal.yMax = window.storage[window.person].weightGoal;
    weightChart.options.scales.y.min = window.storage[window.person].weightGoal - 2;
    weightChart.options.scales.x.min = timeDiffs[0];
    weightChart.options.scales.x.max = timeDiffs[timeDiffs.length-1];
    weightChart.update();
}

function fillWeightTable() {
    if (window.person === window.weightTablePerson) {
        return;
    }
    window.weightTablePerson = window.person;
    const table = document.getElementById("weightTable").getElementsByTagName("tbody")[0];
    table.innerHTML = "";
    if (window.storage[window.person].weights.length === 0) {
        const row = table.insertRow();
        row.insertCell(0).textContent = "-";
        row.insertCell(1).textContent = "-";
    }
    for (let i = 0; i < window.storage[window.person].weights.length; i++) {
        const row = table.insertRow();
        row.insertCell(0).textContent = window.storage[window.person].dates[i];
        row.insertCell(1).textContent = window.storage[window.person].weights[i].toFixed(1);
    }
}

function logCommand(log) {
    window.logs.unshift(log);
    if (window.logs.length > 40) {
        window.logs.pop();
    }
    saveData(saveStorage = false, saveReceipes = false, saveLogs = true, saveContainers = false);
}

function changeSettings() {
    const proteinInput = document.getElementById("dailyProtein");
    let protein = Number(proteinInput.value);
    const caloriesInput = document.getElementById("dailyCalories");
    let calories = Number(caloriesInput.value);
    const weightInput = document.getElementById("weightGoal");
    let weight = Number(weightInput.value);
    protein = proteinInput.value ? protein : window.storage[window.person].proteinSetting;
    calories = caloriesInput.value ? calories : window.storage[window.person].caloriesSetting;
    weight = weightInput.value ? weight : window.storage[window.person].weightGoal;
    proteinInput.value = "";
    caloriesInput.value = "";
    weightInput.value = "";
    window.storage[window.person].proteinSetting = protein;
    window.storage[window.person].caloriesSetting = calories;
    window.storage[window.person].weightGoal = weight;
    saveData(saveStorage = true, saveReceipes = false, saveLogs = false, saveContainers = false);
    logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Settings</b><br>`+
    `Changed for ${document.querySelector(`label[for=${window.person}]`).innerHTML}. `+
    `Protein: ${protein.toFixed(1)}, Calories: ${Math.round(calories)}, WeightGoal: ${weight.toFixed(1)}`);
    document.getElementById("dailyProtein").placeholder = window.storage[window.person].proteinSetting;
    document.getElementById("dailyCalories").placeholder = window.storage[window.person].caloriesSetting;
    document.getElementById("weightGoal").placeholder = window.storage[window.person].weightGoal;
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
        info.innerHTML = "Enter a name and weight!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    if (name in window.containers) {
        info.innerHTML = "Name already exists!";
        info.hidden = false;
        setTimeout(() => {info.hidden = true;}, 2000);
        return;
    }
    document.getElementById("containerWeightInput").value = "";
    nameInput.value = "";
    window.containers[name] = weight;
    saveData(saveStorage = false, saveReceipes = false, saveLogs = false, saveContainers = true);
    logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Container</b><br>`+
    `Added. Name: ${name}, Weight: ${Math.round(weight)}`);

    const table = document.getElementById("containerListTable").getElementsByTagName("tbody")[0];
    if (table.rows[0] && table.rows[0].cells[0].textContent === "-") {
        table.deleteRow(0);
    }
    const newRow = table.insertRow();
    const cell = newRow.insertCell(0);
    const div = document.createElement("div");
    const text = document.createElement("span");
    div.classList.add("table-entry");
    text.textContent = name;
    text.onclick = function() {
        showFoodPrompt(name, this.closest("tr").rowIndex);
    };
    div.onclick = function() {
        showFoodPrompt(name, this.closest("tr").rowIndex);
    };
    div.appendChild(text);
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
    const activeTab = document.querySelector(".tablink.active").value;
    window.person = document.querySelector("input[name='person']:checked").value;
    if (activeTab === "tracker") {
        updateTracker();
        document.getElementById("tracker-toggle").checked = false;
    }
    else if (activeTab === "weight") {
        updateWeight();
        document.getElementById("weight-toggle").checked = false;
    }
    else if (activeTab === "settings") {
        document.getElementById("dailyProtein").placeholder = window.storage[window.person].proteinSetting;
        document.getElementById("dailyCalories").placeholder = window.storage[window.person].caloriesSetting;
        document.getElementById("weightGoal").placeholder = window.storage[window.person].weightGoal;
    }
}

function searchSuggestions(input, container, searchArray) {
    let search = input.value.toLowerCase().replace(/[\s()\[\],.]/g, "");
    const results = searchArray.filter(item => item.toLowerCase().replace(/[\s()\[\],.]/g, "").includes(search));
    results.sort((a, b) => a.toLowerCase().replace(/[\s()\[\],.]/g, "").indexOf(search) - b.toLowerCase().replace(/[\s()\[\],.]/g, "").indexOf(search));
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
    if (!suggestionClick) {
        document.getElementById(container).style.display = "none";
    }
    suggestionClick = false;
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
            "containers": window.containers,
        };
        const writable = await fileHandle.createWritable();
        await writable.write(JSON.stringify(data));
        await writable.close();

        document.getElementById("settingsOverlay").style.display = "block";
        const prompt = document.getElementById("settingsPrompt");
        prompt.innerHTML = `<p>Data saved successfully to '${fileHandle.name}'!</p>`;
        prompt.style.display = "block";
        setTimeout(() => {hidePrompt("settings");}, 2000);
    } catch (err) {
        window.alert(`File save failed due to the following error: ${err}`);
    }
}

async function readFile() {
    try {
        const [fileHandle] = await window.showOpenFilePicker();
        const file = await fileHandle.getFile();
        showSettingsPrompt(file);
    } catch (err) {
        window.alert(`File reading failed due to the following error: ${err}`);
    }
}

function showFoodPrompt(item, deleteIndex) {
    document.getElementById("foodOverlay").style.display = "block";
    const prompt = document.getElementById("foodPrompt");
    prompt.innerHTML = `<h3><u>${item}</u></h3>`;
    let food, receipe, container;
    if (item in window.receipes) {
        food = window.receipes[item];
        prompt.innerHTML += `<p>Protein: ${food.protein.toFixed(1)} g</p><p>Calories: ${Math.round(food.calories)} kcal</p>`;
        if ("receipe" in food) {
            receipe = food;
            food = undefined;
            prompt.innerHTML += `<p>Weight: ${receipe.weight} g</p>`;
            prompt.innerHTML += "<h4>Receipe list:</h4>";
            receipe.receipe.forEach((entry) => {
                prompt.innerHTML += `<p>• ${entry.amount}g ${entry.name}</p>`;
            });
        }
    }
    else if (item in window.containers) {
        container = window.containers[item];
        prompt.innerHTML += `<p>Weight: ${container} g</p>`;
    }
    const button = document.createElement("button");
    button.textContent = "Delete";
    button.onclick = function () {
        prompt.innerHTML = "";
        const confirm = document.createElement("button");
        confirm.textContent = "Confirm";
        const cancel = document.createElement("button");
        cancel.textContent = "Cancel";
        cancel.onclick = () => {
            hidePrompt("food");
        }
        if (food) {
            confirm.onclick = () => {
                document.getElementById("foodListTable").deleteRow(deleteIndex);
                delete window.receipes[item];
                saveData(saveStorage = false, saveReceipes = true, saveLogs = true, saveContainers = true);
                logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Food</b><br>`+
                `Removed. Name: ${item}, Protein: ${food.protein.toFixed(1)}, Calories: ${Math.round(food.calories)}`);
                hidePrompt("food");
            }
            prompt.innerHTML = `<p>Delete food ${item}?</p>`;
        }
        else if (receipe) {
            confirm.onclick = () => {
                document.getElementById("receipeListTable").deleteRow(deleteIndex);
                delete window.receipes[item];
                saveData(saveStorage = false, saveReceipes = true, saveLogs = true, saveContainers = true);
                logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Receipe</b><br>`+
                `Removed. Name: ${item}, Protein: ${receipe.protein.toFixed(1)}, Calories: ${Math.round(receipe.calories)}`);
                hidePrompt("food");
            }
            prompt.innerHTML = `<p>Delete receipe ${item}?</p>`;
        }
        else if (container) {
            confirm.onclick = () => {
                document.getElementById("containerListTable").deleteRow(deleteIndex);
                delete window.containers[item];
                saveData(saveStorage = false, saveReceipes = true, saveLogs = true, saveContainers = true);
                logCommand(`<b>${window.storage.today} ${new Date().toLocaleTimeString("de-DE")} - Container</b><br>`+
                `Removed. Name: ${item}, Weight: ${Math.round(container)}`);
                hidePrompt("food");
            }
            prompt.innerHTML = `<p>Delete container ${item}?</p>`;
        }
        const div = document.createElement("div");
        div.classList.add("settings-group");
        div.appendChild(confirm);
        div.appendChild(cancel);
        prompt.appendChild(div);
        prompt.style.display = "block";
    }
    prompt.appendChild(button);
    prompt.style.display = "block";
}

function showTrackerPrompt() {
    const date = document.getElementById("dateSelector").value;
    if (window.storage[window.person]["protein"+date].length === 0) {
        return;
    }
    document.getElementById("trackerOverlay").style.display = "block";
    const prompt = document.getElementById("trackerPrompt");
    prompt.innerHTML = `<p>Delete the last value from ${date}?</p>`;
    const confirm = document.createElement("button");
    confirm.textContent = "Confirm";
    confirm.onclick = () => {
        undoTracker();
        hidePrompt("tracker");
    }
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.onclick = () => {
        hidePrompt("tracker");
    }
    const div = document.createElement("div");
    div.classList.add("settings-group");
    div.appendChild(confirm);
    div.appendChild(cancel);
    prompt.appendChild(div);
    prompt.style.display = "block";
}

function showWeightPrompt() {
    if (window.storage[window.person].weights.length == 0) {
        return;
    }
    document.getElementById("weightOverlay").style.display = "block";
    const prompt = document.getElementById("weightPrompt");
    prompt.innerHTML = `<p>Delete the last weight?</p>`;
    const confirm = document.createElement("button");
    confirm.textContent = "Confirm";
    confirm.onclick = () => {
        undoWeight();
        hidePrompt("weight");
    }
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.onclick = () => {
        hidePrompt("weight");
    }
    const div = document.createElement("div");
    div.classList.add("settings-group");
    div.appendChild(confirm);
    div.appendChild(cancel);
    prompt.appendChild(div);
    prompt.style.display = "block";
}

function showSettingsPrompt(file) {
    document.getElementById("settingsOverlay").style.display = "block";
    const prompt = document.getElementById("settingsPrompt");
    prompt.innerHTML = `<p>Do you want to overwrite the app data with the file: '${file.name}'?</p>`;
    const confirm = document.createElement("button");
    confirm.textContent = "Confirm";
    confirm.onclick = async function() {
        try {
            const text = await file.text();
            const loadedData = JSON.parse(text);
            window.storage = loadedData.storage;
            if (window.storage.today !== dateToString(window.today)) {
                const confirm = window.confirm(`Loaded date (${window.storage.today}) is not the same as current date. Do you want to overwrite the current date?`)
                if (confirm) {
                    // date already overwritten -> need to change placeholder values
                    document.getElementById("dateDisplay").innerHTML = "<b>Today: </b>" + window.storage.today;
                    document.getElementById("weightDate").placeholder = window.storage.today;
                }
                else {
                    // do not overwrite with saved data -> need to set storage back to correct date
                    window.storage.today = dateToString(window.today);
                }
            }
            window.receipes = loadedData.receipes;
            window.logs = loadedData.logs;
            window.containers = loadedData.containers;
            saveData(saveStorage=true, saveReceipes=true, saveLogs=true, saveContainers = true);
            document.getElementById("dailyProtein").placeholder = window.storage[window.person].proteinSetting;
            document.getElementById("dailyCalories").placeholder = window.storage[window.person].caloriesSetting;
            document.getElementById("weightGoal").placeholder = window.storage[window.person].weightGoal;
            window.trackerTablePerson = undefined;
            window.weightTablePerson = undefined;
            prompt.innerHTML = `<p>Data was successfully loaded from '${file.name}'!</p>`;
            prompt.style.display = "block";
            setTimeout(() => {hidePrompt("settings");}, 2000);
            fillReceipeContainerTable();
        } catch (err) {
            window.alert(`File reading failed due to the following error: ${err}`);
        }
    }
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.onclick = () => {
        hidePrompt("settings");
    }
    const div = document.createElement("div");
    div.classList.add("settings-group");
    div.appendChild(confirm);
    div.appendChild(cancel);
    prompt.appendChild(div);
    prompt.style.display = "block";
}

function hidePrompt(name) {
    document.getElementById(`${name}Overlay`).style.display = "none";
    document.getElementById(`${name}Prompt`).style.display = "none";
}

let suggestionClick = false;
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
document.getElementById("suggestionsContainer").addEventListener("mousedown", () => {suggestionClick = true;});
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
document.getElementById("receipeContainer").addEventListener("mousedown", () => {suggestionClick = true;});
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
document.getElementById("containerContainer").addEventListener("mousedown", () => {suggestionClick = true;});

const weightChart = new Chart(document.getElementById("scatter").getContext("2d"), {
    type: "line",
    data: {
        datasets: [{
            borderWidth: 3,
            borderColor: "#2e4065",
            backgroundColor: "#2e4065",
        }]
    },
    options: {
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: item => item.raw.y.toFixed(1) + " kg",
                    title: item => window.storage[window.person].dates[item[0].dataIndex],
                }
            },
            annotation: {
                annotations: {
                    goal: {
                        type: "line",
                        yMin: 0.5,
                        yMax: 0.5,
                        borderColor: "#8b8b8e",
                        borderWidth: 1,
                    }
                }
            }
        },
        scales: {
            x: {
                type: "linear",
                ticks: {
                    maxRotation: 60,
                    minRotation: 60,
                    stepSize: 1,
                    callback: value => {
                        const xValues = Chart.getChart("scatter").data.datasets[0].data.map(item => item.x);
                        const index = xValues.indexOf(value);
                        return index >= 0 ? window.storage[window.person].dates[index] : "";
                    }
                }
            },
            y: {
                ticks: {
                    stepSize: 1,
                }
            }
        }
    }
});
