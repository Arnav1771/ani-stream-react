import React from 'react';
import { Link } from 'react-router-dom';

const AnimeCard = ({ anime }) => {
  if (!anime) return null;

  return (
    <Link to={`/watch/${anime.id}/1`} className="anime-card" style={styles.card}>
      <div style={styles.imageContainer}>
        <img
          src={anime.image || 'https://via.placeholder.com/225x320?text=No+Image'}
          alt={anime.title}
          style={styles.image}
          loading="lazy"
        />
        {anime.score > 0 && (
          <span style={styles.score}>★ {anime.score}</span>
        )}
      </div>
      <div style={styles.info}>
        <h3 style={styles.title}>{anime.title}</h3>
        {anime.type && <span style={styles.type}>{anime.type}</span>}
      </div>
    </Link>
  );
};

const styles = {
  card: {
    display: 'block',
    textDecoration: 'none',
    color: 'inherit',
    backgroundColor: '#1a1a2e',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    paddingTop: '142%',
    overflow: 'hidden',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  score: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    color: '#ffd700',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
  },
  info: {
    padding: '8px 10px',
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: '600',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: '#e0e0e0',
  },
  type: {
    fontSize: '0.75rem',
    color: '#888',
    marginTop: '4px',
    display: 'inline-block',
  },
};

export default AnimeCard;
