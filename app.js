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

    // function displayReport(reportData) {
    //     const reportDiv = document.getElementById('report');
    //     reportDiv.innerHTML = '';

    //     if (reportData.length > 0) {
    //         reportData.forEach(row => {
    //             const p = document.createElement('p');
    //             p.textContent = `${row['Start Date']} to ${row['End Date']}: ${row['Drawdown Percentage']}%`;
    //             reportDiv.appendChild(p);
    //         });
    //     } else {
    //         reportDiv.textContent = 'No data available for this symbol.';
    //     }
    // }

    function displayReport(reportData) {
        const reportDiv = document.getElementById('report');
        reportDiv.innerHTML = '';

        if (reportData.length > 0) {
            const table = document.createElement('table');
            table.className = 'report-table';

            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');

            const headers = ['Start Date', 'End Date', 'Drawdown Percentage'];
            headers.forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');

            reportData.forEach(row => {
                const tr = document.createElement('tr');

                const startDateTd = document.createElement('td');
                startDateTd.textContent = row['Start Date'];
                tr.appendChild(startDateTd);

                const endDateTd = document.createElement('td');
                endDateTd.textContent = row['End Date'];
                tr.appendChild(endDateTd);

                const drawdownPercentageTd = document.createElement('td');
                drawdownPercentageTd.textContent = `${row['Drawdown Percentage']}%`;
                tr.appendChild(drawdownPercentageTd);

                tbody.appendChild(tr);
            });

            table.appendChild(tbody);
            reportDiv.appendChild(table);
        } else {
            reportDiv.textContent = 'No data available for this symbol.';
        }
    }


    function plotPriceAndDrawdownChart(priceData, drawdownData, symbol) {
        const priceTrace = {
            x: priceData.map(d => d.date),
            y: priceData.map(d => d.price),
            type: 'scatter',
            name: 'Price',
            line: { color: '#03d3dd' }
        };

        const drawdownTrace = {
            x: drawdownData.map(d => d.date),
            y: drawdownData.map(d => d.drawdown*100),
            type: 'scatter',
            name: 'Drawdown (%)',
            line: { color: '#f74d03' }
        };

        const layout = {
            title: `${symbol}`,
            grid: { rows: 2, columns: 1 },
            showlegend: false,
            xaxis: { title: 'Date' },
            yaxis: { title: 'Price' },
            xaxis2: { title: 'Date', anchor: 'y2' },
            yaxis2: { title: 'Drawdown' }
        };

        const data = [
            { ...priceTrace, xaxis: 'x', yaxis: 'y' },
            { ...drawdownTrace, xaxis: 'x2', yaxis: 'y2' }
        ];

        Plotly.newPlot('charts', data, layout);
    }
});
