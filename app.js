let totalAmount = 0;
let totalIncome = 0;
let budget = 0;
let currentType = 'expense'; // 默認為支出
let chart;

window.onload = function() {
    loadData();
    initializeChart();
    document.getElementById('expense-button').classList.add('active');

    const savedTheme = localStorage.getItem('preferredTheme');
    if (savedTheme) {
        document.getElementById('theme').value = savedTheme;
        applyTheme(savedTheme);
    } else {
        applyTheme('dark');
        document.getElementById('theme').value = 'dark';
    }

    const savedLayout = localStorage.getItem('preferredLayout');
    if (savedLayout) {
        document.getElementById('layout').value = savedLayout;
        applyLayout(savedLayout);
    } else {
        applyLayout('wide');
        document.getElementById('layout').value = 'wide';
    }
};

// 監聽支出和收入按鈕
document.getElementById('expense-button').addEventListener('click', function () {
    currentType = 'expense';
    this.classList.add('active');
    document.getElementById('income-button').classList.remove('active');
});

document.getElementById('income-button').addEventListener('click', function () {
    currentType = 'income';
    this.classList.add('active');
    document.getElementById('expense-button').classList.remove('active');
});

function saveTransaction() {
    if (currentType === 'expense') {
        addExpense();
    } else if (currentType === 'income') {
        addIncome();
    } else {
        alert('請選擇支出或收入類別！');
    }
}


function addExpense() {
    let categorySelect = document.getElementById("category");
    let category = categorySelect.options[categorySelect.selectedIndex].text;
    let amount = parseFloat(document.getElementById("amount").value);
    let note = document.getElementById("note").value;
    let date = document.getElementById("transaction-date").value;

    if ( isNaN(amount) || amount <= 0 || date === "") {
        alert("請輸入完整且有效的支出金額和日期！");
        return;
    }

    let expense = { id: Date.now(), category, amount, note, date };

    let expenseList = document.getElementById("expense-list");
    let listItem = document.createElement("li");
    listItem.innerHTML = `${category}: $${amount.toFixed(2)} <br> 備註：${note} <br> 日期：${date}`;
    listItem.classList.add("expense-item");

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "刪除";
    deleteButton.style.marginLeft = "10px";
    deleteButton.addEventListener("click", function () {
        expenseList.removeChild(listItem);
        totalAmount -= expense.amount;
        document.getElementById("total-amount").innerText = totalAmount.toFixed(2);
        updateNetAmount();
        updateChart();

        let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
        expenses = expenses.filter(e => e.id !== expense.id);
        localStorage.setItem("expenses", JSON.stringify(expenses));
    });

    let editButton = document.createElement("button");
    editButton.innerText = "編輯";
    editButton.style.marginLeft = "10px";
    editButton.addEventListener("click", function () {
        editExpense(expense, listItem);
    });

    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(editButton);

    listItem.appendChild(buttonContainer);
    expenseList.appendChild(listItem);

    totalAmount += amount;
    document.getElementById("total-amount").innerText = totalAmount.toFixed(2);
    updateNetAmount();
    updateChart();

    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    expenses.push(expense);
    localStorage.setItem("expenses", JSON.stringify(expenses));

    if (budget > 0 && totalAmount > budget) {
        alert("警告：您的支出已超過預算，請三思後再購買！");
    }

    // 清空輸入框
    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";
    document.getElementById("transaction-date").value = "";
}

function editExpense(expense, listItem) {
    let categorySelect = document.createElement("select");
    categorySelect.innerHTML = document.getElementById("category").innerHTML;

    for (let i = 0; i < categorySelect.options.length; i++) {
        if (categorySelect.options[i].text === expense.category) {
            categorySelect.selectedIndex = i;
            break;
        }
    }

    let amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.value = expense.amount;

    let noteInput = document.createElement("input");
    noteInput.type = "text";
    noteInput.value = expense.note;

    let dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = expense.date;

    let saveButton = document.createElement("button");
    saveButton.innerText = "保存";
    saveButton.style.marginLeft = "10px";
    saveButton.addEventListener("click", function () {
        let newCategory = categorySelect.options[categorySelect.selectedIndex].text;
        let newDate = dateInput.value;
        saveEditedExpense(expense, newCategory, parseFloat(amountInput.value), noteInput.value, newDate, listItem);
    });

    listItem.innerHTML = '';
    listItem.appendChild(categorySelect);
    listItem.appendChild(amountInput);
    listItem.appendChild(noteInput);
    listItem.appendChild(dateInput);
    listItem.appendChild(saveButton);
}

