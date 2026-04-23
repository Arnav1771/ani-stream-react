import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import AnimeList from '../components/AnimeList';
import { searchAnime } from '../services/api';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;

    const doSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchAnime(query);
        if (!cancelled) setResults(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Search failed. Is the backend running?');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    doSearch();
    return () => { cancelled = true; };
  }, [query]);

  const handleSearch = (q) => {
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSelect = (anime) => {
    navigate(`/watch?anime=${encodeURIComponent(anime.title)}&ep=1`);
  };

  return (
    <div className="search-page container">
      <div className="search-page-bar">
        <SearchBar onSearch={handleSearch} defaultValue={query} placeholder="Search anime…" />
      </div>

      {query && (
        <h2 className="search-heading">
          {loading ? 'Searching…' : `Results for "${query}"`}
        </h2>
      )}

      {!query && (
        <p className="search-hint">Enter a title above to start searching.</p>
      )}

      <AnimeList
        animeItems={results}
        onAnimeSelect={handleSelect}
        isLoading={loading}
        error={error}
      />
    </div>
  );
};

export default SearchPage;
