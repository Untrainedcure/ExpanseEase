import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App';
import './styles/App.css';

// Set base URL for all API calls
// Uses REACT_APP_API_URL from Vercel env variable in production
// Falls back to localhost for local development
axios.defaults.baseURL = process.env.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL.replace('/api', '')
    : 'http://localhost:5000';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);