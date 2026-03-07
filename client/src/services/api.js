import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export const fetchAnimeList = async (query = '') => {
  try {
    const response = await api.get('/anime', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching anime list:', error);
    throw error;
  }
};

export const fetchAnimeDetails = async (animeId) => {
  try {
    const response = await api.get(`/anime/${animeId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for anime ID ${animeId}:`, error);
    throw error;
  }
};

export const fetchAnimeEpisodes = async (animeId) => {
  try {
    const response = await api.get(`/anime/${animeId}/episodes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching episodes for anime ID ${animeId}:`, error);
    throw error;
  }
};

export const fetchEpisodeStreamUrl = async (animeId, episodeId) => {
  try {
    const response = await api.get(`/anime/${animeId}/episodes/${episodeId}/stream`);
    return response.data.streamUrl;
  } catch (error) {
    console.error(`Error fetching stream URL for anime ID ${animeId}, episode ID ${episodeId}:`, error);
    throw error;
  }
};

export const fetchTrendingAnime = async () => {
  try {
    const response = await api.get('/trending');
    return response.data;
  } catch (error) {
    console.error('Error fetching trending anime:', error);
    throw error;
  }
};

export const fetchRecentAnime = async () => {
  try {
    const response = await api.get('/recent');
    return response.data;
  } catch (error) {
    console.error('Error fetching recent anime:', error);
    throw error;
  }
};

export const searchAnime = async (query) => {
  try {
    const response = await api.get('/search', {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
};

export default api;