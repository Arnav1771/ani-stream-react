import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Search from './pages/Search';
import Watch from './pages/Watch';
import NotFound from './pages/NotFound';
import './App.css'; 

function App() {
  return (
    <Router basename="/">
      <div className="app-container">
        <header className="app-header">
          <Link to="/" className="app-logo">
            <span className="logo-text">AniStream</span>
          </Link>
          <nav className="app-nav">
            <ul>
              <li>
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li>
                <Link to="/search" className="nav-link">Search</Link>
              </li>
            </ul>
          </nav>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/watch/:animeId/:episodeId" element={<Watch />} />
            <Route path="*" element={<NotFound />} /> 
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} AniStream. All rights reserved.</p>
          <p>Powered by <a href="https://jikan.moe/" target="_blank" rel="noopener noreferrer">Jikan API</a> (MyAnimeList)</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;