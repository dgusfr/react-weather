import React, { useState, useEffect } from "react";
import {
  getWeatherByCity,
  getForecastByCity,
} from "../services/weatherService";
import Loader from "./Loader";

function WeatherApp() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cityHistory, setCityHistory] = useState([]);

  const fetchWeather = async () => {
    if (!city) {
      setError("Por favor, insira o nome de uma cidade.");
      return;
    }

    setLoading(true);
    setError(null);
    setWeatherData(null);
    setForecastData(null);

    try {
      const weather = await getWeatherByCity(city);
      const forecast = await getForecastByCity(city);
      setWeatherData(weather);

      // Filtro para selecionar apenas 1 previsão por dia (exemplo: previsão de meio-dia)
      const filteredForecast = forecast.list.filter((forecastItem) => {
        return forecastItem.dt_txt.includes("12:00:00");
      });

      setForecastData(filteredForecast);
      addToHistory(city); // Adicionar cidade ao histórico
    } catch (error) {
      setError("Erro ao buscar a previsão.");
    } finally {
      setLoading(false);
    }
  };

  const addToHistory = (city) => {
    setCityHistory([city, ...cityHistory.filter((c) => c !== city)]);
  };

  const translateWeatherDescription = (description) => {
    const translations = {
      "clear sky": "céu limpo",
      "few clouds": "poucas nuvens",
      "scattered clouds": "nuvens dispersas",
      "broken clouds": "nuvens quebradas",
      "shower rain": "chuva de pancada",
      rain: "chuva",
      "light rain": "chuva leve",
      "moderate rain": "chuva moderada",
      "heavy rain": "chuva forte",
      thunderstorm: "trovoada",
      snow: "neve",
      mist: "névoa",
    };

    return translations[description] || description;
  };

  const getRainInfo = (forecast) => {
    if (forecast.rain && forecast.rain["3h"]) {
      return `Chuva: ${forecast.rain["3h"]} mm nas últimas 3 horas`;
    } else if (forecast.rain && forecast.rain["1h"]) {
      return `Chuva: ${forecast.rain["1h"]} mm na última hora`;
    }
    return "Sem precipitação";
  };

  return (
    <div className="weather-card">
      <header>
        <h1>Previsão do Tempo</h1>
        <input
          type="text"
          placeholder="Digite o nome da cidade"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeather} disabled={loading || !city}>
          {loading ? "Carregando..." : "Buscar"}
        </button>
      </header>

      {error && <p className="error">{error}</p>}
      {loading && <Loader />}

      {/* Histórico de Cidades Pesquisadas */}
      {cityHistory.length > 0 && (
        <div className="city-history">
          <h2>Histórico de Cidades</h2>
          <ul>
            {cityHistory.map((cityItem, index) => (
              <li key={index} onClick={() => setCity(cityItem)}>
                {cityItem}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Previsão Atual */}
      {weatherData && (
        <div className="weather-current">
          <h2>
            {weatherData.name} - {weatherData.sys.country}
          </h2>
          <p>{new Date().toLocaleTimeString()}</p>
          <p>
            {translateWeatherDescription(weatherData.weather[0].description)}
          </p>
          <div className="weather-details">
            <p>Humidade: {weatherData.main.humidity}%</p>
            <p>Vento: {weatherData.wind.speed} km/h</p>
            <p>Sensação térmica: {weatherData.main.feels_like}°C</p>
          </div>
        </div>
      )}

      {/* Previsão para os próximos 5 dias */}
      {forecastData && (
        <div className="forecast-container">
          {forecastData.slice(0, 5).map((forecast, index) => (
            <div key={index} className="forecast-card">
              <h3>
                {new Date(forecast.dt_txt).toLocaleDateString("pt-BR", {
                  weekday: "long",
                })}
              </h3>
              <img
                src={`http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`}
                alt={forecast.weather[0].description}
              />
              <p>
                {forecast.main.temp_min}° / {forecast.main.temp_max}°
              </p>
              <p>
                {translateWeatherDescription(forecast.weather[0].description)}
              </p>
              <p>{getRainInfo(forecast)}</p>{" "}
              {/* Exibe informações de chuva, se houver */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default WeatherApp;