function saveEditedExpense(expense, newCategory, newAmount, newNote, newDate, listItem) {
    if (isNaN(newAmount) || newAmount <= 0 || newDate === "") {
        alert("請輸入完整且有效的支出金額和日期！");
        return;
    }

    totalAmount -= expense.amount;
    totalAmount += newAmount;
    document.getElementById("total-amount").innerText = totalAmount.toFixed(2);
    updateNetAmount();
    updateChart();

    expense.category = newCategory;
    expense.amount = newAmount;
    expense.note = newNote;
    expense.date = newDate;

    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let index = expenses.findIndex(e => e.id === expense.id);
    if (index !== -1) {
        expenses[index] = expense;
        localStorage.setItem("expenses", JSON.stringify(expenses));
    }

    listItem.innerHTML = `${expense.category}: $${expense.amount.toFixed(2)} <br> 備註：${expense.note} <br> 日期：${expense.date}`;
    listItem.classList.add("expense-item");

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "刪除";
    deleteButton.style.marginLeft = "10px";
    deleteButton.addEventListener("click", function () {
        let expenseList = document.getElementById("expense-list");
        expenseList.removeChild(listItem);
        totalAmount -= expense.amount;
        document.getElementById("total-amount").innerText = totalAmount.toFixed(2);
        updateNetAmount();
        updateChart();

        let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
        expenses = expenses.filter(e => e.id !== expense.id);
        localStorage.setItem("expenses", JSON.stringify(expenses));
    });

    let editButton = document.createElement("button");
    editButton.innerText = "編輯";
    editButton.style.marginLeft = "10px";
    editButton.addEventListener("click", function () {
        editExpense(expense, listItem);
    });

    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(editButton);

    listItem.appendChild(buttonContainer);
}

function addIncome() {
    let categorySelect = document.getElementById("category");
    let category = categorySelect.options[categorySelect.selectedIndex].text;
    let amount = parseFloat(document.getElementById("amount").value);
    let note = document.getElementById("note").value;
    let date = document.getElementById("transaction-date").value;

    if (isNaN(amount) || amount <= 0 || date === "") {
        alert("請輸入完整且有效的收入金額和日期！");
        return;
    }

    let income = { id: Date.now(), category, amount, note, date };

    let incomeList = document.getElementById("income-list");
    let listItem = document.createElement("li");
    listItem.innerHTML = `${category}: $${amount.toFixed(2)} <br> 備註：${note} <br> 日期：${date}`;
    listItem.classList.add("income-item");

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "刪除";
    deleteButton.style.marginLeft = "10px";
    deleteButton.addEventListener("click", function () {
        incomeList.removeChild(listItem);
        totalIncome -= income.amount;
        document.getElementById("total-income").innerText = totalIncome.toFixed(2);
        updateNetAmount();
        updateChart();

        let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
        incomes = incomes.filter(i => i.id !== income.id);
        localStorage.setItem("incomes", JSON.stringify(incomes));
    });

    let editButton = document.createElement("button");
    editButton.innerText = "編輯";
    editButton.style.marginLeft = "10px";
    editButton.addEventListener("click", function () {
        editIncome(income, listItem);
    });

    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(editButton);

    listItem.appendChild(buttonContainer);
    incomeList.appendChild(listItem);

    totalIncome += amount;
    document.getElementById("total-income").innerText = totalIncome.toFixed(2);
    updateNetAmount();
    updateChart();

    let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
    incomes.push(income);
    localStorage.setItem("incomes", JSON.stringify(incomes));

    // 清空輸入框
    document.getElementById("amount").value = "";
    document.getElementById("note").value = "";
    document.getElementById("transaction-date").value = "";
}

