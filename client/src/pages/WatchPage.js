import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import VideoPlayer from '../components/VideoPlayer';
import EpisodeGrid from '../components/EpisodeGrid';
import { getEpisodes, getStreamUrl } from '../services/api';

const WatchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const animeTitle = searchParams.get('anime') || '';
  const initialEp = parseInt(searchParams.get('ep') || '1', 10);

  const [episodes, setEpisodes] = useState([]);
  const [selectedEp, setSelectedEp] = useState(initialEp);
  const [streamUrl, setStreamUrl] = useState('');
  const [loadingEps, setLoadingEps] = useState(false);
  const [loadingStream, setLoadingStream] = useState(false);
  const [epsError, setEpsError] = useState(null);
  const [streamError, setStreamError] = useState(null);

  // Fetch episode list
  useEffect(() => {
    if (!animeTitle) return;
    let cancelled = false;

    const fetchEps = async () => {
      setLoadingEps(true);
      setEpsError(null);
      try {
        const data = await getEpisodes(animeTitle);
        if (!cancelled) setEpisodes(data.map((ep) => ep.id));
      } catch (err) {
        if (!cancelled) setEpsError(err.message || 'Could not load episodes.');
      } finally {
        if (!cancelled) setLoadingEps(false);
      }
    };

    fetchEps();
    return () => { cancelled = true; };
  }, [animeTitle]);

  // Fetch stream URL when episode changes
  useEffect(() => {
    if (!animeTitle || !selectedEp) return;
    let cancelled = false;

    const fetchStream = async () => {
      setLoadingStream(true);
      setStreamError(null);
      setStreamUrl('');
      try {
        const data = await getStreamUrl(animeTitle, selectedEp);
        if (!cancelled) setStreamUrl(data.streamUrl);
      } catch (err) {
        if (!cancelled) setStreamError(err.message || 'Could not load stream.');
      } finally {
        if (!cancelled) setLoadingStream(false);
      }
    };

    fetchStream();
    return () => { cancelled = true; };
  }, [animeTitle, selectedEp]);

  const handleEpSelect = (epNum) => {
    setSelectedEp(epNum);
    navigate(`/watch?anime=${encodeURIComponent(animeTitle)}&ep=${epNum}`, { replace: true });
  };

  if (!animeTitle) {
    return (
      <div className="container text-center" style={{ paddingTop: '4rem' }}>
        <p>No anime selected. <button className="link-btn" onClick={() => navigate('/search')}>Search for anime</button></p>
      </div>
    );
  }

  return (
    <div className="watch-page">
      <div className="watch-header container">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <h1 className="watch-title">{animeTitle}</h1>
      </div>

      <div className="watch-layout container">
        {/* Video player */}
        <div className="player-section">
          {loadingStream && (
            <div className="player-overlay">
              <div className="spinner" />
              <p>Loading stream…</p>
            </div>
          )}
          {streamError && !loadingStream && (
            <div className="player-overlay error-overlay">
              <span className="error-icon">⚠️</span>
              <p>{streamError}</p>
            </div>
          )}
          {!loadingStream && !streamError && streamUrl && (
            <VideoPlayer videoSource={streamUrl} />
          )}
          {!loadingStream && !streamError && !streamUrl && (
            <div className="player-overlay">
              <span className="play-placeholder">▶</span>
              <p>Select an episode to start watching</p>
            </div>
          )}
        </div>

        {/* Episode list */}
        <aside className="episodes-panel">
          {epsError && <p className="error-text">{epsError}</p>}
          <EpisodeGrid
            episodes={episodes}
            selectedEpisode={selectedEp}
            onEpisodeSelect={handleEpSelect}
            isLoading={loadingEps}
          />
        </aside>
      </div>
    </div>
  );
};

export default WatchPage;
