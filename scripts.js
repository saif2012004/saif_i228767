document.addEventListener("DOMContentLoaded", function () {
  let currentPage = 1;
  const rowsPerPage = 5;
  let weatherData = null;

  document.getElementById("get-weather").addEventListener("click", function () {
    const cityInput = document.getElementById("city");
    if (!cityInput) {
      console.error("Could not find element with ID 'city'");
      return;
    }
    const city = cityInput.value;
    const apiKey = "df15f42c06f3aa7e95bdeb2aa3953e91";
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("City not found or API limit reached.");
        }
        return response.json();
      })
      .then((data) => {
        weatherData = data;
        displayWeather(data);
        createCharts(data);
        populateTable(data, currentPage);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        const weatherDetails = document.getElementById("weather-details");
        if (weatherDetails) {
          weatherDetails.innerHTML = `<p>Error: ${error.message}</p>`;
        } else {
          console.error("Could not find element with ID 'weather-details'");
        }
      });
  });

  function displayWeather(data) {
    const weatherDetails = document.getElementById("weather-details");
    if (!weatherDetails) {
      console.error("Could not find element with ID 'weather-details'");
      return;
    }
    const cityName = data.city.name;
    const currentWeather = data.list[0];
    const weather = currentWeather.weather[0].description;
    const temp = currentWeather.main.temp;
    const humidity = currentWeather.main.humidity;
    const windSpeed = currentWeather.wind.speed;
    const windDirection = currentWeather.wind.deg;
    const pressure = currentWeather.main.pressure;
    const feelsLike = currentWeather.main.feels_like;
    const tempMin = currentWeather.main.temp_min;
    const tempMax = currentWeather.main.temp_max;
    const cloudiness = currentWeather.clouds.all;
    const sunrise = new Date(data.city.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(data.city.sunset * 1000).toLocaleTimeString();

    weatherDetails.innerHTML = `
      <h4>${cityName} Weather</h4>
      <p>Description: ${weather}</p>
      <p>Temperature: ${temp}°C (Feels like: ${feelsLike}°C)</p>
      <p>Min/Max Temp: ${tempMin}°C / ${tempMax}°C</p>
      <p>Humidity: ${humidity}%</p>
      <p>Wind: ${windSpeed} m/s, Direction: ${windDirection}°</p>
      <p>Pressure: ${pressure} hPa</p>
      <p>Cloudiness: ${cloudiness}%</p>
      <p>Sunrise: ${sunrise}</p>
      <p>Sunset: ${sunset}</p>
    `;
  }

  let barChart, doughnutChart, lineChart;
  function createCharts(data) {
    if (barChart) barChart.destroy();
    if (doughnutChart) doughnutChart.destroy();
    if (lineChart) lineChart.destroy();

    const ctxBar = document.getElementById("barChart")?.getContext("2d");
    if (ctxBar) {
      barChart = new Chart(ctxBar, {
        type: "bar",
        data: {
          labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
          datasets: [
            {
              label: "Temperature (°C)",
              data: [
                data.list[0].main.temp,
                data.list[8].main.temp,
                data.list[16].main.temp,
                data.list[24].main.temp,
                data.list[32].main.temp,
              ],
              backgroundColor: "rgba(75, 192, 192, 0.6)",
            },
          ],
        },
        options: {
          animation: {
            delay: 500,
          },
        },
      });
    }

    const ctxDoughnut = document
      .getElementById("doughnutChart")
      ?.getContext("2d");
    if (ctxDoughnut) {
      doughnutChart = new Chart(ctxDoughnut, {
        type: "doughnut",
        data: {
          labels: ["Cloudy", "Rainy", "Sunny"],
          datasets: [
            {
              label: "Weather Conditions",
              data: [
                data.list.filter((item) =>
                  item.weather[0].description.includes("cloud")
                ).length,
                data.list.filter((item) =>
                  item.weather[0].description.includes("rain")
                ).length,
                data.list.filter(
                  (item) =>
                    item.weather[0].description.includes("sunny") ||
                    item.weather[0].description.includes("clear")
                ).length,
              ],
              backgroundColor: ["#FFC107", "#FF69B4", "#33CC33"],
              hoverOffset: 4,
            },
          ],
        },
      });
    }

    const ctxLine = document.getElementById("lineChart")?.getContext("2d");
    if (ctxLine) {
      lineChart = new Chart(ctxLine, {
        type: "line",
        data: {
          labels: data.list.map((item) => item.dt_txt),
          datasets: [
            {
              label: "Temperature (°C)",
              data: data.list.map((item) => item.main.temp),
              backgroundColor: "rgba(255, 99, 132, 0.2)",
              borderColor: "rgba(255, 99, 132, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: false,
            },
          },
        },
      });
    }
  }

  function populateTable(data, page) {
    const tableBody = document.getElementById("weather-table-body");
    if (!tableBody) {
      console.error("Could not find element with ID 'weather-table-body'");
      return;
    }

    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = data.list.slice(startIndex, endIndex);

    tableBody.innerHTML = "";

    paginatedData.forEach((item) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.dt_txt}</td>
        <td>${item.main.temp}°C</td>
        <td>${item.main.humidity}%</td>
        <td>${item.wind.speed} m/s</td>
        <td>${item.clouds.all}%</td>
      `;
      tableBody.appendChild(row);
    });

    document.getElementById("page-number").textContent = `Page ${page}`;
  }

  document.getElementById("next-page").addEventListener("click", function () {
    if (weatherData && currentPage * rowsPerPage < weatherData.list.length) {
      currentPage++;
      populateTable(weatherData, currentPage);
    }
  });

  document.getElementById("prev-page").addEventListener("click", function () {
    if (weatherData && currentPage > 1) {
      currentPage--;
      populateTable(weatherData, currentPage);
    }
  });
});
