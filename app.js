document.getElementById('stock-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const symbol = document.getElementById('symbol').value.toUpperCase();
    loadCSVData(symbol);
});

function loadCSVData(symbol) {
    d3.csv('price.csv').then(function(priceData) {
        d3.csv('drawdown.csv').then(function(drawdownData) {
            d3.csv('top_drawdowns.csv').then(function(reportData) {
                const priceFiltered = priceData.map(d => ({
                    date: d3.timeParse("%Y-%m-%d")(d.Date),
                    price: +d[symbol]
                }));

                const drawdownFiltered = drawdownData.map(d => ({
                    date: d3.timeParse("%Y-%m-%d")(d.Date),
                    drawdown: +d[symbol]
                }));

                const reportFiltered = reportData.filter(d => d.Stock === symbol);

                displayReport(reportFiltered);
                plotPriceChart(priceFiltered, symbol);
                plotDrawdownChart(drawdownFiltered, symbol);
            });
        });
    });
}

function displayReport(reportData) {
    const reportDiv = document.getElementById('report');
    reportDiv.innerHTML = '';

    if (reportData.length > 0) {
        reportData.forEach(row => {
            const p = document.createElement('p');
            p.textContent = `${row['Start Date']} to ${row['End Date']}: ${row['Drawdown Percentage']}%`;
            reportDiv.appendChild(p);
        });
    } else {
        reportDiv.textContent = 'No data available for this symbol.';
    }
}

function plotPriceChart(data, symbol) {
    const trace = {
        x: data.map(d => d.date),
        y: data.map(d => d.price),
        type: 'scatter'
    };

    const layout = {
        title: `${symbol} Price`,
        xaxis: { title: 'Date' },
        yaxis: { title: 'Price' }
    };

    Plotly.newPlot('price-chart', [trace], layout);
}

function plotDrawdownChart(data, symbol) {
    const trace = {
        x: data.map(d => d.date),
        y: data.map(d => d.drawdown),
        type: 'scatter'
    };

    const layout = {
        title: `${symbol} Drawdown`,
        xaxis: { title: 'Date' },
        yaxis: { title: 'Drawdown' }
    };

    Plotly.newPlot('drawdown-chart', [trace], layout);
}
