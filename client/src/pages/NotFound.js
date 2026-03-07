import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>404</h1>
      <p style={styles.message}>Page not found</p>
      <Link to="/" style={styles.link}>
        Go back to Home
      </Link>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
    padding: '24px',
  },
  heading: {
    fontSize: '6rem',
    fontWeight: 'bold',
    color: '#7c3aed',
    margin: 0,
  },
  message: {
    fontSize: '1.4rem',
    color: '#888',
    marginTop: '8px',
  },
  link: {
    marginTop: '24px',
    padding: '12px 24px',
    backgroundColor: '#7c3aed',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    transition: 'background-color 0.2s',
  },
};

export default NotFound;
