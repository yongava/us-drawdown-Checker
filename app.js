document.addEventListener('DOMContentLoaded', function() {
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
                    plotPriceAndDrawdownChart(priceFiltered, drawdownFiltered, symbol);
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

    function plotPriceAndDrawdownChart(priceData, drawdownData, symbol) {
        const priceTrace = {
            x: priceData.map(d => d.date),
            y: priceData.map(d => d.price),
            type: 'scatter',
            name: 'Price'
        };

        const drawdownTrace = {
            x: drawdownData.map(d => d.date),
            y: drawdownData.map(d => d.drawdown),
            type: 'scatter',
            name: 'Drawdown',
            yaxis: 'y2'
        };

        const layout = {
            title: `${symbol} Price and Drawdown`,
            grid: { rows: 2, columns: 1, pattern: 'independent' },
            xaxis: { title: 'Date' },
            yaxis: { title: 'Price' },
            yaxis2: { title: 'Drawdown', anchor: 'x', overlaying: 'y', side: 'right' },
            subplots: [
                { xaxis: 'x1', yaxis: 'y1' },
                { xaxis: 'x2', yaxis: 'y2' }
            ]
        };

        const data = [priceTrace, drawdownTrace];

        Plotly.newPlot('charts', data, layout);
    }
});
