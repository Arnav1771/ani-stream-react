import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="not-found container text-center">
    <h1 className="not-found-code">404</h1>
    <p className="not-found-msg">Oops! This page doesn&apos;t exist.</p>
    <Link to="/" className="btn-primary">Go Home</Link>
  </div>
);

export default NotFound;
