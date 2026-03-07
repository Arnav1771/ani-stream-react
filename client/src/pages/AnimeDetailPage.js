import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAnimeDetails, fetchAnimeEpisodes } from '../services/api';
import StreamingVideoPlayer from '../components/StreamingVideoPlayer';
import './AnimeDetailPage.css';

const AnimeDetailPage = () => {
  const { animeId } = useParams();
  const navigate = useNavigate();

  const [animeDetails, setAnimeDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [videoError, setVideoError] = useState(null);

  useEffect(() => {
    const loadDetails = async () => {
      setLoadingDetails(true);
      setError(null);
      try {
        const data = await fetchAnimeDetails(animeId);
        setAnimeDetails(data);
      } catch (err) {
        console.error('Error fetching anime details:', err);
        setError('Failed to load anime details. Please try again.');
      } finally {
        setLoadingDetails(false);
      }
    };

    loadDetails();
  }, [animeId]);

  useEffect(() => {
    const loadEpisodes = async () => {
      setLoadingEpisodes(true);
      try {
        const data = await fetchAnimeEpisodes(animeId);
        setEpisodes(data);
        if (data.length > 0) {
          setSelectedEpisode(data[0]);
        }
      } catch (err) {
        console.error('Error fetching episodes:', err);
        setError('Failed to load episodes. Please try again.');
      } finally {
        setLoadingEpisodes(false);
      }
    };

    loadEpisodes();
  }, [animeId]);

  const handleEpisodeSelect = (episode) => {
    setSelectedEpisode(episode);
    setVideoError(null); // Clear any previous errors
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loadingDetails && loadingEpisodes) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading anime details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-icon">⚠️</p>
        <p>{error}</p>
        <button onClick={handleGoBack} className="back-button">
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="anime-detail-page">
      <div className="detail-header">
        <button onClick={handleGoBack} className="back-button">
          ← Back
        </button>
        {animeDetails && (
          <h1 className="anime-title">{animeDetails.title}</h1>
        )}
      </div>

      <div className="detail-content">
        <div className="video-player-section">
          {selectedEpisode ? (
            <StreamingVideoPlayer
              animeId={animeId}
              episodeNumber={selectedEpisode.episodeNumber}
              animeTitle={animeDetails?.title}
              onError={(error) => {
                console.error('Streaming error:', error);
                setVideoError(`Streaming error: ${error.message}`);
              }}
              onQualityChange={(quality) => {
                console.log(`Quality changed to: ${quality}`);
              }}
            />
          ) : (
            <div className="video-placeholder">
              <p style={{ fontSize: '3rem' }}>▶</p>
              <p>Select an episode to start watching</p>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>
                Episodes will stream using available sources
              </p>
            </div>
          )}
        </div>

        <div className="anime-info-and-episodes">
          <div className="anime-details-card">
            {animeDetails && (
              <>
                <img src={animeDetails.image} alt={animeDetails.title} className="anime-poster" />
                <div className="details-text">
                  <h2>{animeDetails.title}</h2>
                  <p className="anime-description">{animeDetails.description}</p>
                  {animeDetails.status && <p><strong>Status:</strong> {animeDetails.status}</p>}
                  {animeDetails.episodes > 0 && <p><strong>Episodes:</strong> {animeDetails.episodes}</p>}
                  {animeDetails.score > 0 && <p><strong>Score:</strong> ★ {animeDetails.score}</p>}
                  {animeDetails.genres && animeDetails.genres.length > 0 && (
                    <p><strong>Genres:</strong> {animeDetails.genres.join(', ')}</p>
                  )}
                  <div className="episode-list">
                    {episodes.map((episode) => (
                      <button
                        key={episode.episodeNumber}
                        className={`episode-button ${selectedEpisode?.episodeNumber === episode.episodeNumber ? 'selected' : ''}`}
                        onClick={() => handleEpisodeSelect(episode)}
                      >
                        Ep {episode.episodeNumber}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetailPage;