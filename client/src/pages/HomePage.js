import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import SearchBar from '../components/SearchBar';
import { fetchTrendingAnime, fetchRecentAnime } from '../api/animeApi';

const HomePage = () => {
  const [trendingAnime, setTrendingAnime] = useState([]);
  const [recentAnime, setRecentAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loadAnimeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [trending, recent] = await Promise.all([
        fetchTrendingAnime(),
        fetchRecentAnime()
      ]);
      setTrendingAnime(trending);
      setRecentAnime(recent);
    } catch (err) {
      console.error('Failed to fetch anime data:', err);
      setError('Failed to load anime. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [fetchTrendingAnime, fetchRecentAnime]);

  useEffect(() => {
    loadAnimeData();
  }, [loadAnimeData]);

  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section with Search Bar */}
        <section className="text-center py-16 sm:py-24 lg:py-32 mb-12 bg-gradient-to-r from-purple-800 to-indigo-900 rounded-xl shadow-2xl animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 animate-pulse-slow">
            AniStream
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto font-light">
            Your gateway to a world of anime. Discover, watch, and enjoy!
          </p>
          <div className="max-w-xl mx-auto px-4">
            <SearchBar onSearch={handleSearch} />
          </div>
        </section>

        {/* Trending Anime Section */}
        <section className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 pb-2 border-b-2 border-blue-600">
            Trending Anime
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {trendingAnime.length > 0 ? (
              trendingAnime.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400">No trending anime found.</p>
            )}
          </div>
        </section>

        {/* Recent Anime Section */}
        <section className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-500 pb-2 border-b-2 border-teal-600">
            Recently Added
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {recentAnime.length > 0 ? (
              recentAnime.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400">No recently added anime found.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage;