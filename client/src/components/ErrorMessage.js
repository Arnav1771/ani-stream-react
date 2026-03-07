import React from 'react';

const ErrorMessage = ({ message = 'Something went wrong.', onRetry }) => {
  return (
    <div style={styles.container}>
      <div style={styles.icon}>⚠️</div>
      <p style={styles.message}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={styles.button}>
          Try Again
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    textAlign: 'center',
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  message: {
    color: '#ff6b6b',
    fontSize: '1.1rem',
    maxWidth: '400px',
  },
  button: {
    marginTop: '16px',
    padding: '10px 24px',
    backgroundColor: '#7c3aed',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'background-color 0.2s',
  },
};

export default ErrorMessage;
