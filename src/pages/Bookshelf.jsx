import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { books } from '../bookRegistry.js';
import { useStore } from '../store.js';

export default function Bookshelf() {
  const set3DEnabled = useStore((state) => state.set3DEnabled);

  useEffect(() => {
    set3DEnabled(true);
  }, [set3DEnabled]);
  return (
    <div className="bookshelf-chaos">
      
      {/* Background Anticolor Typography */}
      <div className="library-bg-text">BOOKSHELF</div>

      <nav className="chaos-nav animate-enter-fade">
        <Link to="/" className="chaos-nav__back">
          <span className="chaos-nav__back-arrow">←</span> BACK
        </Link>
      </nav>

      <div className="monolith-gallery">
        {books.map(({ config, poems }, index) => {
          // Calculate an animation delay so they float out of sync
          const floatDelay = index * -2; 
          const entryDelay = (index * 0.2) + 0.2;
          
          let displayTitle = config.title;
          if (config.title.toLowerCase() === 'month.day.year') {
            displayTitle = <>month.<br/>day.year</>;
          }

          return (
            <Link 
              key={config.id} 
              to={`/book/${config.id}/0`} 
              className="book-monolith" 
              id={`book-card-${config.id}`}
              style={{ 
                animation: `enter-slideUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards, chaos-float 12s ease-in-out infinite alternate`,
                animationDelay: `${entryDelay}s, ${floatDelay}s`,
                opacity: 0,
                transform: 'translateY(40px)'
              }}
            >
              <div className="book-monolith__content">
                <div className="book-monolith__meta">
                  <span className="book-monolith__badge">{config.publishLabel}</span>
                  <span className="book-monolith__count">{poems.length} POEMS</span>
                </div>
                <h2 className="book-monolith__title">{displayTitle}</h2>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
