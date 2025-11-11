const apikey = "b85f3ee5bdc5dad45711fa73c4f36683";
feather.replace();

function updateBackground(weatherMain, isDay) {
  const body = document.body;
  body.className = "";
  const main = weatherMain.toLowerCase();

  if (main.includes("clear"))
    body.classList.add(isDay ? "sunny-bg" : "night-bg");
  else if (main.includes("cloud")) body.classList.add("cloudy-bg");
  else if (main.includes("rain") || main.includes("drizzle"))
    body.classList.add("rainy-bg");
  else if (main.includes("thunder")) body.classList.add("thundery-bg");
  else body.classList.add("cloudy-bg");

  console.log("🌄 Background updated:", main, "isDay:", isDay);
}

function getWeatherIcon(weatherMain, isDay) {
  const main = weatherMain.toLowerCase();

  if (main.includes("clear")) return isDay ? "sun" : "moon";
  if (main.includes("cloud")) return "cloud";
  if (main.includes("rain") || main.includes("drizzle")) return "cloud-rain";
  if (main.includes("thunder")) return "cloud-lightning";
  if (main.includes("snow")) return "cloud-snow";
  if (main.includes("mist") || main.includes("fog") || main.includes("haze"))
    return "wind";
  return "cloud";
}

function displayWeather(data) {
  const weatherDiv = document.getElementById("weather");
  if (data.cod !== 200) {
    weatherDiv.innerHTML = `<p>Error: ${data.message}</p>`;
    return;
  }

  const weatherMain = data.weather[0].main;
  const desc = data.weather[0].description;
  const localTime = Math.floor(Date.now() / 1000) + data.timezone;
  const isDay = localTime >= data.sys.sunrise && localTime < data.sys.sunset;

  console.log("🕒 Debug info:");
  console.log("Local Time (Unix):", localTime);
  console.log("Sunrise:", data.sys.sunrise);
  console.log("Sunset:", data.sys.sunset);
  console.log("Is Day:", isDay);
  console.log("Weather:", weatherMain, "-", desc);

  updateBackground(weatherMain, isDay);

  const date = new Date().toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });

  const iconName = getWeatherIcon(weatherMain, isDay);
  weatherDiv.innerHTML = `
    <div class="card">
      <div class="icon-container">
        <i data-feather="${iconName}" class="weather-icon"></i>
      </div>
      <div class="card-header">
        <span>${data.name}, ${data.sys.country}<br>${desc}</span>
        <span>${date}</span>
      </div>
      <span class="temp">${Math.round(data.main.temp)}°</span>
      <div class="temp-scale"><span>Celsius</span></div>
    </div>
  `;

  // Delay icon replacement slightly to ensure DOM is ready
  setTimeout(() => {
    feather.replace();

    const iconEl = document.querySelector(".weather-icon");
    if (iconEl) {
      if (isDay) {
        iconEl.style.color = "#FFD700"; // golden glow for day
        iconEl.style.filter = "drop-shadow(0 0 10px #FFD700)";
      } else {
        iconEl.style.color = "#C0C0FF"; // silvery-blue for night
        iconEl.style.filter = "drop-shadow(0 0 8px #C0C0FF)";
      }
    }
    console.log("✅ Feather icons updated with animation");
  }, 50);
}

function getWeatherByCity() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}&units=metric`
  )
    .then((res) => res.json())
    .then((data) => displayWeather(data))
    .catch((err) => console.error("Error fetching weather:", err));
}

function getWeatherByLocation() {
  if (!navigator.geolocation) {
    alert("Geolocation not supported by your browser.");
    return;
  }

  console.log("📍 Fetching weather for your location...");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      console.log(`📍 Coordinates: Lat=${latitude}, Lon=${longitude}`);
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}&units=metric`
      )
        .then((res) => res.json())
        .then((data) => displayWeather(data))
        .catch((err) => console.error("Error fetching weather:", err));
    },
    () => alert("Unable to retrieve your location.")
  );
}
document
  .getElementById("cityInput")
  .addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      getWeatherByCity();
    }
    if (event.key === "Escape") {
      document.getElementById("cityInput").value = ""; // Clear the input field
      document.getElementById("cityInput").focus(); // Focus back to input
    }
  });
