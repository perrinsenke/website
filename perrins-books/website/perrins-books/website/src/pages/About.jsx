import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const TEXT_OPTIONS = ["PERRIN", "PERRIN SENKE", "PERRIN EDWARD LEE SENKE"];
const SWARM_STRING = "PERRINEDWARDLEESENKE";

const FONTS = [
  'var(--font-display-1)', 'var(--font-display-2)', 'var(--font-display-3)', 
  'var(--font-display-4)', 'var(--font-serif)', 'var(--font-sans)'
];
const STYLES = ['spam-neon-cyan', 'spam-neon-gold', 'spam-neon-purple', 'spam-glass', 'spam-outline', 'spam-diff'];
const ANIMATIONS = ['chaos-drift-x', 'chaos-drift-y', 'chaos-spin', 'chaos-pulse', 'chaos-float'];
const MICRO_ANIMS = ['chaos-jiggle', 'chaos-shake', 'chaos-breathe'];
const PARTICLE_ANIMS = ['particle-dart', 'particle-zigzag'];

export default function About() {
  const spams = useMemo(() => {
    return Array.from({ length: 120 }).map((_, i) => {
      return {
        id: i,
        text: TEXT_OPTIONS[Math.floor(Math.random() * TEXT_OPTIONS.length)],
        font: FONTS[Math.floor(Math.random() * FONTS.length)],
        styleClass: STYLES[Math.floor(Math.random() * STYLES.length)],
        animClass: ANIMATIONS[Math.floor(Math.random() * ANIMATIONS.length)],
        microAnimClass: MICRO_ANIMS[Math.floor(Math.random() * MICRO_ANIMS.length)],
        size: Math.random() * 8 + 1, // 1rem to 9rem
        x: Math.random() * 120 - 10,
        y: Math.random() * 120 - 10,
        duration: Math.random() * 10 + 3, // 3s to 13s (faster movement)
        microDuration: Math.random() * 0.8 + 0.2, // 0.2s to 1s
        delay: Math.random() * -20,
        zIndex: Math.floor(Math.random() * 10),
        rotation: Math.random() * 360
      };
    });
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 250 }).map((_, i) => {
      return {
        id: `p-${i}`,
        text: SWARM_STRING[Math.floor(Math.random() * SWARM_STRING.length)],
        font: FONTS[Math.floor(Math.random() * FONTS.length)],
        styleClass: STYLES[Math.floor(Math.random() * STYLES.length)],
        animClass: PARTICLE_ANIMS[Math.floor(Math.random() * PARTICLE_ANIMS.length)],
        size: Math.random() * 1.5 + 0.5, // 0.5rem to 2rem
        x: Math.random() * 100, // 0 to 100vw
        y: Math.random() * 100, // 0 to 100vh
        duration: Math.random() * 4 + 1, // 1s to 5s (very fast!)
        delay: Math.random() * -10,
        zIndex: Math.floor(Math.random() * 20) + 10, // Always above some names
        rotation: Math.random() * 360
      };
    });
  }, []);

  return (
    <div className="about-chaos">
      <nav className="chaos-nav">
        <Link to="/" className="chaos-nav__back">
          <span className="chaos-nav__back-arrow">←</span> BACK
        </Link>
      </nav>
      
      <div className="chaos-container">
        {/* The Giant Names */}
        {spams.map(spam => (
          <div 
            key={spam.id}
            className={`chaos-text ${spam.styleClass}`}
            style={{
              fontFamily: spam.font,
              fontSize: `${spam.size}rem`,
              left: `${spam.x}vw`,
              top: `${spam.y}vh`,
              animation: `${spam.animClass} ${spam.duration}s linear infinite, ${spam.microAnimClass} ${spam.microDuration}s ease-in-out infinite alternate`,
              animationDelay: `${spam.delay}s`,
              zIndex: spam.zIndex,
              '--start-rot': `${spam.rotation}deg`
            }}
          >
            {spam.text}
          </div>
        ))}

        {/* The Tiny Letter Swarm */}
        {particles.map(p => (
          <div 
            key={p.id}
            className={`chaos-particle ${p.styleClass}`}
            style={{
              fontFamily: p.font,
              fontSize: `${p.size}rem`,
              left: `${p.x}vw`,
              top: `${p.y}vh`,
              animation: `${p.animClass} ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              zIndex: p.zIndex,
              '--start-rot': `${p.rotation}deg`
            }}
          >
            {p.text}
          </div>
        ))}
      </div>
    </div>
  );
}
