import React, { useRef, useEffect, useState, useCallback } from 'react';
import './VideoPlayer.css';

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

  useEffect(() => {
    if (videoRef.current && videoSource) {
      videoRef.current.src = videoSource;
      videoRef.current.load();
      videoRef.current.play().catch(error => console.error("Error playing video:", error));
      setIsPlaying(true);
    }
  }, [videoSource]);

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

  const hideControls = useCallback(() => {
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
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
      setShowControls(true);
    }
    return () => clearTimeout(controlsTimeoutRef.current);
  }, [isPlaying, hideControls]);

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

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (video) {
      const seekTime = (e.nativeEvent.offsetX / e.target.offsetWidth) * video.duration;
      video.currentTime = seekTime;
      setProgress((seekTime / video.duration) * 100);
    }
  };

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

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !video.muted;
      setIsMuted(video.muted);
      if (!video.muted && video.volume === 0) {
        video.volume = 0.5;
        setVolume(0.5);
      }
    }
  };

  const toggleFullScreen = () => {
    const playerContainer = playerContainerRef.current;
    if (playerContainer) {
      if (!document.fullscreenElement) {
        if (playerContainer.requestFullscreen) {
          playerContainer.requestFullscreen();
        } else if (playerContainer.mozRequestFullScreen) {
          playerContainer.mozRequestFullScreen();
        } else if (playerContainer.webkitRequestFullscreen) {
          playerContainer.webkitRequestFullscreen();
        } else if (playerContainer.msRequestFullscreen) {
          playerContainer.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'ArrowRight':
          video.currentTime = Math.min(video.currentTime + 5, video.duration);
          break;
        case 'ArrowLeft':
          video.currentTime = Math.max(video.currentTime - 5, 0);
          break;
        case 'ArrowUp':
          video.volume = Math.min(video.volume + 0.1, 1);
          break;
        case 'ArrowDown':
          video.volume = Math.max(video.volume - 0.1, 0);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={playerContainerRef} className="video-player">
      <video ref={videoRef} className="video" onDoubleClick={toggleFullScreen}>
        <source src={videoSource} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {showControls && (
        <div className="controls">
          <button className="play-pause" onClick={togglePlayPause}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="progress"
          />
          <span className="time">
            {formatTime(videoRef.current?.currentTime)} / {formatTime(duration)}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="volume"
          />
          <button className="mute" onClick={toggleMute}>
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button className="fullscreen" onClick={toggleFullScreen}>
            {isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;