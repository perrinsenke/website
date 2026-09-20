import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store.js';

export default function Projects() {
  const set3DEnabled = useStore((state) => state.set3DEnabled);

  useEffect(() => {
    set3DEnabled(true);
  }, [set3DEnabled]);

  return (
    <div className="projects-layout">

      {/* Background Anticolor Typography */}
      <div className="projects-bg-text">PROJECTS</div>

      {/* Navigation */}
      <nav className="chaos-nav animate-enter-fade">
        <Link to="/" className="chaos-nav__back">
          <span className="chaos-nav__back-arrow">←</span> BACK
        </Link>
      </nav>

      {/* Projects Container */}
      <div className="project-slates-container">
        
        {/* Splinter — Active */}
        <Link 
          to="/projects/splinter" 
          className="project-slate project-slate--active" 
          style={{ 
            animation: `enter-slideUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards, chaos-float 12s ease-in-out infinite alternate`,
            animationDelay: `0.2s, 0s`,
            opacity: 0,
            transform: 'translateY(40px)'
          }}
        >
          <div className="project-slate__glass"></div>
          <div className="project-slate__content" style={{ alignItems: 'center' }}>
            <div className="project-slate__meta" style={{ justifyContent: 'center' }}>
              <span className="project-slate__type">CELLULAR AUTOMATA</span>
            </div>
            <h2 className="project-slate__title" style={{ textAlign: 'center' }}>SPLINTER</h2>
          </div>
        </Link>

        {/* Genetic Ecosystem — Upcoming */}
        <div 
          className="project-slate project-slate--disabled" 
          style={{ 
            animation: `enter-slideUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards, chaos-float 12s ease-in-out infinite alternate`,
            animationDelay: `0.4s, -2s`,
            opacity: 0,
            transform: 'translateY(40px)'
          }}
        >
          <div className="project-slate__glass"></div>
          <div className="project-slate__content" style={{ alignItems: 'center' }}>
            <div className="project-slate__meta" style={{ justifyContent: 'center' }}>
              <span className="project-slate__type">UPCOMING</span>
            </div>
            <h2 className="project-slate__title" style={{ textAlign: 'center' }}>???</h2>
          </div>
        </div>

        {/* Coming Soon #2 */}
        <div 
          className="project-slate project-slate--disabled" 
          style={{ 
            animation: `enter-slideUp 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards, chaos-float 12s ease-in-out infinite alternate`,
            animationDelay: `0.6s, -4s`,
            opacity: 0,
            transform: 'translateY(40px)'
          }}
        >
          <div className="project-slate__glass"></div>
          <div className="project-slate__content" style={{ alignItems: 'center' }}>
            <div className="project-slate__meta" style={{ justifyContent: 'center' }}>
              <span className="project-slate__type">UPCOMING</span>
            </div>
            <h2 className="project-slate__title" style={{ textAlign: 'center' }}>???</h2>
          </div>
        </div>

      </div>
    </div>
  );
}
