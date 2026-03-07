# Technical Documentation

## Architecture

AniStream is a full-stack web application with a React frontend and a Node.js/Express backend.

### Backend (`/server`)

The backend acts as a proxy between the React frontend and the Jikan API (MyAnimeList). This avoids CORS issues and allows for server-side caching and error handling.

**Key files:**
- `app.js` - Express server with API routes and middleware
- `utils/animeService.js` - Service layer that wraps Jikan API calls with error handling and retry logic
- `routes/animeRoutes.js` - Alternative route definitions (used for modular routing)

**Data flow:**
1. Client sends request to Express backend (e.g., `GET /api/anime/12345`)
2. Backend calls Jikan API (`https://api.jikan.moe/v4/anime/12345/full`)
3. Backend transforms the response into a consistent format
4. Client receives structured anime data

### Frontend (`/client`)

The frontend is a React SPA built with Create React App.

**Key files:**
- `src/App.js` - Main router component
- `src/services/api.js` - Axios-based API client for backend communication
- `src/pages/HomePage.js` - Trending and recent anime display
- `src/pages/Search.js` - Anime search page
- `src/pages/AnimeDetailPage.js` - Anime detail view with video player and episode listing

### API Data Source

This project uses the [Jikan API v4](https://docs.api.jikan.moe/) which provides:
- Anime search, details, and episode metadata from MyAnimeList
- Trailer URLs (YouTube embeds)
- Links to official streaming services
- Rate limit: ~3 requests/second (handled with retry logic in `animeService.js`)

### Previous Architecture (ani-cli)

The original backend used `ani-cli` (a command-line tool for watching anime) by spawning it as a subprocess. This approach was replaced because:
- `ani-cli` is designed for Linux desktop environments and requires `mpv` player
- It cannot run in web server/cloud environments
- Subprocess spawning is fragile and platform-dependent
- `ani-cli` does not natively expose stream URLs via stdout

The current implementation uses the Jikan REST API instead, which works in any Node.js environment.

