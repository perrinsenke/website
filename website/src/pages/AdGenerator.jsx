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
      {/* Background canvas handles the visuals automatically. No text overlay. */}
    </div>
  );
}
