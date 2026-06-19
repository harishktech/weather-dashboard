# 🌤️ Weather Dashboard

A comprehensive, responsive weather dashboard application that fetches real-time weather data from the OpenWeatherMap API. Features include current weather, 5-day forecasts, air quality data, and favorites management.

## ✨ Features

- **Real-time Weather Data**: Current conditions for any city worldwide
- **5-Day Forecast**: Detailed weather predictions
- **Air Quality Information**: Pollution levels and air quality index
- **Geolocation Support**: Get weather for your current location
- **Favorites Management**: Save and quickly access favorite cities
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smart Caching**: API response caching for improved performance
- **Error Handling**: Comprehensive error messages and validation
- **Modern UI**: Beautiful gradient design with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js 14+ or Python 3.8+
- OpenWeatherMap API key (free at https://openweathermap.org/api)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/harishktech/weather-dashboard.git
   cd weather-dashboard
   ```

2. **Setup Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your OpenWeatherMap API key
   ```

3. **Choose Your Backend**

   **For Node.js:**
   ```bash
   npm install
   npm run dev
   ```

   **For Python:**
   ```bash
   pip install -r requirements.txt
   python app.py
   ```

4. **Open in Browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
weather-dashboard/
├── public/
│   └── index.html              # Frontend dashboard
├── server.js                   # Node.js/Express backend
├── app.py                      # Python/Flask backend
├── package.json                # Node.js dependencies
├── requirements.txt            # Python dependencies
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── LICENSE                     # MIT License
└── README.md                   # This file
```

## 🔧 API Endpoints

### Node.js/Express Endpoints

- `GET /api/weather/:city` - Get current weather for a city
- `GET /api/forecast/:city` - Get 5-day forecast
- `GET /api/coordinates/:lat/:lon` - Get weather by coordinates
- `GET /api/air-quality/:city` - Get air quality data
- `GET /api/health` - Health check

### Python/Flask Endpoints

- `GET /api/weather/<city>` - Get current weather for a city
- `GET /api/forecast/<city>` - Get 5-day forecast
- `GET /api/coordinates/<lat>/<lon>` - Get weather by coordinates
- `GET /api/air-quality/<city>` - Get air quality data
- `GET /api/health` - Health check

## 🎨 Frontend Features

### Current Weather Display
- City name and country
- Current temperature
- Weather condition with icon
- "Feels like" temperature
- Humidity percentage
- Atmospheric pressure
- Wind speed
- Max/min temperatures
- Visibility distance
- Cloud coverage

### 5-Day Forecast
- Daily weather predictions
- Temperature trends
- Weather icons
- Weather descriptions

### User Interface
- Responsive grid layout
- Search functionality
- Favorites management
- Loading states
- Error messages
- LocalStorage for favorites persistence

## 🔑 Getting an API Key

1. Visit [OpenWeatherMap API](https://openweathermap.org/api)
2. Sign up for a free account
3. Navigate to API Keys section
4. Copy your API key
5. Add it to your `.env` file

## 📊 Example Response

```json
{
  "data": {
    "coord": {"lon": -0.1257, "lat": 51.5085},
    "weather": [{"id": 803, "main": "Clouds", "description": "broken clouds", "icon": "04d"}],
    "main": {
      "temp": 15.5,
      "feels_like": 14.8,
      "temp_min": 13.2,
      "temp_max": 17.1,
      "pressure": 1013,
      "humidity": 72
    },
    "wind": {"speed": 4.5},
    "clouds": {"all": 75},
    "name": "London",
    "sys": {"country": "GB"}
  },
  "source": "api"
}
```

## 🛠️ Technologies Used

**Frontend:**
- HTML5
- CSS3 (Grid, Flexbox, Animations)
- Vanilla JavaScript (ES6+)

**Backend Options:**
- Node.js + Express.js (JavaScript)
- Python + Flask

**APIs:**
- OpenWeatherMap API

**Tools:**
- Git & GitHub
- npm / pip
- dotenv (environment variables)

## 📝 Usage Examples

### Search for Weather
1. Enter a city name in the search box
2. Press Enter or click Search
3. View current weather and forecast

### Save Favorites
1. Search for a city
2. The city is automatically added to favorites
3. Click favorite buttons for quick access
4. Favorites are saved in your browser

### Clear Favorites
Favorites are stored in browser's localStorage. To clear:
- Open Browser DevTools (F12)
- Go to Application > LocalStorage
- Find and delete "weatherFavorites"

## 🚀 Deployment

### Deploy to Heroku (Node.js)

```bash
heroku create weather-dashboard-app
heroku config:set OPENWEATHER_API_KEY=your_api_key
git push heroku main
```

### Deploy to Vercel (Frontend Only)

```bash
vercel --prod
```

### Deploy to AWS Lambda (Python)

See AWS Lambda deployment guide for Flask applications

## 📚 API Documentation

### Current Weather Endpoint

**Request:**
```bash
curl -X GET 'http://localhost:3000/api/weather/London'
```

**Response:**
```json
{
  "data": { /* weather data */ },
  "source": "api"
}
```

### Forecast Endpoint

**Request:**
```bash
curl -X GET 'http://localhost:3000/api/forecast/London'
```

## 🐛 Troubleshooting

### "City not found" Error
- Check city spelling
- Use English city names
- Try with country code (e.g., "London, GB")

### API Key Issues
- Verify API key in .env file
- Check API key is active on OpenWeatherMap
- Ensure rate limits not exceeded

### CORS Errors
- Backend CORS is properly configured
- Ensure frontend requests go through backend proxy

### Caching Issues
- Cache duration is 10 minutes by default
- Clear browser cache if needed
- Restart server to clear server-side cache

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📧 Support

For issues, questions, or suggestions, please:
- Open an issue on GitHub
- Check existing issues first
- Provide detailed error messages

## 🙏 Acknowledgments

- OpenWeatherMap for providing the weather API
- All contributors and users

---

**Made with ❤️ by Harish**
