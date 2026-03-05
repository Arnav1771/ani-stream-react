import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Global styles for the application
import App from './App'; // The root component of the application
import reportWebVitals from './reportWebVitals'; // For performance monitoring

// Create a root for the React application to render into.
// This is the entry point where our React app gets mounted to the DOM.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main App component inside React's StrictMode.
// StrictMode helps in identifying potential problems in an application.
// It activates additional checks and warnings for its descendants.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();