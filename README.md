# AniStream React

A React-based anime streaming application with a Node.js/Express backend that uses the [Jikan API](https://jikan.moe/) (MyAnimeList) for anime data.

## Architecture

- **Frontend**: React 18 with React Router for SPA navigation
- **Backend**: Node.js/Express server that proxies requests to the Jikan API
- **Data Source**: [Jikan API v4](https://docs.api.jikan.moe/) (free, no API key required)

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Arnav1771/ani-stream-react.git
   cd ani-stream-react
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

### Running in Development

1. Start the backend server (from the `server/` directory):
   ```bash
   npm run dev
   ```
   The server runs on `http://localhost:5000`.

2. Start the React frontend (from the `client/` directory):
   ```bash
   npm start
   ```
   The client runs on `http://localhost:3000`.

### Running in Production

1. Build the client:
   ```bash
   cd client
   npm run build
   ```

2. Start the server in production mode:
   ```bash
   cd ../server
   NODE_ENV=production npm start
   ```
   The server will serve both the API and the built React app.

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/search?query=<q>` | Search for anime |
| `GET /api/anime?q=<q>` | Search anime (or trending if no query) |
| `GET /api/trending` | Get trending anime |
| `GET /api/recent` | Get recently added anime |
| `GET /api/anime/:id` | Get anime details |
| `GET /api/anime/:id/episodes` | Get anime episodes |
| `GET /api/anime/:id/episodes/:ep/stream` | Get stream/trailer info |

## Configuration

Environment variables (`.env` file in the project root):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `REACT_APP_API_BASE_URL` | `http://localhost:5000/api` | API base URL for the client |

## Note on Streaming

This application uses the Jikan API for anime metadata. For video content, it provides YouTube trailer URLs and links to official streaming services (Crunchyroll, Funimation, etc.). Direct episode streaming requires integration with a dedicated streaming service.