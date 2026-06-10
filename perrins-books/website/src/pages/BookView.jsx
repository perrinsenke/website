import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getBook } from '../bookRegistry.js';
import { useStore } from '../store.js';

function formatPoemBody(lines) {
  const stanzas = [];
  let current = [];

  for (const line of lines) {
    if (line.trim() === '') {
      if (current.length > 0) {
        stanzas.push(current);
        current = [];
      }
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    stanzas.push(current);
  }

  return stanzas;
}

export default function BookView() {
  const { id, page } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const set3DEnabled = useStore((state) => state.set3DEnabled);

  // 3D background remains enabled by default, but users can still toggle it via the button in App.jsx
  
  const book = getBook(id);
  if (!book) {
    return <div className="landing page-enter"><p>Book not found.</p><Link to="/books">← Back</Link></div>;
  }

  const { config, poems } = book;
  const hasDedication = config.dedication && config.dedication.length > 0;
  
  const poemIndex = page ? parseInt(page, 10) : 0;
  const totalPages = hasDedication ? poems.length + 1 : poems.length;
  const safeIndex = Math.max(0, Math.min(poemIndex, totalPages - 1));

  const isDedication = hasDedication && safeIndex === 0;
  const poemArrayIndex = hasDedication ? safeIndex - 1 : safeIndex;
  const poem = isDedication ? null : poems[poemArrayIndex];

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [safeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && safeIndex > 0) {
        navigate(`/book/${id}/${safeIndex - 1}`);
      }
      if (e.key === 'ArrowRight' && safeIndex < totalPages - 1) {
        navigate(`/book/${id}/${safeIndex + 1}`);
      }
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [id, safeIndex, totalPages, navigate]);

  return (
    <>
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'sidebar-overlay--visible' : ''}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>
      <div className="book-view">
        <nav className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
          <div className="sidebar__glass"></div>
          <Link to="/books" className="sidebar__back">
            <span className="sidebar__back-arrow">←</span> Bookshelf
          </Link>
          <h2 className="sidebar__book-title">{config.title}</h2>
          <div className="sidebar__divider"></div>
          <div id="toc-list">
            {hasDedication && (
              <button 
                className={`toc-item ${safeIndex === 0 ? 'toc-item--active' : ''}`}
                onClick={() => { navigate(`/book/${id}/0`); setSidebarOpen(false); }}
              >
                <span className="toc-item__number"></span>Dedication
              </button>
            )}
            {poems.map((p, idx) => {
              const pageNum = hasDedication ? idx + 1 : idx;
              return (
                <button 
                  key={p.id || idx}
                  className={`toc-item ${safeIndex === pageNum ? 'toc-item--active' : ''}`}
                  onClick={() => { navigate(`/book/${id}/${pageNum}`); setSidebarOpen(false); }}
                >
                  <span className="toc-item__number">{idx + 1}.</span>{p.displayTitle}
                </button>
              );
            })}
          </div>
        </nav>
        
        <main>
          {isDedication ? (
            <div className="dedication anticolor-section">
              <div className="dedication__glass"></div>
              <p className="dedication__label">Dedication</p>
              <p className="dedication__text">{config.dedication}</p>
            </div>
          ) : poem ? (
            <div className="poem-area anticolor-section">
              <div className="poem-area__glass"></div>
              <h1 className="poem-area__title">{poem.displayTitle}</h1>
              {poem.date && <p className="poem-area__date">{poem.date}</p>}
              <div className="poem-area__body">
                {formatPoemBody(poem.lines).map((stanza, sIdx) => (
                  <div key={sIdx} className="stanza">
                    {stanza.map((line, lIdx) => (
                      <React.Fragment key={lIdx}>
                        {line}
                        {lIdx < stanza.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                ))}
              </div>
              
              <nav className="poem-nav">
                <button 
                  className={`poem-nav__btn ${safeIndex <= 0 ? 'poem-nav__btn--disabled' : ''}`}
                  onClick={() => navigate(`/book/${id}/${safeIndex - 1}`)}
                  disabled={safeIndex <= 0}
                >
                  ← Prev
                </button>
                <span className="poem-nav__counter">{poemArrayIndex + 1} / {poems.length}</span>
                <button 
                  className={`poem-nav__btn ${safeIndex >= totalPages - 1 ? 'poem-nav__btn--disabled' : ''}`}
                  onClick={() => navigate(`/book/${id}/${safeIndex + 1}`)}
                  disabled={safeIndex >= totalPages - 1}
                >
                  Next →
                </button>
              </nav>
            </div>
          ) : null}
        </main>
      </div>
      <button 
        className="sidebar-toggle" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle table of contents"
      >
        ☰
      </button>
    </>
  );
}
