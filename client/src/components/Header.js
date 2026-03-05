import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="app-logo-link">
          <h1 className="app-logo">AniStream</h1>
        </Link>
        <nav className="header-nav">
          {/* In a real app, you might have more navigation items here */}
          {/* <Link to="/browse" className="nav-item">Browse</Link> */}
          {/* <Link to="/watchlist" className="nav-item">Watchlist</Link> */}
        </nav>
        <div className="header-actions">
          <Link to="/search" className="search-icon-link" aria-label="Search">
            <FontAwesomeIcon icon={faSearch} className="search-icon" />
          </Link>
          {/* Potentially add user profile/auth actions here later */}
          {/* <button className="profile-button">Profile</button> */}
        </div>
      </div>
    </header>
  );
};

export default Header;