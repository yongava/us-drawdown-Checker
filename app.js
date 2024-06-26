async function fetchStockData(stockSymbol, fromDate, toDate) {
    const url = `https://eodhistoricaldata.com/api/eod/${stockSymbol}.US?fmt=json&order=d&from=${fromDate}&to=${toDate}&api_token=YOUR_API_TOKEN`;
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

function calculateDrawdown(data) {
    const prices = data.map(item => item.adjusted_close);
    const dates = data.map(item => item.date);
    let cumMax = prices[0];
    const drawdowns = prices.map(price => {
        cumMax = Math.max(cumMax, price);
        return (price / cumMax) - 1;
    });
    return { drawdowns, dates };
}

function findDrawdownPeriods(drawdowns, dates) {
    let periods = [];
    let inDrawdown = false;
    let startDate = null;
    let maxDrawdown = 0;
    let endDate = null;

    for (let i = 0; i < drawdowns.length; i++) {
        if (drawdowns[i] < 0) {
            if (!inDrawdown) {
                inDrawdown = true;
                startDate = dates[i];
                maxDrawdown = drawdowns[i];
            } else {
                maxDrawdown = Math.min(maxDrawdown, drawdowns[i]);
            }
        } else {
            if (inDrawdown) {
                inDrawdown = false;
                endDate = dates[i];
                periods.push({ startDate, endDate, drawdown: maxDrawdown * 100 });
            }
        }
    }

    if (inDrawdown) {
        endDate = dates[dates.length - 1];
        periods.push({ startDate, endDate, drawdown: maxDrawdown * 100 });
    }

    return periods.sort((a, b) => a.drawdown - b.drawdown).slice(0, 3);
}

function plotChart(ctx, labels, data, title) {
    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: title,
                data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

async function generateReport() {
    const stockSymbol = document.getElementById('stockSymbol').value.toUpperCase();
    const fromDate = '2023-01-01';
    const toDate = new Date().toISOString().split('T')[0];

    const data = await fetchStockData(stockSymbol, fromDate, toDate);
    const { drawdowns, dates } = calculateDrawdown(data);
    const drawdownPeriods = findDrawdownPeriods(drawdowns, dates);

    document.getElementById('report').innerHTML = `
        <h2>Report for ${stockSymbol}</h2>
        ${drawdownPeriods.map(period => `
            <p>${period.startDate} to ${period.endDate} : ${period.drawdown.toFixed(2)}%</p>
        `).join('')}
    `;

    const priceData = data.map(item => ({ x: item.date, y: item.adjusted_close }));
    plotChart(document.getElementById('priceChart'), dates, priceData.map(d => d.y), 'Price');

    const drawdownData = drawdowns.map((d, i) => ({ x: dates[i], y: d * 100 }));
    plotChart(document.getElementById('drawdownChart'), dates, drawdownData.map(d => d.y), 'Drawdown');
}
