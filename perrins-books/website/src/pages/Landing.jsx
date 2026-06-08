import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="landing landing--rect-grid">
      
      <div className="hero-group hero-group--top">
        <h1 className="hero-text hero-text--first glass-text">PERRIN</h1>
        <div className="horizontal-anchor glass-text-small">
          <span>AUTHOR</span>
          <span className="dot">•</span>
          <span>MUSICIAN</span>
          <span className="dot">•</span>
          <span>DEVELOPER</span>
        </div>
      </div>

      <nav className="rect-grid-nav">
        <Link to="/books" className="rect-card">
          <div className="rect-card__glass"></div>
          <h2 className="rect-card__title">BOOKSHELF</h2>
        </Link>
        
        <Link to="/music" className="rect-card">
          <div className="rect-card__glass"></div>
          <h2 className="rect-card__title">MUSIC</h2>
        </Link>
        
        <Link to="/projects" className="rect-card">
          <div className="rect-card__glass"></div>
          <h2 className="rect-card__title">OTHER</h2>
        </Link>
        
        {/* <Link to="/about" className="rect-card">
          <div className="rect-card__glass"></div>
          <h2 className="rect-card__title">ABOUT</h2>
        </Link> */}
      </nav>

      <div className="hero-group hero-group--bottom">
        <h1 className="hero-text hero-text--last glass-text">SENKE</h1>
      </div>

    </div>
  );
}
