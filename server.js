const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Cache for API responses
const cache = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Helper function to get cached data
function getCachedData(key) {
    const cached = cache[key];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
}

// Helper function to set cached data
function setCachedData(key, data) {
    cache[key] = {
        data: data,
        timestamp: Date.now()
    };
}

/**
 * GET /api/weather/:city
 * Fetch current weather for a city
 */
app.get('/api/weather/:city', async (req, res) => {
    try {
        const city = req.params.city.trim();
        const cacheKey = `weather_${city}`;

        // Check cache first
        let data = getCachedData(cacheKey);
        if (data) {
            return res.json({ data, source: 'cache' });
        }

        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                q: city,
                appid: OPENWEATHER_API_KEY,
                units: 'metric'
            }
        });

        // Cache the result
        setCachedData(cacheKey, response.data);

        res.json({ data: response.data, source: 'api' });
    } catch (error) {
        handleError(res, error);
    }
});

/**
 * GET /api/forecast/:city
 * Fetch 5-day forecast for a city
 */
app.get('/api/forecast/:city', async (req, res) => {
    try {
        const city = req.params.city.trim();
        const cacheKey = `forecast_${city}`;

        let data = getCachedData(cacheKey);
        if (data) {
            return res.json({ data, source: 'cache' });
        }

        const response = await axios.get(`${BASE_URL}/forecast`, {
            params: {
                q: city,
                appid: OPENWEATHER_API_KEY,
                units: 'metric'
            }
        });

        setCachedData(cacheKey, response.data);

        res.json({ data: response.data, source: 'api' });
    } catch (error) {
        handleError(res, error);
    }
});

/**
 * GET /api/coordinates/:lat/:lon
 * Fetch weather using latitude and longitude
 */
app.get('/api/coordinates/:lat/:lon', async (req, res) => {
    try {
        const { lat, lon } = req.params;
        const cacheKey = `weather_${lat}_${lon}`;

        let data = getCachedData(cacheKey);
        if (data) {
            return res.json({ data, source: 'cache' });
        }

        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                lat: lat,
                lon: lon,
                appid: OPENWEATHER_API_KEY,
                units: 'metric'
            }
        });

        setCachedData(cacheKey, response.data);

        res.json({ data: response.data, source: 'api' });
    } catch (error) {
        handleError(res, error);
    }
});

/**
 * GET /api/air-quality/:city
 * Fetch air quality data
 */
app.get('/api/air-quality/:city', async (req, res) => {
    try {
        const city = req.params.city.trim();
        
        // First get coordinates
        const geoResponse = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
            params: {
                q: city,
                limit: 1,
                appid: OPENWEATHER_API_KEY
            }
        });

        if (geoResponse.data.length === 0) {
            return res.status(404).json({ error: 'City not found' });
        }

        const { lat, lon } = geoResponse.data[0];

        // Get air quality
        const aqResponse = await axios.get(`${BASE_URL}/air_pollution`, {
            params: {
                lat: lat,
                lon: lon,
                appid: OPENWEATHER_API_KEY
            }
        });

        res.json(aqResponse.data);
    } catch (error) {
        handleError(res, error);
    }
});

/**
 * Error handler
 */
function handleError(res, error) {
    console.error('API Error:', error.message);

    if (error.response?.status === 404) {
        return res.status(404).json({ 
            error: 'City not found. Please check the spelling and try again.' 
        });
    }

    if (error.response?.status === 401) {
        return res.status(401).json({ 
            error: 'Invalid API key' 
        });
    }

    res.status(500).json({ 
        error: 'Failed to fetch weather data. Please try again later.' 
    });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'API is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🌤️  Weather API Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
