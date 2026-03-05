import React from 'react';
import PropTypes from 'prop-types';
import './AnimeList.css'; // Assuming a CSS file for styling

/**
 * AnimeList Component
 * Displays a list of anime titles, typically from search results or trending lists.
 * Each anime item is clickable and could trigger a detail view or playback.
 */
const AnimeList = ({ title, animeItems, onAnimeSelect, isLoading, error }) => {
  // Render loading state
  if (isLoading) {
    return (
      <section className="anime-list-section loading-state">
        <h2 className="anime-list-title">{title}</h2>
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading anime...</p>
      </section>
    );
  }

  // Render error state
  if (error) {
    return (
      <section className="anime-list-section error-state">
        <h2 className="anime-list-title">{title}</h2>
        <div className="error-message">
          <p>Oops! Something went wrong.</p>
          <p>{error}</p>
          <p>Please try again later.</p>
        </div>
      </section>
    );
  }

  // Render empty state
  if (!animeItems || animeItems.length === 0) {
    return (
      <section className="anime-list-section empty-state">
        <h2 className="anime-list-title">{title}</h2>
        <p className="empty-message">No anime found. Try a different search or check back later!</p>
      </section>
    );
  }

  return (
    <section className="anime-list-section">
      <h2 className="anime-list-title">{title}</h2>
      <div className="anime-grid">
        {animeItems.map((anime) => (
          <div
            key={anime.animeId} // Use a unique ID for the key
            className="anime-card"
            onClick={() => onAnimeSelect(anime)}
            role="button"
            tabIndex="0"
            aria-label={`Select anime: ${anime.title}`}
            onKeyPress={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                onAnimeSelect(anime);
              }
            }}
          >
            <div className="anime-card-image-container">
              {/* Fallback image if posterUrl is not available or fails to load */}
              <img
                src={anime.posterUrl || 'https://via.placeholder.com/150x225?text=No+Image'}
                alt={anime.title}
                className="anime-card-image"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = 'https://via.placeholder.com/150x225?text=No+Image';
                }}
              />
            </div>
            <div className="anime-card-info">
              <h3 className="anime-card-title">{anime.title}</h3>
              {anime.releaseDate && <p className="anime-card-meta">{anime.releaseDate}</p>}
              {anime.status && <p className="anime-card-meta">{anime.status}</p>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

AnimeList.propTypes = {
  /** The title for the list section (e.g., "Trending Anime", "Search Results") */
  title: PropTypes.string.isRequired,
  /** An array of anime objects to display */
  animeItems: PropTypes.arrayOf(
    PropTypes.shape({
      animeId: PropTypes.string.isRequired, // Unique ID for the anime
      title: PropTypes.string.isRequired,
      posterUrl: PropTypes.string, // URL to the anime's poster image
      releaseDate: PropTypes.string, // Optional release date
      status: PropTypes.string, // Optional status (e.g., "Ongoing", "Completed")
      // Add other relevant anime properties as needed
    })
  ),
  /** Callback function when an anime item is selected */
  onAnimeSelect: PropTypes.func.isRequired,
  /** Boolean to indicate if the data is currently loading */
  isLoading: PropTypes.bool,
  /** Error message string if an error occurred during data fetching */
  error: PropTypes.string,
};

AnimeList.defaultProps = {
  animeItems: [],
  isLoading: false,
  error: null,
};

export default AnimeList;