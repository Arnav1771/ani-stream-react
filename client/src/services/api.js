import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

const retryDelay = (retryInfo) => {
  const retryDelaySeconds = retryInfo.retryDelay.match(/\d+/g);
  if (retryDelaySeconds) {
    return parseInt(retryDelaySeconds[0]);
  }
  return 0;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const handleQuotaExceeded = async (error, retryCount = 0) => {
  if (error.response.status === 429 && error.response.data.error.code === 429) {
    const retryInfo = error.response.data.error.details.find((detail) => detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
    if (retryInfo) {
      const delay = retryDelay(retryInfo);
      await sleep(delay * 1000);
      if (retryCount < 3) {
        throw error;
      }
    }
  }
  throw error;
};

export const fetchAnimeList = async (query = '') => {
  try {
    const response = await api.get('/anime', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    await handleQuotaExceeded(error);
    console.error('Error fetching anime list:', error);
    throw error;
  }
};

export const fetchAnimeDetails = async (animeId) => {
  try {
    const response = await api.get(`/anime/${animeId}`);
    return response.data;
  } catch (error) {
    await handleQuotaExceeded(error);
    console.error(`Error fetching details for anime ID ${animeId}:`, error);
    throw error;
  }
};

export const fetchAnimeEpisodes = async (animeId) => {
  try {
    const response = await api.get(`/anime/${animeId}/episodes`);
    return response.data;
  } catch (error) {
    await handleQuotaExceeded(error);
    console.error(`Error fetching episodes for anime ID ${animeId}:`, error);
    throw error;
  }
};

export const fetchEpisodeStreamUrl = async (animeId, episodeId) => {
  try {
    const response = await api.get(`/anime/${animeId}/episodes/${episodeId}/stream`);
    return response.data.streamUrl;
  } catch (error) {
    await handleQuotaExceeded(error);
    console.error(`Error fetching stream URL for anime ID ${animeId}, episode ID ${episodeId}:`, error);
    throw error;
  }
};

export default api;