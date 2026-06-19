from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os
from datetime import datetime, timedelta
import logging

app = Flask(__name__)
CORS(app)

# Configuration
OPENWEATHER_API_KEY = os.getenv('OPENWEATHER_API_KEY')
BASE_URL = 'https://api.openweathermap.org/data/2.5'
CACHE_TIMEOUT = 600  # 10 minutes

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Simple cache implementation
cache = {}

def get_cache(key):
    """Get data from cache if not expired"""
    if key in cache:
        data, timestamp = cache[key]
        if datetime.now() - timestamp < timedelta(seconds=CACHE_TIMEOUT):
            return data
    return None

def set_cache(key, data):
    """Store data in cache"""
    cache[key] = (data, datetime.now())

@app.route('/api/weather/<city>', methods=['GET'])
def get_weather(city):
    """Fetch current weather for a city"""
    try:
        city = city.strip()
        cache_key = f'weather_{city}'
        
        # Check cache
        cached_data = get_cache(cache_key)
        if cached_data:
            return jsonify({'data': cached_data, 'source': 'cache'}), 200
        
        # Fetch from API
        response = requests.get(
            f'{BASE_URL}/weather',
            params={
                'q': city,
                'appid': OPENWEATHER_API_KEY,
                'units': 'metric'
            }
        )
        
        if response.status_code == 404:
            return jsonify({'error': 'City not found'}), 404
        
        response.raise_for_status()
        data = response.json()
        
        # Cache the result
        set_cache(cache_key, data)
        
        return jsonify({'data': data, 'source': 'api'}), 200
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching weather: {str(e)}")
        return jsonify({'error': 'Failed to fetch weather data'}), 500

@app.route('/api/forecast/<city>', methods=['GET'])
def get_forecast(city):
    """Fetch 5-day forecast"""
    try:
        city = city.strip()
        cache_key = f'forecast_{city}'
        
        cached_data = get_cache(cache_key)
        if cached_data:
            return jsonify({'data': cached_data, 'source': 'cache'}), 200
        
        response = requests.get(
            f'{BASE_URL}/forecast',
            params={
                'q': city,
                'appid': OPENWEATHER_API_KEY,
                'units': 'metric'
            }
        )
        
        response.raise_for_status()
        data = response.json()
        
        set_cache(cache_key, data)
        
        return jsonify({'data': data, 'source': 'api'}), 200
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching forecast: {str(e)}")
        return jsonify({'error': 'Failed to fetch forecast'}), 500

@app.route('/api/coordinates/<float:lat>/<float:lon>', methods=['GET'])
def get_weather_by_coordinates(lat, lon):
    """Get weather by coordinates"""
    try:
        cache_key = f'weather_{lat}_{lon}'
        
        cached_data = get_cache(cache_key)
        if cached_data:
            return jsonify({'data': cached_data, 'source': 'cache'}), 200
        
        response = requests.get(
            f'{BASE_URL}/weather',
            params={
                'lat': lat,
                'lon': lon,
                'appid': OPENWEATHER_API_KEY,
                'units': 'metric'
            }
        )
        
        response.raise_for_status()
        data = response.json()
        
        set_cache(cache_key, data)
        
        return jsonify({'data': data, 'source': 'api'}), 200
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching weather: {str(e)}")
        return jsonify({'error': 'Failed to fetch weather data'}), 500

@app.route('/api/air-quality/<city>', methods=['GET'])
def get_air_quality(city):
    """Get air quality data"""
    try:
        # Get coordinates first
        geo_response = requests.get(
            'https://api.openweathermap.org/geo/1.0/direct',
            params={
                'q': city,
                'limit': 1,
                'appid': OPENWEATHER_API_KEY
            }
        )
        
        geo_response.raise_for_status()
        geo_data = geo_response.json()
        
        if not geo_data:
            return jsonify({'error': 'City not found'}), 404
        
        lat, lon = geo_data[0]['lat'], geo_data[0]['lon']
        
        # Get air quality
        aq_response = requests.get(
            f'{BASE_URL}/air_pollution',
            params={
                'lat': lat,
                'lon': lon,
                'appid': OPENWEATHER_API_KEY
            }
        )
        
        aq_response.raise_for_status()
        
        return jsonify(aq_response.json()), 200
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching air quality: {str(e)}")
        return jsonify({'error': 'Failed to fetch air quality data'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'API is running'}), 200

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=3000)
