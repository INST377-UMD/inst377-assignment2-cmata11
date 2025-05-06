document.addEventListener("DOMContentLoaded", () => {
  const timestamp = new Date().getTime();
  const url = "https://api.allorigins.win/get?url=" + encodeURIComponent("https://zenquotes.io/api/random") + `&cache_bust=${timestamp}`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      const parsed = JSON.parse(data.contents);
      const quoteText = document.getElementById("quote-text");
      quoteText.textContent = `"${parsed[0].q}" — ${parsed[0].a}`;
    })
    .catch((err) => {
      console.error("Error fetching quote:", err);
      document.getElementById("quote-text").textContent = "Could not load quote.";
    });

  // Initialize Annyang commands
  if (typeof annyang !== 'undefined') {
    const commands = {
      'hello': () => alert('Hello World'),
      'change the color to *color': (color) => {
        document.body.style.backgroundColor = color;
      },
      'navigate to *page': (page) => {
        const destination = page.toLowerCase();
        if (destination.includes("home")) window.location.href = "index.html";
        else if (destination.includes("stocks")) window.location.href = "stocks.html";
        else if (destination.includes("dogs")) window.location.href = "dogs.html";
      }
    };
    annyang.addCommands(commands);
  }
});

function startAnnyang() {
  if (typeof annyang !== 'undefined') {
    annyang.start();
  }
}

function stopAnnyang() {
  if (typeof annyang !== 'undefined') {
    annyang.abort();
  }
}
