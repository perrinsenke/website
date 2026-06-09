import React, { Suspense, useMemo, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Bookshelf from './pages/Bookshelf.jsx';
import About from './pages/About.jsx';
import Music from './pages/Music.jsx';
import Projects from './pages/Projects.jsx';
import BookView from './pages/BookView.jsx';
import Splinter from './pages/Splinter.jsx';
import GeneticEcosystem from './pages/GeneticEcosystem.jsx';
import AdGenerator from './pages/AdGenerator.jsx';
import Scene from './components/Scene.jsx';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import { useStore } from './store.js';

function AppContent() {
  const location = useLocation();
  const { bgMode, cycleBgMode } = useStore();
  
  const isPoemScreen = location.pathname.startsWith('/book/');

  // If outside the poem screen, force Full Color (FC) so 3D isn't globally disabled.
  const effectiveBgMode = isPoemScreen ? (bgMode === 'AUTO' ? 'BW' : bgMode) : 'FC';
  const is3DEnabled = effectiveBgMode !== 'OFF';
  const isBW = effectiveBgMode === 'BW';

  // Create a base path dependency so the 3D shader doesn't reset when turning pages within the same book
  const backgroundSeedPath = useMemo(() => {
    const match = location.pathname.match(/^(\/book\/[^/]+)/);
    return match ? match[1] : location.pathname;
  }, [location.pathname]);

  const [bg1, setBg1] = useState('');
  const [bg2, setBg2] = useState('');
  const [activeBg, setActiveBg] = useState(1);

  // Generate random shader gradient parameters based on route changes (or refresh)
  const gradientUrl = useMemo(() => {
    const randomColor = () => `%23${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;
    const color1 = randomColor();
    const color2 = randomColor();
    const color3 = randomColor();
    const rotationX = Math.floor(Math.random() * 360);
    const rotationY = Math.floor(Math.random() * 360);
    const uSpeed = (Math.random() * 0.1 + 0.05).toFixed(2);
    const uDensity = (Math.random() * 2 + 0.5).toFixed(2);
    
    // Geometry randomness 
    const shapes = ['waterPlane', 'sphere', 'plane'];
    const type = shapes[Math.floor(Math.random() * shapes.length)];
    const wireframe = Math.random() > 0.85 ? 'true' : 'false';
    const envPreset = 'city'; // Locked to prevent async HDR download black screens
    
    // Shader uniforms (these provide wild variety without crashing)
    const uAmplitude = (Math.random() * 3).toFixed(2); // 0 to 3
    const uFrequency = (Math.random() * 7 + 1).toFixed(2); // 1 to 8
    const cDistance = (Math.random() * 3 + 1.5).toFixed(2); // 1.5 to 4.5
    
    const cAzimuthAngle = Math.floor(Math.random() * 360);
    const cPolarAngle = Math.floor(Math.random() * 90) + 45; // Keep camera slightly angled
    
    return `https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=0.8&cAzimuthAngle=${cAzimuthAngle}&cDistance=${cDistance}&cPolarAngle=${cPolarAngle}&cameraZoom=1&color1=${color1}&color2=${color2}&color3=${color3}&destination=onCanvas&embedMode=off&envPreset=${envPreset}&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1&positionX=-1.4&positionY=0&positionZ=0&range=off&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=${rotationX}&rotationY=${rotationY}&rotationZ=50&shader=defaults&type=${type}&uAmplitude=${uAmplitude}&uDensity=${uDensity}&uFrequency=${uFrequency}&uSpeed=${uSpeed}&uStrength=4&uTime=0&wireframe=${wireframe}`;
  }, [backgroundSeedPath]);

  // Generate smooth CSS transitions for every page turn within a book
  const { hueRotate, scale, rotate, saturate, brightness, colorFilter } = useMemo(() => {
    // We only want to apply these morphs if we are in the poem screen.
    if (!isPoemScreen) return { hueRotate: 0, scale: 1, rotate: 0, saturate: 1, brightness: 1, colorFilter: 'saturate(1)' };
    
    const randSat = (Math.random() * 2 + 0.5).toFixed(2); // 0.5 to 2.5 for distinct vibrancies
    
    return {
      hueRotate: Math.floor(Math.random() * 360),
      scale: (Math.random() * 0.1 + 1.22).toFixed(2), // 1.22 to 1.32 to safely cover up to 6 degrees of rotation on ultra-wides
      rotate: Math.floor(Math.random() * 12 - 6), // -6deg to 6deg for a subtle tilt that won't expose corners
      saturate: randSat,
      brightness: (Math.random() * 0.8 + 0.6).toFixed(2), // 0.6 to 1.4 for varying light levels
      colorFilter: isBW ? 'grayscale(100%) contrast(1000%)' : `saturate(${randSat})`,
    };
  }, [location.pathname, isPoemScreen, isBW]);

  // Dual-buffer background manager
  useEffect(() => {
    if (!bg1 && !bg2) {
      setBg1(gradientUrl);
      return;
    }
    if (activeBg === 1 && gradientUrl !== bg1) {
      setBg2(gradientUrl);
      setActiveBg(2);
    } else if (activeBg === 2 && gradientUrl !== bg2) {
      setBg1(gradientUrl);
      setActiveBg(1);
    }
  }, [gradientUrl, bg1, bg2, activeBg]);

  // Handle Cmd/Ctrl + A to redirect to /ad
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        navigate('/ad');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <>
      {is3DEnabled && (
        <>
          {/* Buffer 1 */}
          <div 
            className="canvas-container canvas-1" 
            style={{ 
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -2, pointerEvents: 'none',
              opacity: activeBg === 1 ? 1 : 0,
              filter: `blur(${activeBg === 1 ? '0px' : '30px'}) hue-rotate(${hueRotate}deg) ${colorFilter} brightness(${brightness})`,
              transform: `scale(${scale}) rotate(${rotate}deg)`,
              transition: isPoemScreen 
                ? 'opacity 0.75s ease-in-out, filter 0.75s ease-in-out, transform 1s ease-in-out' 
                : 'opacity 0.75s ease-in-out, filter 0.75s ease-in-out, transform 0.75s ease-in-out'
            }}
          >
            {bg1 && (
              <ShaderGradientCanvas style={{ position: 'absolute', top: 0 }}>
                <Suspense fallback={null}>
                  <ShaderGradient control="query" urlString={bg1} />
                  <Scene route={backgroundSeedPath} />
                </Suspense>
              </ShaderGradientCanvas>
            )}
          </div>

          {/* Buffer 2 */}
          <div 
            className="canvas-container canvas-2" 
            style={{ 
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none',
              opacity: activeBg === 2 ? 1 : 0,
              filter: `blur(${activeBg === 2 ? '0px' : '30px'}) hue-rotate(${hueRotate}deg) ${colorFilter} brightness(${brightness})`,
              transform: `scale(${scale}) rotate(${rotate}deg)`,
              transition: isPoemScreen 
                ? 'opacity 0.75s ease-in-out, filter 0.75s ease-in-out, transform 1s ease-in-out' 
                : 'opacity 0.75s ease-in-out, filter 0.75s ease-in-out, transform 0.75s ease-in-out'
            }}
          >
            {bg2 && (
              <ShaderGradientCanvas style={{ position: 'absolute', top: 0 }}>
                <Suspense fallback={null}>
                  <ShaderGradient control="query" urlString={bg2} />
                  <Scene route={backgroundSeedPath} />
                </Suspense>
              </ShaderGradientCanvas>
            )}
          </div>
        </>
      )}

      {/* 3D Toggle Button Overlay - Only visible/available for use on poems screen */}
      {isPoemScreen && (
        <button 
          onClick={cycleBgMode}
          style={{
            position: 'fixed',
            bottom: '1rem',
            right: '2rem',
            zIndex: 100,
            background: is3DEnabled ? 'rgba(218, 207, 182, 0.15)' : 'rgba(24, 23, 22, 0.8)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${is3DEnabled ? 'rgba(218, 207, 182, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
            color: is3DEnabled ? '#dacfb6' : '#7c7a75',
            padding: '0.75rem 1.25rem',
            borderRadius: '30px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.75rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease'
          }}
        >
          {effectiveBgMode === 'BW' ? 'B&W' : effectiveBgMode === 'FC' ? 'FC' : 'OFF'}
        </button>
      )}

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/books" element={<Bookshelf />} />
        <Route path="/about" element={<About />} />
        <Route path="/music" element={<Music />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/splinter" element={<Splinter />} />
        <Route path="/projects/genetic-ecosystem" element={<GeneticEcosystem />} />
        <Route path="/book/:id" element={<BookView />} />
        <Route path="/book/:id/:page" element={<BookView />} />
        <Route path="/ad" element={<AdGenerator />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
