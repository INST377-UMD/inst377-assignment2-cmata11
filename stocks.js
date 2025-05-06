const API_KEY = 'Ez7ZsH7ipVVBV_QwcO6ZfKGrIxZEcQRw';

let stockChart;

// Form submit event
const form = document.getElementById('stock-form');
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const ticker = document.getElementById('ticker').value.toUpperCase();
  const days = parseInt(document.getElementById('range').value);
  if (!ticker) return;

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days);

  const from = start.toISOString().split('T')[0];
  const to = end.toISOString().split('T')[0];

  const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&limit=120&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const labels = data.results.map((point) => {
      const date = new Date(point.t);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const values = data.results.map((point) => point.c);

    if (stockChart) stockChart.destroy();
    const ctx = document.getElementById('stockChart').getContext('2d');
    stockChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: `${ticker} Closing Prices`,
          data: values,
          fill: false,
          borderColor: 'blue',
          tension: 0.1
        }]
      },
    });
  } catch (err) {
    console.error('Error fetching stock data:', err);
  }
});

// Fetch Reddit Trending Stocks with CORS Proxy
async function fetchRedditStocks() {
  const proxyUrl = 'https://api.allorigins.win/get?url=';
  const targetUrl = encodeURIComponent('https://tradestie.com/api/v1/apps/reddit?date=2022-04-03');
  const url = `${proxyUrl}${targetUrl}`;

  try {
    const res = await fetch(url);
    const wrapped = await res.json();
    const data = JSON.parse(wrapped.contents);
    const top5 = data.slice(0, 5);
    const tbody = document.querySelector('#reddit-table tbody');
    tbody.innerHTML = '';

    top5.forEach((stock) => {
      const tr = document.createElement('tr');
      const link = `https://finance.yahoo.com/quote/${stock.ticker}`;
      const sentimentImg = stock.sentiment === 'Bullish'
        ? '<img src="https://cdn.prod.website-files.com/649c5d15dc98c410b724d35a/649c5d15dc98c410b724d657_20230603T0241-089e55fa-72cf-4ec8-881f-b68cbbd10a45.png" alt="Bullish" style="width: 100%; height: auto; object-fit: contain; max-height: 50px">'
        : '<img src="https://images.squarespace-cdn.com/content/v1/59b9ecdabebafb8293096530/1506927343134-BY6BAAVX3U55PNBKV7T4/IMG_3984.jpg" alt="Bearish" style="width: 100%; height: auto; object-fit: contain; max-height: 50px">';      
      
      tr.innerHTML = `
        <td><a href="${link}" target="_blank">${stock.ticker}</a></td>
        <td>${stock.no_of_comments}</td>
        <td>${sentimentImg}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading Reddit stocks:', err);
  }
}

fetchRedditStocks();

// Voice Commands
function startAnnyang() {
  if (annyang) {
    const commands = {
      'hello': () => alert('Hello World'),
      'change the color to *color': (color) => {
        document.body.style.backgroundColor = color;
      },
      'navigate to *page': (page) => {
        page = page.toLowerCase();
        if (page.includes("home")) window.location.href = "index.html";
        else if (page.includes("stocks")) window.location.href = "stocks.html";
        else if (page.includes("dogs")) window.location.href = "dogs.html";
      },
      'lookup *ticker': (ticker) => {
        document.getElementById('ticker').value = ticker.toUpperCase();
        document.getElementById('range').value = '30';
        form.dispatchEvent(new Event('submit'));
      }
    };
    annyang.addCommands(commands);
    annyang.start();
  }
}

function stopAnnyang() {
  if (annyang) annyang.abort();
}
