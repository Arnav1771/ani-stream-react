import React from 'react';
import PropTypes from 'prop-types';
import './EpisodeGrid.css';

/**
 * EpisodeGrid component displays a list of episodes as a clickable, numbered text grid.
 * It allows users to select an episode, triggering an `onEpisodeSelect` callback.
 */
function EpisodeGrid({ episodes, selectedEpisode, onEpisodeSelect, isLoading }) {
  // Handle cases where episodes might be null, undefined, or an empty array
  const hasEpisodes = episodes && episodes.length > 0;

  // Render a loading state if isLoading is true
  if (isLoading) {
    return (
      <div className="episode-grid-container loading">
        <div className="loading-spinner"></div>
        <p>Loading episodes...</p>
      </div>
    );
  }

  return (
    <div className="episode-grid-container">
      <h2 className="episode-grid-title">Episodes</h2>
      {!hasEpisodes ? (
        <p className="no-episodes-message">No episodes found for this anime.</p>
      ) : (
        <div className="episode-grid">
          {episodes.map((episodeNumber, index) => (
            <button
              key={index}
              className={`episode-grid-item ${selectedEpisode === episodeNumber ? 'selected' : ''}`}
              onClick={() => onEpisodeSelect(episodeNumber)}
              aria-label={`Episode ${episodeNumber}`}
            >
              {episodeNumber}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

EpisodeGrid.propTypes = {
  /**
   * An array of episode numbers to display in the grid.
   * Example: [1, 2, 3, ..., 12]
   */
  episodes: PropTypes.arrayOf(PropTypes.number).isRequired,
  /**
   * The currently selected episode number. Used for styling the active episode.
   */
  selectedEpisode: PropTypes.number,
  /**
   * Callback function triggered when an episode button is clicked.
   * It receives the clicked episode number as an argument.
   */
  onEpisodeSelect: PropTypes.func.isRequired,
  /**
   * Boolean indicating if the episodes are currently being loaded.
   * If true, a loading spinner and message will be displayed.
   */
  isLoading: PropTypes.bool,
};

EpisodeGrid.defaultProps = {
  selectedEpisode: null,
  isLoading: false,
};

export default EpisodeGrid;