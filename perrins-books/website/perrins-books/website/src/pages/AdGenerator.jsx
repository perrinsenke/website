import React, { useEffect } from 'react';
import { useStore } from '../store.js';

export default function AdGenerator() {
  const set3DEnabled = useStore((state) => state.set3DEnabled);
  
  useEffect(() => {
    // Ensure the 3D background is enabled on load
    set3DEnabled(true);
  }, [set3DEnabled]);

  return (
    <div className="ad-generator">
      <div className="ad-generator__container">
        <h1 className="ad-generator__text glass-text">
          A place for poems<br/>and other writings.
        </h1>
        <div className="ad-generator__footer">
          perrinsenke.com
        </div>
      </div>
    </div>
  );
}
