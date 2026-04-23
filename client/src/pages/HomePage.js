import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

const POPULAR_SEARCHES = [
  'Naruto', 'Attack on Titan', 'Demon Slayer',
  'One Piece', 'Jujutsu Kaisen', 'Fullmetal Alchemist',
];

const HomePage = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Watch Anime,{' '}
            <span className="hero-highlight">Anywhere</span>
          </h1>
          <p className="hero-subtitle">
            Search and stream thousands of anime episodes, powered by{' '}
            <a
              href="https://github.com/pystardust/ani-cli"
              target="_blank"
              rel="noopener noreferrer"
            >
              ani-cli
            </a>
          </p>
          <div className="hero-search">
            <SearchBar
              onSearch={handleSearch}
              value={inputValue}
              onChange={setInputValue}
              placeholder="Search anime titles…"
            />
          </div>
          <div className="popular-tags">
            <span className="tags-label">Popular:</span>
            {POPULAR_SEARCHES.map((title) => (
              <button
                key={title}
                className="tag-btn"
                onClick={() => handleSearch(title)}
              >
                {title}
              </button>
            ))}
          </div>
        </div>
        <div className="hero-decoration" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
      </section>

      {/* How it works */}
      <section className="features container">
        <h2 className="section-title">How It Works</h2>
        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">🔍</span>
            <h3>Search</h3>
            <p>Type any anime title to find it instantly via ani-cli.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">📺</span>
            <h3>Browse Episodes</h3>
            <p>Pick any episode from the full list — dubbed or subbed.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">▶️</span>
            <h3>Stream</h3>
            <p>Watch directly in your browser with our built-in player.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;