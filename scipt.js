// global declarations

// stores all the city names
let cities = [];

// selections
let main = document.querySelector("main");

let show_searchOverlay_btn = document.querySelector(".search-icon");
let search_overlay = document.querySelector(".search-overlay");
let search_overlay_btn = document.querySelector(".search-btn");
let close_icon = document.querySelector(".close-icon");
let search_input = document.querySelector(".search-input");
let suggestions = document.querySelector(".suggestions");

let top_weather_left_children =
  document.querySelector(".main-weather-left").children;

let top_weather_right_img = document.querySelector("#main-weather-right-img");

let forecastbox = document.querySelector(".forecastbox");

// this is for responsive only
let cross = document.querySelector(".cross");
let menu = document.querySelector(".menu");
let phase = "hidden";
let left_weather_box = document.querySelector(".left-weather");

// functions

// updates day and time
function setup_day_time() {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let day_time_child = document.querySelector(".day-time").children;

  let date = new Date();
  let hr, mn, sc;

  day_time_child[0].innerHTML = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;

  setInterval(() => {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    day_time_child[1].innerHTML = `${hours}:${minutes}:${seconds}`;
  }, 1000);
}

setup_day_time();

// gets all the available city names
async function fetch_cities() {
  let raw = await fetch("https://countriesnow.space/api/v0.1/countries");

  const needed = await raw.json();

  cities = needed.data;
}

fetch_cities();

// renders suggestions based on given input
function render_suggestions(data_to_render) {
  let clutter = ``;
  data_to_render.forEach((ech, idx) => {
    if (idx < 10) {
      clutter += `    <div class="ech-suggestion" id="${idx}">
                        <div class="left-suggestion" id="${idx}">
                            <i class="ri-search-2-line search-suggestions" id="${idx}"></i>
                            <h2 id="${idx}">${ech.city}</h2>
                        </div>
                        <h5 id="${idx}">${ech.country}</h5>
                    </div>`;
    }
  });

  suggestions.innerHTML = clutter;
}

// shows suggestions based on input
function select_cities(dets) {
  let similar_cities = [];

  cities.forEach((country) => {
    country.cities.forEach((city) => {
      if (city.toLowerCase().startsWith(dets.toLowerCase())) {
        similar_cities.push({
          city,
          country: country.country,
        });
      }
    });
  });

  if (similar_cities.length === 0) {
    suggestions.innerHTML = "Sorry, city not found";
    return;
  }

  render_suggestions(similar_cities);
}

