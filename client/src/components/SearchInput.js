import React from 'react';
import PropTypes from 'prop-types';

/**
 * SearchInput component for the anime search bar.
 *
 * @param {object} props - The component props.
 * @param {string} props.value - The current value of the input field.
 * @param {function} props.onChange - Callback function to handle input value changes.
 * @param {function} props.onSearch - Callback function to trigger a search action.
 * @param {boolean} props.isLoading - Indicates if a search operation is currently in progress.
 */
const SearchInput = ({ value, onChange, onSearch, isLoading }) => {
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="relative flex items-center w-full max-w-md mx-auto">
      <input
        type="text"
        placeholder="Search for anime..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="flex-grow p-3 pr-12 text-white bg-gray-700 border border-gray-600 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out placeholder-gray-400"
        aria-label="Search anime"
        disabled={isLoading}
      />
      <button
        onClick={onSearch}
        disabled={isLoading}
        className="absolute right-0 flex items-center justify-center h-full px-4 text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-r-full hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Perform search"
      >
        {isLoading ? (
          <svg className="w-5 h-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

SearchInput.defaultProps = {
  isLoading: false,
};

export default SearchInput;