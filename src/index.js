import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PicapicaClone from './components/PicapicaClone';
import ErrorBoundary from './components/ErrorBoundary';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/clone" element={<PicapicaClone />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
