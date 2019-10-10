document.addEventListener('DOMContentLoaded', initialize, false);

const CHART_EL_ID = "burndown-chart";
const BUDGET = 400;
const CURR_DATE = new Date();
const CURR_YEAR = CURR_DATE.getUTCFullYear();
const CURR_MONTH = CURR_DATE.getUTCMonth() + 1; // months are 0-indexed
const CURR_DAY = CURR_DATE.getUTCDate();
const DAYS_IN_MONTH = getDaysInMonth(CURR_YEAR, CURR_MONTH);
const TRANSACTIONS = {
    "NSOIBDNSNK" : {
        title: "nook",
        amount: -89.00,
        date: "2019-09-01",
        tag: "trevor spending" 
    },
    "LKSOISNDON" : {
        title: "shelly flood",
        amount: -31.00,
        date: "2019-10-01",
        tag: "trevor spending" 
    },
    "NSOINHSIN" : {
        title: "pens",
        amount: -10.00,
        date: "2019-10-01"
    },
    "SLKDJHLSKJ": {
        title: "Home Assistant Cloud",
        amount: -5.00,
        date: "2019-10-05",
        tag: "trevor spending" 
    },
    "LKAJLSKJSL": {
        title: "Hardware & Tools",
        amount: -89.00,
        date: "2019-10-05",
        tag: "trevor spending" 
    },
    "LKSJFIUHSS": {
        title: "Hardware",
        amount: -27.00,
        date: "2019-10-05",
        tag: "trevor spending" 
    },
    "BUYVKUVSS": {
        title: "Ikea Smart Lights",
        amount: -44.00,
        date: "2019-10-06",
        tag: "trevor spending" 
    }
};


function initialize() {
    const monthsTransactions = getTransactionsForMonth(TRANSACTIONS, CURR_YEAR, CURR_MONTH);

    buildBurndownChart(monthsTransactions);
    displayTransactions(monthsTransactions);
}

function buildBurndownChart(monthsTransactions) {
    const chartData = initChartData(BUDGET, DAYS_IN_MONTH);
    chartData.actual = AccumulateSpendingOverMonth(BUDGET, monthsTransactions, CURR_YEAR, CURR_MONTH);
    generateBurndownChart(CHART_EL_ID, DAYS_IN_MONTH, chartData.actual, chartData.ideal, BUDGET);
}

function AccumulateSpendingOverMonth(budget, transactions, yearNum, monthNum) {
    const spendingAccumulation = [];

    for (let day = 1; day <= CURR_DAY; day++) {
        const daysTransactions = getTransactionsForDay(transactions, yearNum, monthNum, day);
        budget = subtractTransactionsFromBudget(budget, daysTransactions);
        spendingAccumulation.push(budget);
    }
    return spendingAccumulation;
}

function subtractTransactionsFromBudget(budget, transactions) {
    Object.values(transactions).forEach(transaction => budget += transaction.amount);
    return budget;
}

function getDaysInMonth(yearNum, monthNum) {
    const lastDayOfMonth = new Date(Date.UTC(yearNum, monthNum, 0, 23, 59, 59, 999));
    return lastDayOfMonth.getUTCDate();
}

function getTransactionsForMonth(transactions, yearNum, monthNum) {
    const firstDayOfMonth = new Date(Date.UTC(yearNum, monthNum - 1));
    const lastDayOfMonth = new Date(Date.UTC(yearNum, monthNum, 0, 23, 59, 59, 999));
    
    return getTransactionsInDateRange(transactions, firstDayOfMonth, lastDayOfMonth);
}

function getTransactionsForDay(transactions, yearNum, monthNum, dayNum) {
    const firstMSOfDay = new Date(Date.UTC(yearNum, monthNum - 1, dayNum));
    const lastMSOfDay = new Date(Date.UTC(yearNum, monthNum - 1, dayNum, 23, 59, 59, 999));
    
    return getTransactionsInDateRange(transactions, firstMSOfDay, lastMSOfDay);
}

function getTransactionsInDateRange(transactions, firstDay, lastDay) {
    const keys = Object.keys(transactions);

    const filteredKeys = keys.filter(key => {
        const date = new Date(transactions[key].date);
        return (date >= firstDay && date <= lastDay);
    });

    const filteredTransactions = {};
    filteredKeys.forEach(key => filteredTransactions[key] = transactions[key]);

    return filteredTransactions;
}

function initChartData(budget, daysInMonth) {
    const ideal = [];
    for (let i = 0; i < daysInMonth; i++) {
        ideal.push(budget - (budget / daysInMonth) * i);
    }

    return {
        count: daysInMonth,
        actual: [],
        ideal: ideal
    }
}

function generateBurndownChart(elementId, daysInMonth, actualData, idealData, budget) {

    var speedCanvas = document.getElementById(elementId);

    Chart.defaults.global.defaultFontFamily = "Arial";
    Chart.defaults.global.defaultFontSize = 14;

    let dates = [];
    for (let i = 0; i < daysInMonth; i++) {
        dates.push(i + 1);
    }


    var chartData = {
        labels: dates,
        datasets: [
            {
                label: "Burndown",
                data: actualData,
                fill: false,
                borderColor: "#EE6868",
                backgroundColor: "#EE6868",
                lineTension: 0,
            },
            {
                label: "Ideal",
                borderColor: "#lightgray",
                backgroundColor: "lightgray",
                lineTension: 0,
                fill: false,
                data: idealData
            },
        ]
    };

    var chartOptions = {
        legend: {
            display: false,
            position: 'top',
            labels: {
                boxWidth: 80,
                fontColor: 'black'
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    min: 0,
                    max: budget
                }
            }]
        }
    };

    var lineChart = new Chart(speedCanvas, {
        type: 'line',
        data: chartData,
        options: chartOptions
    });

}

// #region display Transactions
function displayTransactions(transactions) {
    clearTransactions()
    Object.values(transactions).forEach(transaction => displayResult(transaction));
}

function clearTransactions() {
    let list = document.getElementById("transactions-list");
    list.innerHTML = "";
}

function displayResult(transaction) {
    let list = document.getElementById("transactions-list");
    let template = document.getElementById("transaction-template");
    let clone = template.content.cloneNode(true);
    const currencyFormater = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      });

    clone.querySelector(".transaction-title").textContent = transaction.title;
    clone.querySelector(".transaction-amount").textContent = currencyFormater.format(transaction.amount);
    clone.querySelector(".transaction-date").textContent = transaction.date;

    list.appendChild(clone);
}

function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
    try {
      decimalCount = Math.abs(decimalCount);
      decimalCount = isNaN(decimalCount) ? 2 : decimalCount;
  
      const negativeSign = amount < 0 ? "-" : "";
  
      let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
      let j = (i.length > 3) ? i.length % 3 : 0;
  
      return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
    } catch (e) {
      console.log(e)
    }
  };
// #endregion