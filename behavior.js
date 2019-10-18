// import Chart from 'chart.js';
// import ChartDataLabels from 'chartjs-plugin-datalabels';

document.addEventListener('DOMContentLoaded', initialize, false);

const CHART_EL_ID = "burndown-chart";
const CURR_DATE = new Date();
const CURR_YEAR = CURR_DATE.getUTCFullYear();
const CURR_MONTH = CURR_DATE.getUTCMonth() + 1; // months are 0-indexed
const CURR_DAY = CURR_DATE.getUTCDate();
const DAYS_IN_MONTH = getDaysInMonth(CURR_YEAR, CURR_MONTH);
let SELECTED_BUDGET = "TREVORS_BUDGET";
const BUDGETS = {
    "TREVORS_BUDGET": {
        title: "Trevor's Budget",
        budget: 400,
        transactions: {
            "NSOIBDNSNK": {
                title: "nook",
                amount: -89.00,
                date: "2019-09-01"
            },
            "LKSOISNDON": {
                title: "shelly flood",
                amount: -31.00,
                date: "2019-10-01"
            },
            "NSOINHSIN": {
                title: "pens",
                amount: -10.00,
                date: "2019-10-01"
            },
            "SLKDJHLSKJ": {
                title: "Home Assistant Cloud",
                amount: -5.00,
                date: "2019-10-05"
            },
            "LKAJLSKJSL": {
                title: "Hardware & Tools",
                amount: -89.00,
                date: "2019-10-05"
            },
            "LKSJFIUHSS": {
                title: "Hardware",
                amount: -27.00,
                date: "2019-10-05"
            },
            "BUYVKUVSS": {
                title: "Ikea Smart Lights",
                amount: -44.00,
                date: "2019-10-06"
            },
            "KJSBIUSVB": {
                title: "Electrical boxes",
                amount: -2.00,
                date: "2019-10-12"
            },
            "KJSNIUBSIS": {
                title: "batteries",
                amount: -11.00,
                date: "2019-10-16"
            }
            ,
            "IBUSOBSOIUDBS": {
                title: "saving for headphones",
                amount: -25.00,
                date: "2019-10-01"
            }
        }
    },
    "DINING_OUT": {
        title: "Dining Out",
        budget: 400,
        transactions: {
            "KJBSIUBS": {
                title: "simply spanish",
                amount: -12.72,
                date: "2019-10-02"
            },
            "KJHSISUBPS": {
                title: "greenroom",
                amount: -7.88,
                date: "2019-10-04"
            }
        }
    }
};

function getCurrBudgetTransactions() {
    return BUDGETS[SELECTED_BUDGET].transactions;
}

function getCurrBudgetBudget() {
    return BUDGETS[SELECTED_BUDGET].budget;
}

function getCurrBudgetTitle() {
    return BUDGETS[SELECTED_BUDGET].ticks;
}

    function initialize() {
        const monthsTransactions = getTransactionsForMonth(getCurrBudgetTransactions(), CURR_YEAR, CURR_MONTH);

buildBurndownChart(monthsTransactions);
displayTransactions(monthsTransactions);
}

// #region parse transactions

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

// #endregion

// #region charting

function buildBurndownChart(monthsTransactions) {
    const budget = getCurrBudgetBudget();
    const chartData = initChartData(budget, DAYS_IN_MONTH);
    chartData.actual = AccumulateSpendingOverMonth(budget, monthsTransactions, CURR_YEAR, CURR_MONTH);
    generateBurndownChart(CHART_EL_ID, DAYS_IN_MONTH, chartData.actual, chartData.ideal, budget);
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

    Chart.defaults.global.defaultFontFamily = "Roboto";
    Chart.defaults.global.defaultFontSize = 14;
    Chart.defaults.global.defaultFontColor = "#D9D0D0";
    Chart.defaults.global.responsive = true;

    let dates = [];
    for (let i = 0; i < daysInMonth; i++) {
        let label = i + 1;
        if (label === 1) {
            dates.push(`${label}`);
        } else if (label === daysInMonth) {
            dates.push(`${label}`);
        } else if (label + 1 === daysInMonth) {
            dates.push("");
        } else if (label % 5 === 0) {
            dates.push(`${label}`);
        } else {
            dates.push("");
        }

    }


    var chartData = {
        labels: dates,
        datasets: [
            {
                label: "Burndown",
                data: actualData,
                fill: false,
                borderColor: "#C09AD9",
                backgroundColor: "#C09AD9",
                lineTension: 0,
                datalabels: {
                    backgroundColor: '#C09AD9',
                    color: "#071826",
                    font: {
                        weight: "bold"
                    },
                    borderRadius: "7",
                    anchor: "end",
                    align: 'top',
                    display: (context) => (context.dataIndex + 1 === context.dataset.data.length),
                    formatter: amount => formatCurrency(amount)
                }
            },
            {
                label: "Ideal",
                borderColor: "#596273",
                backgroundColor: "#596273",
                lineTension: 0,
                fill: false,
                data: idealData,
                pointRadius: 0,
                borderDash: [10, 5],
                datalabels: {
                    display: false
                }
            },
        ]
    };

    var chartOptions = {
        legend: {
            display: false,
        },
        scales: {
            yAxes: [{
                ticks: {
                    min: 0,
                    max: budget,
                    callback: (value, index, values) => ('  $' + value)
                },
                gridLines: {
                    display: false
                }
            }],
            xAxes: [{
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0
                },
                gridLines: {
                    display: false
                }
            }]
        }
    };

    var lineChart = new Chart(speedCanvas, {
        type: 'line',
        data: chartData,
        // plugins: [ChartDataLabels],
        options: chartOptions
    });

}

// #endregion

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

    clone.querySelector(".transaction-title").textContent = transaction.title;
    clone.querySelector(".transaction-amount").textContent = formatCurrency(transaction.amount, true);
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

function formatCurrency (amount, cents) {
    if (cents) {
        return currencyFormaterCents.format(amount);
    } else {
        return currencyFormater.format(amount);
    }
}
const currencyFormaterCents = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
});

const currencyFormater = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
});