// fetchs the crr weather,forecast etc...
async function fetch_weather(dets) {
  let key = `dda17357cf1b485897f202035262006`;
  let url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${dets}&days=7`;

  try {
    const raw = await fetch(url);

    if (!raw.ok) {
      throw new Error(`HTTP Error ${raw.status}`);
    }

    const data = await raw.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    setup_top_weather({
      place: data.location.name,
      condition: data.current.condition.text,
      temp: data.current.temp_c,
      src: data.current.condition.icon,
    });

    setup_forecast(data.forecast.forecastday);

    setup_tdy_forecast(data.forecast.forecastday[0].hour);

    render_details(data.current);
  } catch (err) {
    console.log(err.message);
  }
}

fetch_weather("bikaner");

function setup_tdy_forecast(dets) {
  // console.log(dets);
  let selected = [];
  let time = 6;
  let am_pm = `AM`;

  dets.forEach((ech, id) => {
    if (id >= 6 && id % 3 == 0) {
      selected.push({
        time: `${String(time).padStart(2, 0)}:00 ${am_pm}`,
        url: `https:` + ech.condition.icon,
        deg: ech.temp_c,
      });

      if (time == 12) {
        time = 3;
        am_pm = `PM`;
      } else {
        time += 3;
      }
    }
  });

  render_tdy_forecast(selected);
}

function render_details(dets) {
  let details = document.querySelectorAll(".bottom-weather-value");

  details[0].innerHTML = `${dets.temp_c}&deg;`;
  details[1].innerHTML = `${dets.wind_kph} km/h`;
  details[2].innerHTML = dets.wind_degree;
  details[3].innerHTML = `${dets.chance_of_rain}%`;
  details[4].innerHTML = `${dets.dewpoint_c}&deg;`;
  details[5].innerHTML = `${dets.cloud}%`;
  details[6].innerHTML = `${dets.gust_kph} km/h`;
}

function render_tdy_forecast(parm) {
  let clutter = ``;

  parm.forEach((ech, idx) => {
    clutter += `        <div class="ech-tdy-forecast" id=${idx}>
                            <h3>${ech.time}</h3>
                            <img src="${ech.url}" alt="">
                            <h3>${ech.deg}&deg;C</h3>
                        </div>`;
  });

  document.querySelector(".lower-tdy-forecast").innerHTML = clutter;
}

// updated the top weather box
function setup_top_weather({ place, condition, temp, src }) {
  top_weather_left_children[0].innerHTML = place;
  top_weather_left_children[1].innerHTML = condition;
  top_weather_left_children[2].innerHTML = temp + `&deg;C`;

  top_weather_right_img.style.visibility = "visible";
  top_weather_right_img.src = `https:` + src;
}

function setup_forecast(forecast) {
  let forcast_data = [];

  let date, url, type, deg;

  forecast.forEach((ech) => {
    date = ech.date;

    let day = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
    });

    url = `https:` + ech.day.condition.icon;

    type = ech.day.condition.text;

    deg = `${ech.day.avgtemp_c}&deg;C`;

    forcast_data.push({ day, url, type, deg });
  });

  // console.log(forcast_data)
  render_forecast(forcast_data);
}

function render_forecast(data) {
  let clutter = ``;

  data.forEach((ech) => {
    clutter += `        <div class="ech-forecast">
                            <h3>${ech.day}</h3>

                            <img src="${ech.url}" alt="">

                            <p>${ech.type}</p>

                            <h4>${ech.deg}</h4>
                        </div>`;
  });

  forecastbox.innerHTML = clutter;
}

function makeResp() {
  left_weather_box.style.width = `0px`;
  left_weather_box.style.display = "none";

  cross.style.display = "block";
  menu.style.display = "block";
}
// event listners

// this is to show overlay
show_searchOverlay_btn.addEventListener("click", (e) => {
  search_overlay.style.display = `block`;
});

// this is to close overlay
close_icon.addEventListener("click", (e) => {
  search_overlay.style.display = `none`;
  search_input.value = ``;
});

search_input.addEventListener("input", (e) => {
  if (search_input.value.length >= 4) {
    suggestions.style.visibility = "visible";
    select_cities(search_input.value);
  } else {
    suggestions.style.visibility = "hidden";
  }
});

search_overlay.addEventListener("click", (e) => {
  if (e.target.className == `ech-suggestion`) {
    search_input.value = e.target.children[0].children[1].innerHTML;
    fetch_weather(search_input.value);

    search_input.value = "";
    search_overlay.style.display = "none";
    suggestions.style.visibility = "hidden";
  } else if (e.target.className == `search-overlay`) {
    search_overlay.style.display = "none";
  } else if (e.target.className == `search-btn`) {
    fetch_weather(search_input.value);

    search_input.value = "";
    search_overlay.style.display = "none";
    suggestions.style.visibility = "hidden";
  }
});

menu.addEventListener("click", (e) => {
  phase = "visible";
  menu.style.display = "none";
  left_weather_box.style.width = `300px`;
  left_weather_box.style.display = "block";
  left_weather_box.style.backdropFilter = `blur(4px)`;
});

cross.addEventListener("click", (e) => {
  phase = "hidden";
  menu.style.display = "block";
  left_weather_box.style.width = `0px`;
  left_weather_box.style.display = "none";
});

window.addEventListener("resize", makeResp);

// regarding responsiveness

let main_rect = main.getBoundingClientRect();

if (main_rect.width <= 1000) {
  makeResp();
}
