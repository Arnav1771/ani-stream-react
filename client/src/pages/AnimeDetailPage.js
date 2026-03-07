import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAnimeDetails, fetchAnimeEpisodes, fetchEpisodeStreamUrl } from '../services/api';
import './AnimeDetailPage.css';

/**
 * Checks if a URL is a YouTube URL (regular or embed).
 */
function isYouTubeUrl(url) {
  return url.includes('youtube') || url.includes('youtu.be');
}

const AnimeDetailPage = () => {
  const { animeId } = useParams();
  const navigate = useNavigate();

  const [animeDetails, setAnimeDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [error, setError] = useState(null);

  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [videoError, setVideoError] = useState(null);

  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  useEffect(() => {
    const loadVideoUrl = async () => {
      if (!selectedEpisode) {
        setVideoUrl('');
        return;
      }

      setLoadingVideo(true);
      setVideoError(null);
      setVideoUrl('');
      try {
        const streamUrl = await fetchEpisodeStreamUrl(animeId, selectedEpisode.episodeNumber);
        setVideoUrl(streamUrl || '');
      } catch (err) {
        console.error('Error fetching video URL:', err);
        setVideoError('Failed to load video. Please try again or try a different episode.');
      } finally {
        setLoadingVideo(false);
      }
    };

    loadVideoUrl();
  }, [animeId, selectedEpisode]);

  const handleEpisodeSelect = (episode) => {
    setSelectedEpisode(episode);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleFullScreenToggle = useCallback(() => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

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
    <div className={`anime-detail-page ${isFullScreen ? 'fullscreen-active' : ''}`}>
      <div className="detail-header">
        <button onClick={handleGoBack} className="back-button">
          ← Back
        </button>
        {animeDetails && (
          <h1 className="anime-title">{animeDetails.title}</h1>
        )}
      </div>

      <div className="detail-content">
        <div className={`video-player-section ${isFullScreen ? 'fullscreen' : ''}`} ref={playerContainerRef}>
          {loadingVideo && (
            <div className="video-overlay loading-overlay">
              <div className="spinner"></div>
              <p>Loading video...</p>
            </div>
          )}
          {videoError && !loadingVideo && (
            <div className="video-overlay error-overlay">
              <p>⚠️ {videoError}</p>
            </div>
          )}
          {videoUrl && !loadingVideo && !videoError ? (
            isYouTubeUrl(videoUrl) ? (
              <iframe
                src={videoUrl}
                title="Anime Trailer"
                className="anime-video-player"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                style={{ width: '100%', height: '100%', border: 'none', minHeight: '400px' }}
              ></iframe>
            ) : (
              <video
                ref={videoRef}
                key={videoUrl}
                controls
                autoPlay
                className="anime-video-player"
                poster={animeDetails?.image}
                onContextMenu={(e) => e.preventDefault()}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )
          ) : (
            !loadingVideo && !videoError && (
              <div className="video-placeholder">
                <p style={{ fontSize: '3rem' }}>▶</p>
                <p>Select an episode to start watching</p>
              </div>
            )
          )}
          <div className="player-controls-overlay">
            <button onClick={handleFullScreenToggle} className="fullscreen-toggle-button">
              {isFullScreen ? '⊘' : '⊕'}
            </button>
          </div>
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