function editIncome(income, listItem) {
    let categorySelect = document.createElement("select");
    categorySelect.innerHTML = document.getElementById("category").innerHTML;

    for (let i = 0; i < categorySelect.options.length; i++) {
        if (categorySelect.options[i].text === income.category) {
            categorySelect.selectedIndex = i;
            break;
        }
    }

    let amountInput = document.createElement("input");
    amountInput.type = "number";
    amountInput.value = income.amount;

    let noteInput = document.createElement("input");
    noteInput.type = "text";
    noteInput.value = income.note;

    let dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.value = income.date;

    let saveButton = document.createElement("button");
    saveButton.innerText = "保存";
    saveButton.style.marginLeft = "10px";
    saveButton.addEventListener("click", function () {
        let newCategory = categorySelect.options[categorySelect.selectedIndex].text;
        let newDate = dateInput.value;
        saveEditedIncome(income, newCategory, parseFloat(amountInput.value), noteInput.value, newDate, listItem);
    });

    listItem.innerHTML = '';
    listItem.appendChild(categorySelect);
    listItem.appendChild(amountInput);
    listItem.appendChild(noteInput);
    listItem.appendChild(dateInput);
    listItem.appendChild(saveButton);
}

function saveEditedIncome(income, newCategory, newAmount, newNote, newDate, listItem) {
    if (isNaN(newAmount) || newAmount <= 0 || newDate === "") {
        alert("請輸入完整且有效的收入金額和日期！");
        return;
    }

    totalIncome -= income.amount;
    totalIncome += newAmount;
    document.getElementById("total-income").innerText = totalIncome.toFixed(2);
    updateNetAmount();
    updateChart();

    income.category = newCategory;
    income.amount = newAmount;
    income.note = newNote;
    income.date = newDate;

    let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
    let index = incomes.findIndex(i => i.id === income.id);
    if (index !== -1) {
        incomes[index] = income;
        localStorage.setItem("incomes", JSON.stringify(incomes));
    }

    listItem.innerHTML = `${income.category}: $${income.amount.toFixed(2)} <br> 備註：${income.note} <br> 日期：${income.date}`;
    listItem.classList.add("income-item");

    let deleteButton = document.createElement("button");
    deleteButton.innerText = "刪除";
    deleteButton.style.marginLeft = "10px";
    deleteButton.addEventListener("click", function () {
        let incomeList = document.getElementById("income-list");
        incomeList.removeChild(listItem);
        totalIncome -= income.amount;
        document.getElementById("total-income").innerText = totalIncome.toFixed(2);
        updateNetAmount();
        updateChart();

        let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
        incomes = incomes.filter(i => i.id !== income.id);
        localStorage.setItem("incomes", JSON.stringify(incomes));
    });

    let editButton = document.createElement("button");
    editButton.innerText = "編輯";
    editButton.style.marginLeft = "10px";
    editButton.addEventListener("click", function () {
        editIncome(income, listItem);
    });

    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");
    buttonContainer.appendChild(deleteButton);
    buttonContainer.appendChild(editButton);

    listItem.appendChild(buttonContainer);
}

function updateNetAmount() {
    let netAmount = totalIncome - totalAmount;
    document.getElementById("net-amount").innerText = netAmount.toFixed(2);
}

function setBudget() {
    budget = parseFloat(document.getElementById("budget-amount").value);
    if (isNaN(budget) || budget <= 0) {
        alert("請輸入有效的預算金額！");
        return;
    }
    document.getElementById("current-budget").innerText = budget.toFixed(2);
    localStorage.setItem("budget", budget.toFixed(2));
}

