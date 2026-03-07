require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const animeService = require('./utils/animeService');
const streamingService = require('./utils/streamingService');

const app = express();

// --- Configuration ---
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// --- Middleware ---

if (NODE_ENV === 'development') {
    app.use(cors());
} else {
    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true
    }));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API Routes ---
const API_BASE_PATH = '/api';

// Search for anime
app.get(`${API_BASE_PATH}/search`, async (req, res, next) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required.' });
    }

    try {
        const results = await animeService.searchAnime(query);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No anime found matching your query.' });
        }

        res.json(results);
    } catch (error) {
        next(error);
    }
});

// Fetch anime list (supports query param for search, returns trending if no query)
app.get(`${API_BASE_PATH}/anime`, async (req, res, next) => {
    const { q } = req.query;

    try {
        let results;
        if (q) {
            results = await animeService.searchAnime(q);
        } else {
            results = await animeService.fetchTrendingAnime();
        }
        res.json(results);
    } catch (error) {
        next(error);
    }
});

// Fetch trending anime
app.get(`${API_BASE_PATH}/trending`, async (req, res, next) => {
    try {
        const results = await animeService.fetchTrendingAnime();
        res.json(results);
    } catch (error) {
        next(error);
    }
});

// Fetch recently added anime
app.get(`${API_BASE_PATH}/recent`, async (req, res, next) => {
    try {
        const results = await animeService.fetchRecentAnime();
        res.json(results);
    } catch (error) {
        next(error);
    }
});

// Fetch anime details by ID
app.get(`${API_BASE_PATH}/anime/:animeId`, async (req, res, next) => {
    const { animeId } = req.params;

    try {
        const details = await animeService.fetchAnimeDetails(animeId);
        res.json(details);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'Anime not found.' });
        }
        next(error);
    }
});

// Fetch episodes for an anime
app.get(`${API_BASE_PATH}/anime/:animeId/episodes`, async (req, res, next) => {
    const { animeId } = req.params;
    const { page } = req.query;

    try {
        const episodes = await animeService.fetchAnimeEpisodes(animeId, page || 1);
        res.json(episodes);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: 'No episodes found for this anime.' });
        }
        next(error);
    }
});

// Fetch stream info for a specific episode (path: /anime/:animeId/episodes/:episodeId/stream)
app.get(`${API_BASE_PATH}/anime/:animeId/episodes/:episodeId/stream`, async (req, res, next) => {
    const { animeId, episodeId } = req.params;

    try {
        const streamInfo = await animeService.fetchStreamInfo(animeId, episodeId);
        res.json(streamInfo);
    } catch (error) {
        next(error);
    }
});

// Fetch stream info (alternate path: /anime/:animeId/episode/:episodeNumber/stream)
app.get(`${API_BASE_PATH}/anime/:animeId/episode/:episodeNumber/stream`, async (req, res, next) => {
    const { animeId, episodeNumber } = req.params;

    try {
        const streamInfo = await animeService.fetchStreamInfo(animeId, episodeNumber);
        res.json(streamInfo);
    } catch (error) {
        next(error);
    }
});

// --- Streaming Endpoints ---

// Search anime for streaming sources
app.get(`${API_BASE_PATH}/stream/search`, async (req, res, next) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required for streaming search.' });
    }

    try {
        const results = await streamingService.searchAnimeForStreaming(query);
        res.json(results);
    } catch (error) {
        next(error);
    }
});

// Get streaming URL for episode
app.get(`${API_BASE_PATH}/stream/:animeId/:episodeNumber`, async (req, res, next) => {
    const { animeId, episodeNumber } = req.params;
    const { quality = '720p' } = req.query;

    try {
        const streamInfo = await streamingService.getEpisodeStream(animeId, episodeNumber);
        
        if (!streamInfo.available) {
            return res.status(404).json({ 
                message: 'Stream not available for this episode',
                info: streamInfo.message 
            });
        }

        // Return streaming info with requested quality
        const responseData = {
            ...streamInfo,
            requestedQuality: quality,
            streamUrl: streamInfo.streamUrls[quality] || streamInfo.streamUrls['720p'] || null
        };

        res.json(responseData);
    } catch (error) {
        next(error);
    }
});

// Get available streaming qualities
app.get(`${API_BASE_PATH}/stream/:animeId/:episodeNumber/qualities`, async (req, res, next) => {
    const { animeId, episodeNumber } = req.params;

    try {
        const qualities = await streamingService.getAvailableQualities(animeId, episodeNumber);
        res.json({ qualities });
    } catch (error) {
        next(error);
    }
});

// Get streaming sources status
app.get(`${API_BASE_PATH}/stream/sources`, async (req, res, next) => {
    try {
        const sources = streamingService.getSources();
        res.json({ sources });
    } catch (error) {
        next(error);
    }
});

// --- Serve React Frontend ---

// Check if build directory exists
const buildPath = path.join(__dirname, '../client/build');

if (NODE_ENV === 'production' || fs.existsSync(buildPath)) {
    // Serve static files from React build
    app.use(express.static(buildPath));

    // Handle React Router - serve index.html for non-API routes  
    app.get('/', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
    
    // Handle React Router routes (but not API routes)
    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
    });
} else {
    // Development mode without build - provide a simple response
    app.get('/', (req, res) => {
        res.json({
            message: 'AniStream API Server',
            status: 'Running in development mode',
            endpoints: {
                search: '/api/search?query=<anime_name>',  
                trending: '/api/trending',
                recent: '/api/recent',
                animeDetails: '/api/anime/:id',
                episodes: '/api/anime/:id/episodes'
            },
            note: 'Start the React dev server on port 3000 for the frontend'
        });
    });
}

// --- Error Handling Middleware ---

// Catch 404 and forward to error handler
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    error.status = 404;
    next(error);
});

// General error handler
app.use((error, req, res, next) => {
    console.error(error);

    const statusCode = error.status || 500;
    res.status(statusCode);

    res.json({
        message: error.message,
        stack: NODE_ENV === 'development' ? error.stack : undefined,
        code: error.code || 'SERVER_ERROR'
    });
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    console.log(`Server URL: http://localhost:${PORT}`);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

module.exports = app;