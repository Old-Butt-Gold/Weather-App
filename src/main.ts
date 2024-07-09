import './style.css';
import { weatherConditions, WeatherCondition } from "./WeatherConditions.ts";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div class="weather-app">
        <div id="alert-dialog" class="dialog">
            <div class="dialog-content">
                <p id="dialog-message"></p>
                <button id="dialog-close">Close</button>
            </div>
        </div>
        <div class="container">
            <h3 class="brand">The Weather</h3>
            <div>
                <h1 class="temp">0&#176;</h1>
                <div class="city-time">
                    <h1 class="name">CITY</h1>
                    <small>
                        <span class="time">TIME</span> -
                        <span class="date">DATE</span>
                    </small>
                </div>
                <div class="weather">
                    <img class="icon" alt="icon" width="50" height="50"/>
                    <span class="condition">Weather-condition</span>
                </div>
                <!--<div class="forecast-cards"></div>-->
            </div>
        </div>
        <div class="panel">
            <form id="locationInput">
                <input type="text" class="search" placeholder="Search Location..."/>
                <button type="submit" class="submit">
                    <i class="fas fa-search"></i>
                </button>
            </form>
            <ul class="cities">
                <li class="city">New York</li>
                <li class="city">Minsk</li>
                <li class="city">Moscow</li>
                <li class="city">Paris</li>
            </ul>
            <ul class="details">
                <h4>Weather Details</h4>
                <li>
                    <span>Cloudy</span>
                    <span class="cloud">?%</span>
                </li>
                <li>
                    <span>Humidity</span>
                    <span class="humidity">?%</span>
                </li>
                <li>
                    <span>Wind</span>
                    <span class="wind">?km/h</span>
                </li>
            </ul>
        </div>
    </div>
`;

function dayOfTheWeek(day: number, month: number, year: number): string {
    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return weekday[new Date(`${year}-${month}-${day}`).getDay()];
}

async function fetchWeatherData(city: string) {
    const apiKey = 'a92b8b1a6077445fb9c163537240903';
    try {
        const response = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&aqi=no&alerts=no`);
        if (!response.ok) throw new Error('City not found');

        const data = await response.json();
        updateWeatherData(data);
        app.style.opacity = '1';
    } catch (error: any) {
        showDialog(error.message || 'City not found, please try again');
        app.style.opacity = '1';
    }
}

function updateWeatherData(data: any) {
    icon.src = data.current.condition.icon;
    temp.innerHTML = `${data.current.temp_c}&#176;`;
    conditionOutput.innerText = data.current.condition.text;

    const date = data.location.localtime;
    const [year, month, day, time] = [
        date.slice(0, 4),
        date.slice(5, 7),
        date.slice(8, 10),
        date.slice(11)
    ];

    dateOutput.innerHTML = `${dayOfTheWeek(parseInt(day), parseInt(month), parseInt(year))} ${parseInt(day)}, ${month} ${year}`;
    timeOutput.innerHTML = time;
    nameOutput.innerHTML = data.location.name;

    cloudOutput.innerHTML = `${data.current.cloud}%`;
    humidityOutput.innerHTML = `${data.current.humidity}%`;
    windOutput.innerHTML = `${data.current.wind_kph}km/h`;

    setBackgroundAndButton(data);
}

function setBackgroundAndButton(data: any) {
    const timeOfDay = data.current.is_day ? 'day' : 'night';
    const code = data.current.condition.code;
    const weatherCondition : WeatherCondition = weatherConditions[code]!;

    btn.style.background = timeOfDay === 'day' ? weatherCondition.btnDay : weatherCondition.btnNight;

    app.style.opacity = '1';
}

function showDialog(message: string) {
    const dialog = document.querySelector<HTMLDivElement>('#alert-dialog')!;
    const dialogMessage = document.querySelector<HTMLParagraphElement>('#dialog-message')!;
    dialogMessage.textContent = message;
    dialogMessage.style.color = btn.style.backgroundColor;
    dialog.style.display = 'block';
}

const app = document.querySelector<HTMLDivElement>('.weather-app')!;
const temp = document.querySelector<HTMLHeadingElement>('.temp')!;
const dateOutput = document.querySelector<HTMLSpanElement>('.date')!;
const timeOutput = document.querySelector<HTMLSpanElement>('.time')!;
const conditionOutput = document.querySelector<HTMLSpanElement>('.condition')!;
const nameOutput = document.querySelector<HTMLHeadingElement>('.name')!;
const icon = document.querySelector<HTMLImageElement>('.icon')!;
const cloudOutput = document.querySelector<HTMLSpanElement>('.cloud')!;
const humidityOutput = document.querySelector<HTMLSpanElement>('.humidity')!;
const windOutput = document.querySelector<HTMLSpanElement>('.wind')!;
const form = document.getElementById('locationInput') as HTMLFormElement;
const search = document.querySelector<HTMLInputElement>('.search')!;
const btn = document.querySelector<HTMLButtonElement>('.submit')!;
const cities = document.querySelectorAll<HTMLLIElement>('.city');

cities.forEach(city => {
    city.addEventListener('click', e => {
        const target = e.target as HTMLLIElement;
        fetchWeatherData(target.innerHTML);
        app.style.opacity = '0';
    });
});

form.addEventListener('submit', e => {
    e.preventDefault();
    if (search.value.trim().length === 0) {
        showDialog('Please type in a city name');
    } else {
        fetchWeatherData(search.value.trim());
        search.value = '';
        app.style.opacity = '0';
    }
});

document.querySelector<HTMLButtonElement>('#dialog-close')!.addEventListener('click', () => {
    const dialog = document.querySelector<HTMLDivElement>('#alert-dialog')!;
    dialog.style.display = 'none';
});

fetchWeatherData('Minsk');
