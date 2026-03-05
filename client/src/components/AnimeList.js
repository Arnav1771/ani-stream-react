import React from 'react';
import PropTypes from 'prop-types';
import './AnimeList.css';

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
            key={anime.animeId} 
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
              <img
                src={anime.posterUrl || 'https://via.placeholder.com/150x225?text=No+Image'}
                alt={anime.title}
                className="anime-card-image"
                onError={(e) => {
                  e.target.onerror = null; 
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
  title: PropTypes.string.isRequired,
  animeItems: PropTypes.arrayOf(
    PropTypes.shape({
      animeId: PropTypes.string.isRequired, 
      title: PropTypes.string.isRequired,
      posterUrl: PropTypes.string, 
      releaseDate: PropTypes.string, 
      status: PropTypes.string, 
    })
  ),
  onAnimeSelect: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
};

AnimeList.defaultProps = {
  animeItems: [],
  isLoading: false,
  error: null,
};

export default AnimeList;