import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SearchBar from '../components/SearchBar';
import { searchAnime } from '../services/api';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = (newQuery) => {
    setSearchParams({ q: newQuery });
  };

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchAnime(query);
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
        setError('Failed to search anime. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div style={styles.container}>
      <div style={styles.searchSection}>
        <h1 style={styles.heading}>Search Anime</h1>
        <SearchBar onSearch={handleSearch} placeholder="Search for anime..." />
      </div>

      {loading && <LoadingSpinner message="Searching..." />}

      {error && <ErrorMessage message={error} />}

      {!loading && !error && query && results.length === 0 && (
        <p style={styles.noResults}>No results found for "{query}"</p>
      )}

      {!loading && results.length > 0 && (
        <div style={styles.resultsSection}>
          <h2 style={styles.resultsHeading}>Results for "{query}"</h2>
          <div style={styles.grid}>
            {results.map((anime) => (
              <AnimeCard key={anime.id} anime={anime} />
            ))}
          </div>
        </div>
      )}

      {!query && !loading && (
        <p style={styles.hint}>Enter a search term to find anime</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '80vh',
    padding: '24px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  searchSection: {
    textAlign: 'center',
    marginBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  heading: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  resultsSection: {
    marginTop: '24px',
  },
  resultsHeading: {
    fontSize: '1.4rem',
    color: '#ccc',
    marginBottom: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: '16px',
  },
  noResults: {
    textAlign: 'center',
    color: '#888',
    fontSize: '1.1rem',
    marginTop: '40px',
  },
  hint: {
    textAlign: 'center',
    color: '#666',
    fontSize: '1.1rem',
    marginTop: '60px',
  },
};

export default Search;
