const axios = require('axios');

const JIKAN_BASE_URL = 'https://api.jikan.moe/v4';

// Jikan API has a rate limit of ~3 requests/second.
// Simple delay helper for rate limiting.
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Makes a GET request to the Jikan API with basic retry logic.
 * @param {string} endpoint - The Jikan API endpoint path (e.g., '/anime?q=naruto').
 * @returns {Promise<object>} The response data from the Jikan API.
 */
async function jikanRequest(endpoint) {
  const url = `${JIKAN_BASE_URL}${endpoint}`;
  let lastError;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await axios.get(url, { timeout: 15000 });
      return response.data;
    } catch (error) {
      lastError = error;
      if (error.response && error.response.status === 429) {
        // Rate limited - wait and retry
        const retryAfter = (attempt + 1) * 1000;
        console.warn(`Jikan API rate limited. Retrying in ${retryAfter}ms...`);
        await delay(retryAfter);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

/**
 * Transforms a Jikan anime object into our API response format.
 */
function transformAnime(anime) {
  return {
    id: anime.mal_id,
    title: anime.title || anime.title_english || 'Unknown',
    title_english: anime.title_english || anime.title || '',
    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
    synopsis: anime.synopsis || '',
    description: anime.synopsis || '',
    score: anime.score || 0,
    episodes: anime.episodes || 0,
    status: anime.status || 'Unknown',
    type: anime.type || 'Unknown',
    genres: (anime.genres || []).map((g) => g.name),
    trailerUrl: anime.trailer?.url || '',
    trailerEmbed: anime.trailer?.embed_url || '',
    year: anime.year || null,
    season: anime.season || null,
    aired: anime.aired?.string || '',
  };
}

/**
 * Search for anime by query string.
 * @param {string} query - The search query.
 * @returns {Promise<Array>} Array of anime results.
 */
async function searchAnime(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Search query must be a non-empty string.');
  }
  const data = await jikanRequest(`/anime?q=${encodeURIComponent(query)}&limit=20`);
  return (data.data || []).map(transformAnime);
}

/**
 * Fetch detailed information about a specific anime.
 * @param {number|string} animeId - The MAL anime ID.
 * @returns {Promise<object>} The anime details.
 */
async function fetchAnimeDetails(animeId) {
  if (!animeId) {
    throw new Error('Anime ID is required.');
  }
  const data = await jikanRequest(`/anime/${animeId}/full`);
  return transformAnime(data.data);
}

/**
 * Fetch episodes for a specific anime.
 * @param {number|string} animeId - The MAL anime ID.
 * @param {number} [page=1] - Page number for pagination.
 * @returns {Promise<Array>} Array of episode objects.
 */
async function fetchAnimeEpisodes(animeId, page = 1) {
  if (!animeId) {
    throw new Error('Anime ID is required.');
  }
  const data = await jikanRequest(`/anime/${animeId}/episodes?page=${page}`);
  return (data.data || []).map((ep) => ({
    episodeNumber: ep.mal_id,
    title: ep.title || `Episode ${ep.mal_id}`,
    titleJapanese: ep.title_japanese || '',
    aired: ep.aired || '',
    filler: ep.filler || false,
    recap: ep.recap || false,
  }));
}

/**
 * Fetch trending (top) anime.
 * @param {number} [limit=20] - Number of results.
 * @returns {Promise<Array>} Array of anime results.
 */
async function fetchTrendingAnime(limit = 20) {
  const data = await jikanRequest(`/top/anime?limit=${limit}&filter=airing`);
  return (data.data || []).map(transformAnime);
}

/**
 * Fetch recently added (current season) anime.
 * @param {number} [limit=20] - Number of results.
 * @returns {Promise<Array>} Array of anime results.
 */
async function fetchRecentAnime(limit = 20) {
  const data = await jikanRequest(`/seasons/now?limit=${limit}`);
  return (data.data || []).map(transformAnime);
}

/**
 * Get streaming/video information for an anime episode.
 * Jikan API provides trailer URLs from YouTube. For actual episode streaming,
 * a dedicated streaming service would be needed.
 * @param {number|string} animeId - The MAL anime ID.
 * @param {number|string} episodeNumber - The episode number.
 * @returns {Promise<object>} Object with available video URLs.
 */
async function fetchStreamInfo(animeId, episodeNumber) {
  if (!animeId) {
    throw new Error('Anime ID is required.');
  }
  // Fetch anime details to get trailer URL as fallback
  const data = await jikanRequest(`/anime/${animeId}`);
  const anime = data.data;

  // Jikan provides streaming service links and trailer info
  const streamingLinks = await jikanRequest(`/anime/${animeId}/streaming`);

  return {
    episodeNumber: parseInt(episodeNumber, 10),
    // Trailer embed URL from YouTube (works in iframe/video player)
    streamUrl: anime.trailer?.embed_url || anime.trailer?.url || '',
    trailerUrl: anime.trailer?.url || '',
    // External streaming service links (Crunchyroll, Funimation, etc.)
    streamingServices: (streamingLinks.data || []).map((s) => ({
      name: s.name,
      url: s.url,
    })),
  };
}

module.exports = {
  searchAnime,
  fetchAnimeDetails,
  fetchAnimeEpisodes,
  fetchTrendingAnime,
  fetchRecentAnime,
  fetchStreamInfo,
};
