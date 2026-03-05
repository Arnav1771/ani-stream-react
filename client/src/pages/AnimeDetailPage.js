import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaPlayCircle, FaSpinner, FaArrowLeft, FaDownload, FaExpand, FaCompress } from 'react-icons/fa';
import { MdOutlineErrorOutline } from 'react-icons/md';
import { useMediaQuery } from 'react-responsive';
import './AnimeDetailPage.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';

const AnimeDetailPage = () => {
  const { animeId } = useParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

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
    const fetchAnimeDetails = async () => {
      setLoadingDetails(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/anime/${animeId}`);
        setAnimeDetails(response.data);
      } catch (err) {
        console.error('Error fetching anime details:', err);
        setError('Failed to load anime details. Please try again.');
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchAnimeDetails();
  }, [animeId]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      setLoadingEpisodes(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/anime/${animeId}/episodes`);
        setEpisodes(response.data);
        if (response.data.length > 0) {
          setSelectedEpisode(response.data[0]);
        }
      } catch (err) {
        console.error('Error fetching episodes:', err);
        setError('Failed to load episodes. Please try again.');
      } finally {
        setLoadingEpisodes(false);
      }
    };

    fetchEpisodes();
  }, [animeId]);

  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (!selectedEpisode) {
        setVideoUrl('');
        return;
      }

      setLoadingVideo(true);
      setVideoError(null);
      setVideoUrl(''); 
      try {
        const response = await axios.get(`${API_BASE_URL}/anime/${animeId}/episode/${selectedEpisode.episodeNumber}/stream`);
        setVideoUrl(response.data.streamUrl);
      } catch (err) {
        console.error('Error fetching video URL:', err);
        setVideoError('Failed to load video. Please try again or try a different episode.');
      } finally {
        setLoadingVideo(false);
      }
    };

    fetchVideoUrl();
  }, [animeId, selectedEpisode]);

  const handleEpisodeSelect = (episode) => {
    setSelectedEpisode(episode);
  };

  const handleGoBack = () => {
    navigate(-1); 
  };

  const handleDownload = () => {
    if (selectedEpisode) {
      const downloadUrl = `${API_BASE_URL}/anime/${animeId}/episode/${selectedEpisode.episodeNumber}/download`;
      window.open(downloadUrl, '_blank');
    }
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
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('MSFullscreenChange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullScreenChange);
    };
  }, []);

  if (loadingDetails && loadingEpisodes) {
    return (
      <div className="loading-container">
        <FaSpinner className="spinner" />
        <p>Loading anime details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <MdOutlineErrorOutline className="error-icon" />
        <p>{error}</p>
        <button onClick={handleGoBack} className="back-button">
          <FaArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={`anime-detail-page ${isFullScreen ? 'fullscreen-active' : ''}`}>
      <div className="detail-header">
        <button onClick={handleGoBack} className="back-button">
          <FaArrowLeft /> Back to Search
        </button>
        {animeDetails && (
          <h1 className="anime-title">{animeDetails.title}</h1>
        )}
      </div>

      <div className="detail-content">
        <div className={`video-player-section ${isFullScreen ? 'fullscreen' : ''}`} ref={playerContainerRef}>
          {loadingVideo && (
            <div className="video-overlay loading-overlay">
              <FaSpinner className="spinner" />
              <p>Loading video...</p>
            </div>
          )}
          {videoError && !loadingVideo && (
            <div className="video-overlay error-overlay">
              <MdOutlineErrorOutline className="error-icon" />
              <p>{videoError}</p>
            </div>
          )}
          {videoUrl && !loadingVideo && !videoError ? (
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
          ) : (
            !loadingVideo && !videoError && (
              <div className="video-placeholder">
                <FaPlayCircle className="play-icon" />
                <p>Select an episode to start watching</p>
              </div>
            )
          )}
          <div className="player-controls-overlay">
            <button onClick={handleFullScreenToggle} className="fullscreen-toggle-button">
              {isFullScreen ? <FaCompress /> : <FaExpand />}
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
                  <div className="episode-list">
                    {episodes.map((episode) => (
                      <button
                        key={episode.episodeNumber}
                        className={`episode-button ${selectedEpisode?.episodeNumber === episode.episodeNumber ? 'selected' : ''}`}
                        onClick={() => handleEpisodeSelect(episode)}
                      >
                        Episode {episode.episodeNumber}
                      </button>
                    ))}
                  </div>
                  <button onClick={handleDownload} className="download-button">
                    <FaDownload /> Download
                  </button>
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