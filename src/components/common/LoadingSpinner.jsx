import React from 'react';

const LoadingSpinner = () => (
  <div 
    className="spinner-border text-primary" 
    role="status"
    data-testid="loading-spinner"
  >
    <span className="visually-hidden">Loading...</span>
  </div>
);

export default LoadingSpinner;
