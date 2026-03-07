const express = require('express');
const router = express.Router();
const animeService = require('../utils/animeService');

/**
 * @route GET /api/anime/search
 * @description Searches for anime using the Jikan API.
 * @param {string} query - The anime title to search for.
 * @returns {Array<object>} - A list of anime search results.
 */
router.get('/api/anime/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required for search.' });
    }

    try {
        const results = await animeService.searchAnime(query);

        if (results.length === 0) {
            return res.status(404).json({ message: 'No anime found for the given query.' });
        }

        res.json(results);
    } catch (error) {
        console.error('Error in /api/anime/search:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/anime/details
 * @description Gets details for a specific anime by its MAL ID.
 * @param {number} animeId - The MAL anime ID.
 * @returns {object} - Anime details including title, description, episodes, status.
 */
router.get('/api/anime/details', async (req, res) => {
    const { animeId } = req.query;

    if (!animeId) {
        return res.status(400).json({ error: 'animeId parameter is required for details.' });
    }

    try {
        const details = await animeService.fetchAnimeDetails(animeId);
        res.json(details);
    } catch (error) {
        console.error('Error in /api/anime/details:', error);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: `No anime found for ID ${animeId}.` });
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/anime/stream
 * @description Gets streaming/video information for a specific anime episode.
 * Returns trailer URL and links to external streaming services.
 * @param {number} animeId - The MAL anime ID.
 * @param {number} episode - The episode number.
 * @returns {object} - Stream information including trailer URL and service links.
 */
router.get('/api/anime/stream', async (req, res) => {
    const { animeId, episode } = req.query;

    if (!animeId || !episode) {
        return res.status(400).json({ error: 'animeId and episode parameters are required for stream info.' });
    }

    const episodeNum = parseInt(episode, 10);
    if (isNaN(episodeNum) || episodeNum < 1) {
        return res.status(400).json({ error: 'episode must be a positive integer.' });
    }

    try {
        const streamInfo = await animeService.fetchStreamInfo(animeId, episodeNum);
        res.json(streamInfo);
    } catch (error) {
        console.error('Error in /api/anime/stream:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;