document.addEventListener('DOMContentLoaded', function() {
    let symbols = [];

    // Load the symbols from the JSON file
    fetch('symbolist.json')
        .then(response => response.json())
        .then(data => symbols = data);

    const symbolInput = document.getElementById('symbol');
    const suggestionsContainer = document.getElementById('suggestions');

    symbolInput.addEventListener('input', function() {
        const input = symbolInput.value.toUpperCase();
        suggestionsContainer.innerHTML = '';
        if (input) {
            const suggestions = symbols.filter(symbol => symbol.startsWith(input));
            suggestions.forEach(suggestion => {
                const suggestionDiv = document.createElement('div');
                suggestionDiv.textContent = suggestion;
                suggestionDiv.addEventListener('click', function() {
                    symbolInput.value = suggestion;
                    suggestionsContainer.innerHTML = '';
                });
                suggestionsContainer.appendChild(suggestionDiv);
            });
        }
    });

    document.getElementById('stock-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const symbol = symbolInput.value.toUpperCase();
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
                p.textContent = `Drawdown Statisic: \n ${row['Start Date']} to ${row['End Date']}: ${row['Drawdown Percentage']}%`;
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
            y: drawdownData.map(d => d.drawdown*100),
            type: 'scatter',
            name: 'Drawdown (%)'
        };

        const layout = {
            title: `${symbol} Price and Drawdown`,
            grid: { rows: 2, columns: 1, pattern: 'independent' },
            xaxis: { title: 'Date' },
            yaxis: { title: 'Price' },
            xaxis2: { title: 'Date' },
            yaxis2: { title: 'Drawdown' }
        };

        const data = [
            { ...priceTrace, xaxis: 'x', yaxis: 'y' },
            { ...drawdownTrace, xaxis: 'x2', yaxis: 'y2' }
        ];

        Plotly.newPlot('charts', data, layout);
    }
});
