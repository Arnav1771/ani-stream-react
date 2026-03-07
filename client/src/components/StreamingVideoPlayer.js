import React, { useState, useRef, useEffect } from 'react';

const StreamingVideoPlayer = ({ 
  animeId, 
  episodeNumber, 
  animeTitle, 
  onError,
  onQualityChange 
}) => {
  const videoRef = useRef(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [qualities, setQualities] = useState([]);
  const [selectedQuality, setSelectedQuality] = useState('720p');
  const [showControls, setShowControls] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch streaming URL
  const fetchStreamUrl = async (quality = selectedQuality) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(
        `/api/stream/${animeId}/${episodeNumber}?quality=${quality}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch stream');
      }
      
      const streamData = await response.json();
      
      if (streamData.streamUrl) {
        setStreamUrl(streamData.streamUrl);
        setSelectedQuality(quality);
        if (onQualityChange) onQualityChange(quality);
      } else {
        throw new Error(streamData.message || 'No stream URL available');
      }
    } catch (err) {
      console.error('Stream fetch error:', err);
      setError(err.message);
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available qualities
  const fetchQualities = async () => {
    try {
      const response = await fetch(`/api/stream/${animeId}/${episodeNumber}/qualities`);
      if (response.ok) {
        const data = await response.json();
        setQualities(data.qualities || []);
      }
    } catch (err) {
      console.error('Failed to fetch qualities:', err);
    }
  };

  // Initialize player
  useEffect(() => {
    if (animeId && episodeNumber) {
      fetchQualities();
      fetchStreamUrl();
    }
  }, [animeId, episodeNumber]);

  // Video event handlers
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Control handlers
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handleSeek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const changeQuality = (quality) => {
    const currentTime = videoRef.current?.currentTime || 0;
    fetchStreamUrl(quality).then(() => {
      // Restore playback position after quality change
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
          if (isPlaying) {
            videoRef.current.play();
          }
        }
      }, 100);
    });
  };

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !streamUrl) {
    return (
      <div style={styles.playerContainer}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading episode...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.playerContainer}>
        <div style={styles.errorContainer}>
          <p style={styles.errorIcon}>⚠️</p>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => fetchStreamUrl()} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!streamUrl) {
    return (
      <div style={styles.playerContainer}>
        <div style={styles.placeholderContainer}>
          <p style={styles.placeholderIcon}>📺</p>
          <p>No stream available for this episode</p>
          <p style={styles.placeholderSubtext}>
            Streaming service not configured or episode not found
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={styles.playerContainer}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={streamUrl}
        style={styles.video}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onClick={togglePlay}
        crossOrigin="anonymous"
      />
      
      {showControls && (
        <div style={styles.controls}>
          {/* Progress Bar */}
          <div style={styles.progressContainer} onClick={handleSeek}>
            <div style={styles.progressBar}>
              <div 
                style={{
                  ...styles.progressFill,
                  width: `${(currentTime / duration) * 100}%`
                }}
              />
            </div>
          </div>
          
          {/* Control Bar */}
          <div style={styles.controlBar}>
            <button onClick={togglePlay} style={styles.controlButton}>
              {isPlaying ? '⏸️' : '▶️'}
            </button>
            
            <span style={styles.timeDisplay}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            
            <div style={styles.volumeControl}>
              <span>🔊</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                style={styles.volumeSlider}
              />
            </div>
            
            {qualities.length > 0 && (
              <select 
                value={selectedQuality}
                onChange={(e) => changeQuality(e.target.value)}
                style={styles.qualitySelector}
              >
                {qualities.map(quality => (
                  <option key={quality} value={quality}>{quality}</option>
                ))}
              </select>
            )}
            
            <button onClick={toggleFullscreen} style={styles.controlButton}>
              {isFullscreen ? '⊖' : '⊞'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  playerContainer: {
    position: 'relative',
    width: '100%',
    height: '400px',
    backgroundColor: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#fff',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid #7c3aed',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#ff6b6b',
    textAlign: 'center',
    padding: '20px',
  },
  errorIcon: {
    fontSize: '3rem',
    marginBottom: '8px',
  },
  errorText: {
    marginBottom: '16px',
  },
  retryButton: {
    padding: '8px 16px',
    backgroundColor: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  placeholderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#888',
    textAlign: 'center',
  },
  placeholderIcon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  placeholderSubtext: {
    fontSize: '0.9rem',
    color: '#666',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    transition: 'opacity 0.3s',
  },
  progressContainer: {
    padding: '8px 12px 0',
    cursor: 'pointer',
  },
  progressBar: {
    width: '100%',
    height: '4px',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    transition: 'width 0.1s',
  },
  controlBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    gap: '12px',
  },
  controlButton: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '1.2rem',
    cursor: 'pointer',
    padding: '4px',
  },
  timeDisplay: {
    color: '#fff',
    fontSize: '0.9rem',
    minWidth: '100px',
  },
  volumeControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  volumeSlider: {
    width: '80px',
  },
  qualitySelector: {
    padding: '4px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '4px',
    fontSize: '0.9rem',
  },
};

export default StreamingVideoPlayer;