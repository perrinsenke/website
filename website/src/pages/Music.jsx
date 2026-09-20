import React from 'react';
import { Link } from 'react-router-dom';

export default function Music() {
  return (
    <div className="music-chaos">
      
      <nav className="chaos-nav animate-enter-fade">
        <Link to="/" className="chaos-nav__back">
          <span className="chaos-nav__back-arrow">←</span> BACK
        </Link>
      </nav>

      <div className="music-console-wrapper">
        <div className="music-console animate-enter-slideUp" style={{ animationDelay: '0.2s' }}>
          
          <div className="spotify-embed-container animate-enter-slideUp" style={{ animationDelay: '0.4s' }}>
            <iframe style={{ borderRadius: '12px', border: 'none' }} 
              src="https://open.spotify.com/embed/artist/3OvKAmQGysEIHVCEoOU6AF?utm_source=generator&theme=0" 
              width="100%" 
              height="380" 
              allowFullScreen="" 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy">
            </iframe>
          </div>

          <div className="music-pills">
            <a href="https://open.spotify.com/artist/3OvKAmQGysEIHVCEoOU6AF?si=7Rvm13tJRHmWG2Pnz5P7gg" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="music-pill music-pill--spotify animate-enter-slideUp" style={{ animationDelay: '0.5s' }}>
              Listen on Spotify
            </a>
            <a href="https://music.apple.com/us/artist/perrin-senke/1729034457" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="music-pill music-pill--apple animate-enter-slideUp" style={{ animationDelay: '0.6s' }}>
              Listen on Apple Music
            </a>
            <a href="https://www.youtube.com/@perrinbass/releases" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="music-pill music-pill--youtube animate-enter-slideUp" style={{ animationDelay: '0.7s' }}>
              Listen on YouTube Music
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
