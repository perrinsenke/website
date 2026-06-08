import React from 'react';
import { Environment } from '@react-three/drei';
import ProceduralWorld from './ProceduralWorld.jsx';

export default function Scene({ route }) {
  return (
    <>
      <Environment preset="city" />
      <ProceduralWorld route={route} />
    </>
  );
}
