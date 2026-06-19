const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Debug: Check API key on startup
if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your_api_key_here') {
    console.error('\n❌ CRITICAL ERROR: OpenWeatherMap API key is missing or not configured!');
    console.error('📝 Please follow these steps:');
    console.error('   1. Create a .env file in the project root');
    console.error('   2. Add: OPENWEATHER_API_KEY=your_actual_api_key');
    console.error('   3. Get your free key from: https://openweathermap.org/api');
    console.error('   4. Restart the server\n');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Favicon handler - prevents 404 errors for favicon requests
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Root path - serve index.html
app.get('/', (req, res) => {
    console.log('📄 [ROUTE] GET / - Serving index.html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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
        if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your_api_key_here') {
            console.error('❌ API Key not configured');
            return res.status(500).json({ 
                error: 'API key not configured. Please check your .env file.' 
            });
        }

        const city = req.params.city.trim();
        const cacheKey = `weather_${city}`;

        // Check cache first
        let data = getCachedData(cacheKey);
        if (data) {
            console.log(`✅ [CACHE HIT] Weather data for ${city}`);
            return res.json({ data, source: 'cache' });
        }

        console.log(`🔄 [API CALL] Fetching weather for ${city}`);
        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                q: city,
                appid: OPENWEATHER_API_KEY,
                units: 'metric'
            }
        });

        // Cache the result
        setCachedData(cacheKey, response.data);
        console.log(`💾 [CACHED] Weather data stored for ${city}`);

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
        if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your_api_key_here') {
            console.error('❌ API Key not configured');
            return res.status(500).json({ 
                error: 'API key not configured. Please check your .env file.' 
            });
        }

        const city = req.params.city.trim();
        const cacheKey = `forecast_${city}`;

        let data = getCachedData(cacheKey);
        if (data) {
            console.log(`✅ [CACHE HIT] Forecast data for ${city}`);
            return res.json({ data, source: 'cache' });
        }

        console.log(`🔄 [API CALL] Fetching forecast for ${city}`);
        const response = await axios.get(`${BASE_URL}/forecast`, {
            params: {
                q: city,
                appid: OPENWEATHER_API_KEY,
                units: 'metric'
            }
        });

        setCachedData(cacheKey, response.data);
        console.log(`💾 [CACHED] Forecast data stored for ${city}`);

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
        if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your_api_key_here') {
            console.error('❌ API Key not configured');
            return res.status(500).json({ 
                error: 'API key not configured. Please check your .env file.' 
            });
        }

        const { lat, lon } = req.params;
        const cacheKey = `weather_${lat}_${lon}`;

        let data = getCachedData(cacheKey);
        if (data) {
            console.log(`✅ [CACHE HIT] Weather data for coordinates ${lat}, ${lon}`);
            return res.json({ data, source: 'cache' });
        }

        console.log(`🔄 [API CALL] Fetching weather for coordinates ${lat}, ${lon}`);
        const response = await axios.get(`${BASE_URL}/weather`, {
            params: {
                lat: lat,
                lon: lon,
                appid: OPENWEATHER_API_KEY,
                units: 'metric'
            }
        });

        setCachedData(cacheKey, response.data);
        console.log(`💾 [CACHED] Weather data stored for coordinates ${lat}, ${lon}`);

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
        if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your_api_key_here') {
            console.error('❌ API Key not configured');
            return res.status(500).json({ 
                error: 'API key not configured. Please check your .env file.' 
            });
        }

        const city = req.params.city.trim();
        
        console.log(`🔄 [API CALL] Fetching air quality for ${city}`);
        
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
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    console.log('🏥 [HEALTH CHECK] API status check');
    const status = {
        status: 'API is running',
        apiKeyConfigured: !!(OPENWEATHER_API_KEY && OPENWEATHER_API_KEY !== 'your_api_key_here'),
        environment: process.env.NODE_ENV || 'development'
    };
    res.json(status);
});

/**
 * Error handler
 */
function handleError(res, error) {
    console.error('❌ [ERROR]', error.message);

    if (error.response?.status === 404) {
        return res.status(404).json({ 
            error: 'City not found. Please check the spelling and try again.' 
        });
    }

    if (error.response?.status === 401) {
        return res.status(401).json({ 
            error: 'Invalid or expired API key. Please check your .env file.' 
        });
    }

    res.status(500).json({ 
        error: 'Failed to fetch weather data. Please try again later.' 
    });
}

// Catch-all 404 handler for API routes
app.use('/api', (req, res) => {
    console.warn(`⚠️  [404] API endpoint not found: ${req.method} ${req.path}`);
    res.status(404).json({ error: 'API endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🌤️  Weather Dashboard API Server`);
    console.log(`${'='.repeat(50)}`);
    console.log(`📍 Running on http://localhost:${PORT}`);
    console.log(`🔐 API Key configured: ${OPENWEATHER_API_KEY && OPENWEATHER_API_KEY !== 'your_api_key_here' ? '✅ Yes' : '❌ NO - CONFIGURE .env FILE'}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Static files: public/`);
    console.log(`\n✨ Dashboard ready! Open http://localhost:${PORT} in your browser`);
    console.log(`${'='.repeat(50)}\n`);
});
