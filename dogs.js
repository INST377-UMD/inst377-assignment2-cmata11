window.dogApiBreeds = [];

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM is loaded, script is running");

  const dogImage = document.getElementById("dog-image");
  const prevButton = document.getElementById("prev");
  const nextButton = document.getElementById("next");
  const breedButtonsContainer = document.getElementById("breed-buttons");
  const breedInfoBox = document.getElementById("breed-info");

  if (!dogImage || !prevButton || !nextButton || !breedButtonsContainer || !breedInfoBox) {
    console.error("One or more elements not found in DOM.");
    return;
  }

  let dogImages = [];
  let currentIndex = 0;

  async function loadBreedsAndImages() {
    try {
      const res = await fetch("https://dogapi.dog/api/v2/breeds");
      const data = await res.json();
      const breeds = data.data.slice(0, 10);
      console.log("Loaded breeds:", breeds.map(b => b.attributes.name));
      
      // Store breeds in global variable for voice commands
      window.dogApiBreeds = breeds;

      const promises = breeds.map(async b => {
        try {
          // Convert from dogapi.dog breed format to dog.ceo format
          // This is a simplification - we'll try to match by first part of the name
          const breedName = b.attributes.name.toLowerCase().split(' ')[0];
          
          // Check if it's a breed that might need special handling
          let dogCeoBreed = breedName;
          
          // Try to fetch an image for this breed
          const imgRes = await fetch(`https://dog.ceo/api/breed/${dogCeoBreed}/images/random`);
          const imgData = await imgRes.json();
          
          // Check if we got a valid response
          if (imgData.status === "success") {
            return {
              name: b.attributes.name,
              description: b.attributes.description,
              lifeMin: b.attributes.life.min,
              lifeMax: b.attributes.life.max,
              image: imgData.message
            };
          } else {
            // Fallback to a random dog image if specific breed not found
            const randomImgRes = await fetch("https://dog.ceo/api/breeds/image/random");
            const randomImgData = await randomImgRes.json();
            return {
              name: b.attributes.name,
              description: b.attributes.description,
              lifeMin: b.attributes.life.min,
              lifeMax: b.attributes.life.max,
              image: randomImgData.message
            };
          }
        } catch (err) {
          console.error(`Error fetching image for ${b.attributes.name}:`, err);
          // Fallback to a placeholder image
          return {
            name: b.attributes.name,
            description: b.attributes.description,
            lifeMin: b.attributes.life.min,
            lifeMax: b.attributes.life.max,
            image: "https://via.placeholder.com/400x300?text=No+Image+Available"
          };
        }
      });

      dogImages = await Promise.all(promises);
      console.log("Loaded images for breeds:", dogImages.map(d => d.name));

      if (dogImages.length) {
        renderCarousel();
        renderBreedButtons();
      } else {
        console.error("No images fetched for breeds.");
      }
    } catch (err) {
      console.error("Error loading breeds and images:", err);
    }
  }

  function renderCarousel() {
    showImage(0);
    prevButton.onclick = () => {
      currentIndex = (currentIndex - 1 + dogImages.length) % dogImages.length;
      showImage(currentIndex);
    };
    nextButton.onclick = () => {
      currentIndex = (currentIndex + 1) % dogImages.length;
      showImage(currentIndex);
    };
  }

  function showImage(index) {
    const item = dogImages[index];
    if (item) {
      console.log(`Showing image ${index + 1}: ${item.image}`);
      dogImage.src = item.image;
      // Display breed info when showing image
      showBreedInfo(item);
    }
  }

  function renderBreedButtons() {
    breedButtonsContainer.innerHTML = '';
    dogImages.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.className = 'button-75';
      const span = document.createElement('span');
      span.className = 'text';
      span.textContent = item.name;
      btn.appendChild(span);
      btn.onclick = () => {
        currentIndex = idx;
        showImage(idx);
      };
      breedButtonsContainer.appendChild(btn);
    });
  }

  function showBreedInfo(item) {
    breedInfoBox.innerHTML = `
      <div class="breed-info">
        <h3>${item.name}</h3>
        <p><strong>Description:</strong> ${item.description || 'No description available'}</p>
        <p><strong>Min Life:</strong> ${item.lifeMin || 'N/A'} years</p>
        <p><strong>Max Life:</strong> ${item.lifeMax || 'N/A'} years</p>
      </div>
    `;
    breedInfoBox.style.display = 'block';
  }

  // Function to find and display a specific breed by name
  window.loadDogApiBreedDescription = function(requestedBreed) {
    console.log(`Voice command received: load dog breed "${requestedBreed}"`);
    
    if (!window.dogApiBreeds || !window.dogApiBreeds.length) {
      console.error("Breeds not loaded yet");
      return;
    }
    
    // Try to find the breed by name (case-insensitive partial match)
    const requestedBreedLower = requestedBreed.toLowerCase();
    const foundBreedIndex = dogImages.findIndex(dog => 
      dog.name.toLowerCase().includes(requestedBreedLower)
    );
    
    if (foundBreedIndex !== -1) {
      // Found the breed, show it
      currentIndex = foundBreedIndex;
      showImage(currentIndex);
      console.log(`Found and displayed breed: ${dogImages[foundBreedIndex].name}`);
    } else {
      console.log(`Could not find breed matching: ${requestedBreed}`);
      // Optionally show a message to the user
      alert(`Sorry, I couldn't find a dog breed matching "${requestedBreed}"`);
    }
  };

  // Initialize Annyang voice commands
  function initializeAnnyang() {
    if (typeof annyang !== 'undefined') {
      console.log("Initializing annyang voice commands");
      
      const commands = {
        'hello': function() { 
          console.log("Voice command: Hello");
          alert('Hello World');
        },
        'change the color to *color': function(color) {
          console.log(`Voice command: Change color to ${color}`);
          document.body.style.backgroundColor = color;
        },
        'navigate to *page': function(page) {
          console.log(`Voice command: Navigate to ${page}`);
          page = page.toLowerCase();
          if (page.includes('home')) window.location.href = 'index.html';
          else if (page.includes('stocks')) window.location.href = 'stocks.html';
          else if (page.includes('dogs')) window.location.href = 'dogs.html';
        },
        'load dog breed *breed': function(breed) {
          console.log(`Voice command: Load dog breed ${breed}`);
          window.loadDogApiBreedDescription(breed);
        },
        'next dog': function() {
          console.log("Voice command: Next dog");
          nextButton.click();
        },
        'previous dog': function() {
          console.log("Voice command: Previous dog");
          prevButton.click();
        }
      };
      
      annyang.addCommands(commands);
      console.log("Voice commands added");
    } else {
      console.warn("Annyang library not found. Voice commands won't work.");
    }
  }

  // Voice control toggle functions
  window.startAnnyang = function() {
    if (typeof annyang !== 'undefined') {
      console.log("Starting voice recognition...");
      annyang.start({ autoRestart: true, continuous: false });
      alert("Voice recognition started. Try saying commands like 'next dog'.");
    }
  };

  window.stopAnnyang = function() {
    if (typeof annyang !== 'undefined') {
      console.log("Stopping voice recognition");
      annyang.abort();
      alert("Voice recognition stopped.");
    }
  };

  // Initialize everything
  loadBreedsAndImages();
  initializeAnnyang();
});