const { spawn } = require('child_process');
const path = require('path');
const logger = require('./logger');
const config = require('../config');

/**
 * Executes an ani-cli command and returns its stdout.
 *
 * @param {string[]} args - An array of arguments to pass to ani-cli.
 * @returns {Promise<string>} A promise that resolves with the stdout of the ani-cli command.
 * @throws {Error} If the ani-cli command fails or returns an error.
 */
async function executeAniCliCommand(args) {
  return new Promise((resolve, reject) => {
    try {
      logger.info(`Executing ani-cli command with args: ${args.join(' ')}`);

      const aniCliExecutable = config.get('aniCliExecutablePath') || 'ani-cli';

      const aniCliProcess = spawn(aniCliExecutable, args, {
        env: { ...process.env, ...config.get('aniCliEnvVars') },
      });

      let stdout = '';
      let stderr = '';

      aniCliProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      aniCliProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      aniCliProcess.on('close', (code) => {
        if (code === 0) {
          logger.info(`ani-cli command successful. Output length: ${stdout.length}`);
          resolve(stdout.trim());
        } else {
          const errorMessage = `ani-cli command failed with code ${code}. Stderr: ${stderr.trim()}`;
          logger.error(errorMessage);
          reject(new Error(errorMessage));
        }
      });

      aniCliProcess.on('error', (err) => {
        const errorMessage = `Failed to start ani-cli process: ${err.message}`;
        logger.error(errorMessage, err);
        reject(new Error(errorMessage));
      });
    } catch (error) {
      logger.error('Error executing ani-cli command:', error);
      reject(error);
    }
  });
}

/**
 * Searches for anime using ani-cli.
 *
 * @param {string} query - The search query for the anime.
 * @returns {Promise<string>} A promise that resolves with the raw output from ani-cli.
 */
async function searchAnime(query) {
  if (!query || typeof query !== 'string') {
    throw new Error('Search query must be a non-empty string.');
  }
  logger.debug(`Searching for anime: "${query}"`);
  return executeAniCliCommandWithRetry(['-s', query]);
}

/**
 * Fetches details for a specific anime or episode using ani-cli.
 * This typically involves listing episodes for an anime or getting direct stream links.
 *
 * @param {string} animeId - The ID or name of the anime to fetch details for.
 * @param {string} [episodeNumber] - Optional. The specific episode number to fetch.
 * @returns {Promise<string>} A promise that resolves with the raw output from ani-cli.
 */
async function fetchAnimeDetails(animeId, episodeNumber = null) {
  if (!animeId || typeof animeId !== 'string') {
    throw new Error('Anime ID must be a non-empty string.');
  }

  const args = ['-i', animeId];
  if (episodeNumber) {
    args.push('-e', episodeNumber);
    logger.debug(`Fetching details for anime ID: "${animeId}", episode: "${episodeNumber}"`);
  } else {
    logger.debug(`Fetching details for anime ID: "${animeId}" (listing episodes)`);
  }

  return executeAniCliCommandWithRetry(args);
}

/**
 * Fetches the direct streaming URL for a specific anime episode using ani-cli.
 *
 * @param {string} animeId - The ID or name of the anime.
 * @param {string} episodeNumber - The episode number to get the stream link for.
 * @returns {Promise<string>} A promise that resolves with the raw output (usually a URL) from ani-cli.
 */
async function fetchStreamLink(animeId, episodeNumber) {
  if (!animeId || typeof animeId !== 'string') {
    throw new Error('Anime ID must be a non-empty string.');
  }
  if (!episodeNumber || typeof episodeNumber !== 'string') {
    throw new Error('Episode number must be a non-empty string.');
  }
  logger.debug(`Fetching stream link for anime ID: "${animeId}", episode: "${episodeNumber}"`);
  return executeAniCliCommandWithRetry(['-i', animeId, '-e', episodeNumber, '-o']);
}

/**
 * Executes an ani-cli command with retry mechanism for 429 RESOURCE_EXHAUSTED error.
 *
 * @param {string[]} args - An array of arguments to pass to ani-cli.
 * @param {number} [retryCount=0] - The current retry count.
 * @param {number} [retryDelay=1000] - The delay between retries in milliseconds.
 * @returns {Promise<string>} A promise that resolves with the stdout of the ani-cli command.
 */
async function executeAniCliCommandWithRetry(args, retryCount = 0, retryDelay = 1000) {
  try {
    const result = await executeAniCliCommand(args);
    return result;
  } catch (error) {
    if (error.message.includes('429 RESOURCE_EXHAUSTED')) {
      if (retryCount < 5) {
        logger.warn(`Retry ${retryCount + 1} for 429 RESOURCE_EXHAUSTED error. Delay: ${retryDelay}ms`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return executeAniCliCommandWithRetry(args, retryCount + 1, retryDelay * 2);
      } else {
        logger.error('Max retries exceeded for 429 RESOURCE_EXHAUSTED error.');
        throw error;
      }
    } else {
      throw error;
    }
  }
}

module.exports = {
  executeAniCliCommand,
  searchAnime,
  fetchAnimeDetails,
  fetchStreamLink,
};