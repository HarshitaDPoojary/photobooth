import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './PicapicaClone.css';

// Prefer local public asset; fallback to remote if not available
const LOCAL_PHOTO = '/assets/picapica-photostrip.png';
const REMOTE_PHOTO = 'https://picapicabooth.com/picapica-photostrip.png';

export default function PicapicaClone() {
  const [src, setSrc] = useState(LOCAL_PHOTO);

  return (
    <div className="picapica-root">
      <div className="picapica-container">
        <header className="picapica-header">
          <h1>Picapica - Free Online Photo Booth</h1>
          <p className="subtitle">Welcome to Agnes' Picapica, your personal photo booth at home. Create photo strips with fun filters and frames.</p>
        </header>

        <main className="picapica-main">
          <img
            className="photostrip"
            src={src}
            alt="picapica photostrip"
            onError={() => {
              if (src !== REMOTE_PHOTO) setSrc(REMOTE_PHOTO);
            }}
          />

          <Link to="/?from=clone&layout=layout-1" className="start-button">START</Link>
          <p className="tagline">Picapica Booth - The original online photo strip creator</p>
        </main>

        <footer className="picapica-footer">
          <p>made by <a href="https://agneswei.com" target="_blank" rel="noreferrer">agneswei</a></p>
          <p>© 2025 Agnes Wei. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
}
