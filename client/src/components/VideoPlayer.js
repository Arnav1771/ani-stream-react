import React, { useRef, useEffect, useState, useCallback } from 'react';
import './VideoPlayer.css'; // Assuming you'll create a CSS file for styling

const VideoPlayer = ({ videoSource, onVideoEnd }) => {
  const videoRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef(null);

  // Effect to handle video source changes
  useEffect(() => {
    if (videoRef.current && videoSource) {
      videoRef.current.src = videoSource;
      videoRef.current.load(); // Load the new source
      videoRef.current.then(() => {
        videoRef.current.play().catch(error => console.error("Error playing video:", error));
        setIsPlaying(true);
      }).catch(error => {
        console.error("Error loading video source:", error);
      });
    }
  }, [videoSource]);

  // Event listeners for video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (onVideoEnd) {
        onVideoEnd();
      }
    };
    const handleError = (e) => {
      console.error("Video playback error:", e);
      // You might want to display an error message to the user
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [onVideoEnd]);

  // Fullscreen event listener
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('msfullscreenchange', handleFullScreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullScreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullScreenChange);
      document.removeEventListener('msfullscreenchange', handleFullScreenChange);
    };
  }, []);

  // Control visibility logic
  const hideControls = useCallback(() => {
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000); // Hide controls after 3 seconds of inactivity
    }
  }, [isPlaying]);

  const showAndResetControls = useCallback(() => {
    clearTimeout(controlsTimeoutRef.current);
    setShowControls(true);
    hideControls();
  }, [hideControls]);

  useEffect(() => {
    if (isPlaying) {
      hideControls();
    } else {
      clearTimeout(controlsTimeoutRef.current);
      setShowControls(true); // Always show controls when paused
    }
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [isPlaying, hideControls]);

  // Play/Pause toggle
  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play().catch(error => console.error("Error playing video:", error));
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Seek video
  const handleSeek = (e) => {
    const video = videoRef.current;
    if (video) {
      const seekTime = (e.nativeEvent.offsetX / e.target.offsetWidth) * video.duration;
      video.currentTime = seekTime;
      setProgress((seekTime / video.duration) * 100);
    }
  };

  // Volume control
  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (video) {
      const newVolume = parseFloat(e.target.value);
      video.volume = newVolume;
      setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
      } else if (newVolume === 0 && !isMuted) {
        setIsMuted(true);
      }
    }
  };

  // Mute/Unmute toggle
  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
      if (!video.muted && video.volume === 0) {
        video.volume = 0.5; // Set a default volume if unmuting from 0
        setVolume(0.5);
      }
    }
  };

  // Fullscreen toggle
  const toggleFullScreen = () => {
    const playerContainer = playerContainerRef.current;
    if (playerContainer) {
      if (!document.fullscreenElement) {
        if (playerContainer.requestFullscreen) {
          playerContainer.requestFullscreen();
        } else if (playerContainer.mozRequestFullScreen) { /* Firefox */
          playerContainer.mozRequestFullScreen();
        } else if (playerContainer.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
          playerContainer.webkitRequestFullscreen();
        } else if (playerContainer.msRequestFullscreen) { /* IE/Edge */
          playerContainer.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { /* Firefox */
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE/Edge */
          document.msExitFullscreen();
        }
      }
    }
  };

  // Format time for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case ' ': // Spacebar to play/pause
          e.preventDefault(); // Prevent scrolling
          togglePlayPause();
          break;
        case 'ArrowRight': // Seek forward 5 seconds
          video.currentTime = Math.min(video.currentTime + 5, video.duration);
          break;
        case 'ArrowLeft': // Seek backward 5 seconds
          video.currentTime = Math.max(video.currentTime - 5, 0);
          break;
        case 'ArrowUp': // Increase volume
          video.volume = Math.min(video.volume + 0.1, 1);
          break;
        case 'ArrowDown': // Decrease volume
          video.volume = Math.max(video.volume - 0.1, 0);
          break;
        case 'm': // Mute/unmute
          toggleMute();
          break;
        case 'f': // Fullscreen
          toggleFullScreen();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause, toggleMute, toggleFullScreen]);

  if (!videoSource) {
    return (
      <div className="video-player-container no-source">
        <p>No video source provided. Please select an episode.</p>
      </div>
    );
  }

  return (
    <div
      ref={playerContainerRef}
      className={`video-player-container ${isFullScreen ? 'fullscreen' : ''} ${showControls ? 'show-controls' : 'hide-controls'}`}
      onMouseMove={showAndResetControls}
      onMouseEnter={showAndResetControls}
      onMouseLeave={hideControls}
    >
      <video
        ref={videoRef}
        className="video-element"
        onClick={togglePlayPause}
        onDoubleClick={toggleFullScreen}
        preload="auto"
        playsInline // Important for mobile browsers
      >
        Your browser does not support the video tag.
      </video>

      <div className="player-overlay" onClick={togglePlayPause}>
        {!isPlaying && (
          <div className="play-pause-overlay-icon">
            <i className="fas fa-play"></i>
          </div>
        )}
      </div>

      <div className="video-controls">
        <div className="progress-bar-container" onClick={handleSeek}>
          <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="controls-bottom">
          <button className="control-button" onClick={togglePlayPause}>
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
          </button>

          <div className="time-display">
            <span>{formatTime(videoRef.current?.currentTime || 0)}</span> / <span>{formatTime(duration)}</span>
          </div>

          <div className="volume-control">
            <button className="control-button" onClick={toggleMute}>
              <i className={`fas ${isMuted || volume === 0 ? 'fa-volume-mute' : (volume > 0.5 ? 'fa-volume-up' : 'fa-volume-down')}`}></i>
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>

          <div className="spacer"></div> {/* Pushes fullscreen button to the right */}

          <button className="control-button" onClick={toggleFullScreen}>
            <i className={`fas ${isFullScreen ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;