function loadData() {
    totalAmount = 0;
    totalIncome = 0;

    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let expenseList = document.getElementById("expense-list");
    expenseList.innerHTML = "";

    expenses.forEach(expense => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `${expense.category}: $${parseFloat(expense.amount).toFixed(2)} <br> 備註：${expense.note} <br> 日期：${expense.date}`;
        listItem.classList.add("expense-item");

        let deleteButton = document.createElement("button");
        deleteButton.innerText = "刪除";
        deleteButton.style.marginLeft = "10px";
        deleteButton.addEventListener("click", function () {
            expenseList.removeChild(listItem);
            totalAmount -= parseFloat(expense.amount);
            document.getElementById("total-amount").innerText = totalAmount.toFixed(2);
            updateNetAmount();
            updateChart();

            let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
            expenses = expenses.filter(e => e.id !== expense.id);
            localStorage.setItem("expenses", JSON.stringify(expenses));
        });

        let editButton = document.createElement("button");
        editButton.innerText = "編輯";
        editButton.style.marginLeft = "10px";
        editButton.addEventListener("click", function () {
            editExpense(expense, listItem);
        });

        let buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");
        buttonContainer.appendChild(deleteButton);
        buttonContainer.appendChild(editButton);

        listItem.appendChild(buttonContainer);
        expenseList.appendChild(listItem);
        totalAmount += parseFloat(expense.amount);
    });
    document.getElementById("total-amount").innerText = totalAmount.toFixed(2);

    let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
    let incomeList = document.getElementById("income-list");
    incomeList.innerHTML = "";

    incomes.forEach(income => {
        let listItem = document.createElement("li");
        listItem.innerHTML = `${income.category}: $${parseFloat(income.amount).toFixed(2)} <br> 備註：${income.note} <br> 日期：${income.date}`;
        listItem.classList.add("income-item");

        let deleteButton = document.createElement("button");
        deleteButton.innerText = "刪除";
        deleteButton.style.marginLeft = "10px";
        deleteButton.addEventListener("click", function () {
            incomeList.removeChild(listItem);
            totalIncome -= parseFloat(income.amount);
            document.getElementById("total-income").innerText = totalIncome.toFixed(2);
            updateNetAmount();
            updateChart();

            let incomes = JSON.parse(localStorage.getItem("incomes")) || [];
            incomes = incomes.filter(i => i.id !== income.id);
            localStorage.setItem("incomes", JSON.stringify(incomes));
        });

        let editButton = document.createElement("button");
        editButton.innerText = "編輯";
        editButton.style.marginLeft = "10px";
        editButton.addEventListener("click", function () {
            editIncome(income, listItem);
        });

        let buttonContainer = document.createElement("div");
        buttonContainer.classList.add("button-container");
        buttonContainer.appendChild(deleteButton);
        buttonContainer.appendChild(editButton);

        listItem.appendChild(buttonContainer);
        incomeList.appendChild(listItem);
        totalIncome += parseFloat(income.amount);
    });
    document.getElementById("total-income").innerText = totalIncome.toFixed(2);

    updateNetAmount();

    let storedBudget = parseFloat(localStorage.getItem("budget")) || 0;
    if (storedBudget > 0) {
        budget = storedBudget;
        document.getElementById("current-budget").innerText = budget.toFixed(2);
    }

    updateChart();
}

function initializeChart() {
    const ctx = document.getElementById('myChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['支出', '收入'],
            datasets: [{
                label: '收支情況',
                data: [totalAmount, totalIncome],
                backgroundColor: ['#f94144', '#43aa8b'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

function updateChart() {
    if (chart) {
        chart.data.datasets[0].data = [totalAmount, totalIncome];
        chart.update();
    }
}

function exportToCSV() {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let incomes = JSON.parse(localStorage.getItem("incomes")) || [];

    let csvContent = "類別,金額,備註,日期\n";

    expenses.forEach(expense => {
        csvContent += `支出,${expense.amount},${expense.note},${new Date(expense.id).toLocaleDateString()}\n`;
    });

    incomes.forEach(income => {
        csvContent += `收入,${income.amount},${income.note},${new Date(income.id).toLocaleDateString()}\n`;
    });

    let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    let link = document.createElement("a");
    let url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "mymoney_data.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveThemeSetting() {
    const theme = document.getElementById('theme').value;
    localStorage.setItem('preferredTheme', theme);
    applyTheme(theme);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }
}

function saveLayoutSetting() {
    const layout = document.getElementById('layout').value;
    localStorage.setItem('preferredLayout', layout);
    applyLayout(layout);
}

function applyLayout(layout) {
    const container = document.querySelector('.container');
    if (layout === 'wide') {
        container.style.width = '95%';
    } else {
        container.style.width = '70%';
    }
    container.style.margin = '0 auto';
}