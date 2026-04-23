import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Search for anime by title.
 * Server: GET /api/search?query=xxx
 * Returns: [{ id, title }]
 */
export const searchAnime = async (query) => {
  const response = await api.get('/search', { params: { query } });
  return response.data;
};

/**
 * Get episode list for a given anime title.
 * Server: GET /api/episodes?animeTitle=xxx
 * Returns: [{ id, title }]
 */
export const getEpisodes = async (animeTitle) => {
  const response = await api.get('/episodes', { params: { animeTitle } });
  return response.data;
};

/**
 * Get the direct stream URL for a specific episode.
 * Server: GET /api/stream?animeTitle=xxx&episodeNumber=N
 * Returns: { streamUrl }
 */
export const getStreamUrl = async (animeTitle, episodeNumber) => {
  const response = await api.get('/stream', { params: { animeTitle, episodeNumber } });
  return response.data;
};

export default api;