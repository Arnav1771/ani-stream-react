/**
 * @deprecated Use animeService.js instead. This module previously wrapped ani-cli
 * subprocess calls which required a Linux desktop environment. It has been replaced
 * with direct API calls to the Jikan API (MyAnimeList).
 */
const animeService = require('./animeService');

module.exports = {
  searchAnime: animeService.searchAnime,
  fetchAnimeDetails: animeService.fetchAnimeDetails,
  fetchStreamLink: async (animeId, episodeNumber) => {
    const info = await animeService.fetchStreamInfo(animeId, episodeNumber);
    return info.streamUrl || '';
  },
};