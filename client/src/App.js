import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import WatchPage from './pages/WatchPage';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Router basename="/">
      <div className="app-container">
        <header className="app-header">
          <Link to="/" className="app-logo">
            <span className="logo-icon">🎌</span>
            <span className="logo-text">AniStream</span>
          </Link>
          <nav className="app-nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/search" className="nav-link">Search</Link>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/watch" element={<WatchPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>
            &copy; {new Date().getFullYear()} AniStream &nbsp;&bull;&nbsp; Powered by{' '}
            <a href="https://github.com/pystardust/ani-cli" target="_blank" rel="noopener noreferrer">
              ani-cli
            </a>
          </p>
        </footer>
      </div>
    </Router>
  );
}

export default App;