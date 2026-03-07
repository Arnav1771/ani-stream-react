import React, { useState } from 'react';

const SearchBar = ({ onSearch, placeholder = 'Search anime...' }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
      <button type="submit" style={styles.button}>
        Search
      </button>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    gap: '8px',
    width: '100%',
    maxWidth: '600px',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    fontSize: '1rem',
    backgroundColor: '#1a1a2e',
    border: '2px solid #333',
    borderRadius: '8px',
    color: '#e0e0e0',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    padding: '12px 24px',
    fontSize: '1rem',
    backgroundColor: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
};

export default SearchBar;
