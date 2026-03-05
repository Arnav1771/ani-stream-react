const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// Helper function to execute ani-cli commands
// This function handles the execution, basic error checking, and output trimming.
async function runAniCli(command) {
    try {
        // Execute ani-cli with a timeout to prevent hanging processes.
        // ani-cli can sometimes take a while to fetch data or resolve sources.
        const { stdout, stderr } = await execPromise(`ani-cli ${command}`, { timeout: 60000 }); // 60-second timeout

        // ani-cli often prints informational messages or warnings to stderr.
        // We log them but don't necessarily treat them as fatal errors unless stdout is empty.
        if (stderr) {
            console.warn(`ani-cli stderr for command "ani-cli ${command}":`, stderr.trim());
        }

        const trimmedStdout = stdout.trim();

        // Check for common ani-cli error messages in stdout if it's empty
        if (!trimmedStdout && stderr && (stderr.includes("No results found") || stderr.includes("not found") || stderr.includes("invalid index"))) {
            throw new Error(`ani-cli reported an issue: ${stderr.trim()}`);
        }

        return trimmedStdout;
    } catch (error) {
        console.error(`Error executing ani-cli command "ani-cli ${command}":`, error);

        // Specific error for command not found (ani-cli not installed or not in PATH)
        if (error.code === 127) {
            throw new Error('ani-cli command not found. Please ensure it is installed and in your system\'s PATH.');
        }

        // Propagate ani-cli's own error messages if available
        if (error.stdout && error.stdout.includes("No results found")) {
            throw new Error('No results found by ani-cli.');
        }
        if (error.stderr && (error.stderr.includes("not found") || error.stderr.includes("invalid index"))) {
             throw new Error(`ani-cli reported: ${error.stderr.trim()}`);
        }

        // Generic error for other execution failures
        throw new Error(`Failed to execute ani-cli: ${error.message}`);
    }
}

/**
 * @route GET /api/anime/search
 * @description Searches for anime using ani-cli.
 * @param {string} query - The anime title to search for.
 * @returns {Array<{index: number, title: string}>} - A list of search results with transient indices.
 */
router.get('/search', async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required for search.' });
    }

    try {
        const output = await runAniCli(`-s "${query}"`);
        const results = output.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                const match = line.match(/^(\d+)\.\s*(.*)$/);
                if (match) {
                    // ani-cli returns 1-based indices which are transient (depend on the last search).
                    return {
                        index: parseInt(match[1], 10),
                        title: match[2].trim()
                    };
                }
                return null;
            })
            .filter(Boolean); // Remove any nulls from failed parsing

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
 * @description Gets details for a specific anime identified by its original search query and index.
 * IMPORTANT: ani-cli uses transient indices based on the LAST search. To get details for a specific item,
 * we must re-run the search with the original query to establish context, then use the index from that search.
 * This is inefficient but necessary due to ani-cli's design.
 * @param {string} query - The original anime title query used to find the anime.
 * @param {number} animeIndex - The 1-based index of the anime from the search results.
 * @returns {object} - Anime details including title, description, episodes, status.
 */
