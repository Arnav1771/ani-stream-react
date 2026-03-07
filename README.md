# AniStream React

A React-based anime streaming application with a Node.js/Express backend that uses the [Jikan API](https://jikan.moe/) (MyAnimeList) for anime data.

## 🚀 **Application Status: FIXED & WORKING** 

The application is now fully functional! All previous issues have been resolved:
- ✅ Backend server starts successfully  
- ✅ Frontend React app builds and serves correctly
- ✅ API endpoints are working with Jikan API integration
- ✅ No more 404 errors on root route
- ✅ No more ani-cli subprocess issues

## Architecture

- **Frontend**: React 18 with React Router for SPA navigation
- **Backend**: Node.js/Express server that proxies requests to the Jikan API  
- **Data Source**: [Jikan API v4](https://docs.api.jikan.moe/) (free, no API key required)

## Quick Start

### 1. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies 
cd ../client
npm install
```

### 2. Build & Start Application

```bash
# Build the React frontend
cd client
npm run build

# Start the backend server (serves both API and React app)
cd ../server  
npm run dev

# Server runs on http://localhost:5000
```

The application will be available at `http://localhost:5000`

## Development Mode

For development with hot reload:

```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start React development server  
cd client
npm start

# Backend: http://localhost:5000
# Frontend: http://localhost:3000
```

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/search?query=<q>` | Search for anime |
| `GET /api/anime?q=<q>` | Search anime (or trending if no query) |
| `GET /api/trending` | Get trending anime |
| `GET /api/recent` | Get recently added anime |
| `GET /api/anime/:id` | Get anime details |
| `GET /api/anime/:id/episodes` | Get anime episodes |

## Features

- 🔍 **Search**: Find anime by title
- 📈 **Trending**: Browse popular anime  
- 🆕 **Recent**: Discover newly added anime
- 📺 **Details**: View comprehensive anime information
- 🎬 **Trailers**: Watch YouTube trailers
- 📱 **Responsive**: Works on desktop and mobile

## Configuration

Environment variables (`.env` file):

```env
PORT=5000
NODE_ENV=development
REACT_APP_API_BASE_URL=http://localhost:5000/api
CORS_ORIGIN=http://localhost:3000
```

## Recent Improvements

The application has been completely modernized:
- 🔄 **Replaced ani-cli subprocess calls** with direct Jikan REST API integration
- 🛡️ **Enhanced security** by removing shell execution vulnerabilities  
- 🌐 **Better reliability** with proper error handling and retry logic
- 📦 **Simplified deployment** - no external dependencies required
- ⚡ **Improved performance** with HTTP requests instead of subprocess spawning

## Note on Streaming

This application uses the Jikan API for anime metadata and YouTube trailer URLs. For actual episode streaming, it provides links to official services like Crunchyroll, Funimation, etc.