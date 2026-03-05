require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);

const app = express();

// --- Configuration ---
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// --- Middleware ---

// CORS for development. In production, restrict to your frontend domain.
if (NODE_ENV === 'development') {
    app.use(cors());
    app.use(morgan('dev')); // Detailed logging for development
} else {
    // Basic production CORS (adjust as needed)
    app.use(cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Replace with your actual frontend URL
        methods: ['GET', 'POST'],
        credentials: true
    }));
    app.use(morgan('combined')); // Standard Apache combined log output for production
}

app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// --- Helper function for ani-cli execution ---
/**
 * Executes an ani-cli command and returns its stdout.
 * Handles common errors like command not found or non-zero exit codes.
 * @param {string} command The full ani-cli command string to execute.
 * @returns {Promise<string>} The stdout of the command.
 * @throws {Error} If the command fails or ani-cli is not found.
 */
async function executeAniCli(command) {
    try {
        // Add a timeout to prevent hanging processes
        const { stdout, stderr } = await execPromise(command, { timeout: 60000 }); // 60 seconds timeout

        if (stderr) {
            console.warn(`ani-cli stderr for command "${command}":\n${stderr}`);
            // Depending on ani-cli's behavior, stderr might not always indicate an error
            // but it's good to log it.
        }

        return stdout.trim();
    } catch (error) {
        console.error(`Error executing ani-cli command "${command}":`, error);
        if (error.code === 127) { // Command not found
            throw new Error('ani-cli not found. Please ensure it is installed and in your system\'s PATH.');
        }
        // Check for specific ani-cli error messages in stdout/stderr if possible
        if (error.stdout && error.stdout.includes('No results found')) {
            throw new Error('No results found for your query.');
        }
        if (error.stderr && error.stderr.includes('Error:')) {
            throw new Error(`ani-cli error: ${error.stderr.trim()}`);
        }
        throw new Error(`Failed to execute ani-cli command: ${error.message}`);
    }
}

/**
 * Safely escapes a string for use as a shell argument.
 * This is a basic implementation. For more robust escaping, consider a dedicated library.
 * @param {string} arg The string to escape.
 * @returns {string} The escaped string.
 */
function escapeShellArg(arg) {
    // Enclose in single quotes and escape any single quotes within
    return "'" + arg.replace(/'/g, "'\\''") + "'";
}

// --- API Routes ---
const API_BASE_PATH = '/api';

// Search for anime
app.get(`${API_BASE_PATH}/search`, async (req, res, next) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Search query is required.' });
    }

    try {
        const escapedQuery = escapeShellArg(query);
        const command = `ani-cli -s ${escapedQuery}`; // -s for search results
        const output = await executeAniCli(command);

        // Parse output: e.g., "[1] Jujutsu Kaisen (TV)"
        const results = output.split('\n')
            .filter(line => line.match(/^\[\d+\]/))
            .map(line => {
                const match = line.match(/^\[(\d+)\]\s*(.*)/);
                return match ? { id: parseInt(match[1], 10), title: match[2].trim() } : null;
            })
            .filter(Boolean); // Remove any nulls from failed parses

        if (results.length === 0 && output.includes('No results found')) {
            return res.status(404).json({ message: 'No anime found matching your query.' });
        }

        res.json(results);
    } catch (error) {
        next(error); // Pass error to the error handling middleware
    }
});

// Get episodes for a specific anime
app.get(`${API_BASE_PATH}/episodes`, async (req, res, next) => {
    const { animeTitle } = req.query;

    if (!animeTitle) {
        return res.status(400).json({ error: 'Anime title is required.' });
    }

    try {
        const escapedAnimeTitle = escapeShellArg(animeTitle);
        // ani-cli "<title>" -e lists episodes for a specific title
        const command = `ani-cli ${escapedAnimeTitle} -e`;
        const output = await executeAniCli(command);

        // Parse output: e.g., "[1] Episode 1"
        const episodes = output.split('\n')
            .filter(line => line.match(/^\[\d+\]/))
            .map(line => {
                const match = line.match(/^\[(\d+)\]\s*(.*)/);
                return match ? { id: parseInt(match[1], 10), title: match[2].trim() } : null;
            })
            .filter(Boolean);

        if (episodes.length === 0 && output.includes('No episodes found')) {
            return res.status(404).json({ message: 'No episodes found for this anime.' });
        }

        res.json(episodes);
    } catch (error) {
        next(error);
    }
});

// Get streaming URL for a specific episode
app.get(`${API_BASE_PATH}/stream`, async (req, res, next) => {
    const { animeTitle, episodeNumber } = req.query;

    if (!animeTitle || !episodeNumber) {
        return res.status(400).json({ error: 'Anime title and episode number are required.' });
    }

    // Basic validation for episodeNumber
    const epNum = parseInt(episodeNumber, 10);
    if (isNaN(epNum) || epNum <= 0) {
        return res.status(400).json({ error: 'Invalid episode number.' });
    }

    try {
        const escapedAnimeTitle = escapeShellArg(animeTitle);
        // ani-cli "<title>" -u <episode_number> gets the direct URL
        const command = `ani-cli ${escapedAnimeTitle} -u ${epNum}`;
        const output = await executeAniCli(command);

        // The output should be just the URL
        const streamUrl = output.trim();

        if (!streamUrl || !streamUrl.startsWith('http')) {
            console.error(`ani-cli returned unexpected output for stream URL: ${output}`);
            return res.status(500).json({ error: 'Could not retrieve streaming URL. ani-cli output was unexpected.' });
        }

        res.json({ streamUrl });
    } catch (error) {
        next(error);
    }
});

// --- Serve React Frontend (in production) ---
if (NODE_ENV === 'production') {
    // Serve static files from the React build directory
    app.use(express.static(path.join(__dirname, '../client/build')));

    // All other GET requests not handled by API routes should serve the React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
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
    // Log the error for debugging purposes
    console.error(error);

    // Set status code
    const statusCode = error.status || 500;
    res.status(statusCode);

    // Send error response
    res.json({
        message: error.message,
        // In development, send stack trace for debugging
        stack: NODE_ENV === 'development' ? error.stack : undefined,
        // Custom error codes for client-side handling if needed
        code: error.code || 'SERVER_ERROR'
    });
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${NODE_ENV} mode`);
    console.log('Server started successfully');
});