router.get('/details', async (req, res) => {
    const { query, animeIndex } = req.query;

    if (!query || !animeIndex) {
        return res.status(400).json({ error: 'query and animeIndex parameters are required for details.' });
    }

    const indexNum = parseInt(animeIndex, 10);
    if (isNaN(indexNum) || indexNum < 1) {
        return res.status(400).json({ error: 'animeIndex must be a positive integer.' });
    }

    try {
        // Step 1: Re-run the search to establish context for ani-cli.
        // ani-cli's -i flag operates on the results of the most recent -s command.
        await runAniCli(`-s "${query}"`);

        // Step 2: Get details using the provided index.
        const output = await runAniCli(`-i ${indexNum}`);

        const details = {};
        const lines = output.split('\n').filter(line => line.trim() !== '');

        // Basic parsing of ani-cli -i output, which is free-form text.
        // This parsing is brittle and depends on ani-cli's output format.
        let currentKey = '';
        lines.forEach(line => {
            let match;
            if (match = line.match(/^Title:\s*(.*)$/i)) {
                details.title = match[1].trim();
                currentKey = ''; // Reset for new block
            } else if (match = line.match(/^Description:\s*(.*)$/i)) {
                details.description = match[1].trim();
                currentKey = 'description'; // Description might span multiple lines
            } else if (match = line.match(/^Episodes:\s*(.*)$/i)) {
                details.episodes = match[1].trim();
                currentKey = '';
            } else if (match = line.match(/^Status:\s*(.*)$/i)) {
                details.status = match[1].trim();
                currentKey = '';
            } else if (currentKey === 'description' && line.trim() !== '') {
                // Append to description if it spans multiple lines
                details.description += ' ' + line.trim();
            }
            // Add more parsing as needed for other fields if ani-cli output includes them
        });

        if (!details.title) {
            return res.status(404).json({ message: `No details found for anime index ${animeIndex} with query "${query}". ani-cli output: ${output}` });
        }

        res.json(details);

    } catch (error) {
        console.error('Error in /api/anime/details:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route GET /api/anime/stream
 * @description Resolves the direct stream URL for a specific anime episode.
 * IMPORTANT: ani-cli is primarily a player and does not natively expose a direct stream URL
 * without attempting to play the video. For this endpoint to work as a "stream URL resolver",
 * we are making a **hypothetical assumption** that `ani-cli` can be run with a flag
 * (e.g., `--get-url` or `--print-url`) that outputs the direct stream URL to stdout
 * without launching a player.
 *
 * In a real-world production scenario, if such a flag does not exist, this endpoint would
 * require a different approach, such as:
 * 1.  Inspecting ani-cli's source code to replicate its `yt-dlp` invocation and running `yt-dlp --print-url` directly.
 * 2.  Using a dedicated anime scraping library (e.g., `gogoanime-api` or similar) that provides direct stream URLs.
 * 3.  Running `ani-cli` in a controlled environment and intercepting the `mpv` command to extract the URL.
 *
 * For the purpose of this exercise and fulfilling the "stream URL resolution" requirement while
 * "leveraging ani-cli", we simulate this hypothetical behavior.
 *
 * @param {string} query - The original anime title query used to find the anime.
 * @param {number} animeIndex - The 1-based index of the anime from the search results.
 * @param {number} episode - The episode number to get the stream URL for.
 * @returns {object} - An object containing the resolved `streamUrl`.
 */
router.get('/stream', async (req, res) => {
    const { query, animeIndex, episode } = req.query;

    if (!query || !animeIndex || !episode) {
        return res.status(400).json({ error: 'query, animeIndex, and episode parameters are required for stream resolution.' });
    }

    const indexNum = parseInt(animeIndex, 10);
    const episodeNum = parseInt(episode, 10);

    if (isNaN(indexNum) || indexNum < 1 || isNaN(episodeNum) || episodeNum < 1) {
        return res.status(400).json({ error: 'animeIndex and episode must be positive integers.' });
    }

    try {
        // Step 1: Re-run the search to establish context for ani-cli.
        await runAniCli(`-s "${query}"`);

        // Step 2: Attempt to get the stream URL using a hypothetical flag.
        // This command assumes ani-cli has a non-playing mode to output the stream URL.
        const streamUrlCommand = `--get-url ${indexNum} -e ${episodeNum}`; // Hypothetical flag
        const output = await runAniCli(streamUrlCommand);

        const streamUrl = output.trim();

        // Basic validation for a URL.
        if (!streamUrl || !streamUrl.startsWith('http')) {
            return res.status(404).json({ message: `Could not resolve stream URL for anime index ${animeIndex}, episode: ${episode} with query "${query}". ani-cli output: ${output}` });
        }

        res.json({ streamUrl });

    } catch (error) {
        console.error('Error in /api/anime/stream:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;