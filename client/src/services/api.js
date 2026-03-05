import axios from 'axios';

// Determine the API base URL based on the environment
// In a production environment, the React app might be served from the same domain as the API,
// or the API URL might be explicitly set via an environment variable.
// For development, we assume the API runs on localhost:5000.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

/**
 * Fetches a list of available anime.
 * @param {string} [query=''] - Optional search query to filter anime.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of anime objects.
 */
export const fetchAnimeList = async (query = '') => {
  try {
    const response = await api.get('/anime', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime list:', error);
    // Re-throw to allow components to handle the error
    throw error;
  }
};

/**
 * Fetches details for a specific anime by its ID.
 * @param {string} animeId - The unique identifier of the anime.
 * @returns {Promise<Object>} A promise that resolves to an anime detail object.
 */
export const fetchAnimeDetails = async (animeId) => {
  try {
    const response = await api.get(`/anime/${animeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for anime ID ${animeId}:`, error);
    throw error;
  }
};

/**
 * Fetches a list of episodes for a specific anime.
 * @param {string} animeId - The unique identifier of the anime.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of episode objects.
 */
export const fetchAnimeEpisodes = async (animeId) => {
  try {
    const response = await api.get(`/anime/${animeId}/episodes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching episodes for anime ID ${animeId}:`, error);
    throw error;
  }
};

/**
 * Fetches the streaming URL for a specific episode of an anime.
 * @param {string} animeId - The unique identifier of the anime.
 * @param {string} episodeId - The unique identifier of the episode.
 * @returns {Promise<string>} A promise that resolves to the streaming URL.
 */
export const fetchEpisodeStreamUrl = async (animeId, episodeId) => {
  try {
    const response = await api.get(`/anime/${animeId}/episodes/${episodeId}/stream`);
    // Assuming the backend returns an object like { streamUrl: "..." }
    return response.data.streamUrl;
  } catch (error) {
    console.error(`Error fetching stream URL for anime ID ${animeId}, episode ID ${episodeId}:`, error);
    throw error;
  }
};

// You can add more API functions here as needed, e.g., for user authentication, watch history, etc.

export default api;