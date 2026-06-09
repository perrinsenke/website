import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, PointMaterial, MeshDistortMaterial, MeshWobbleMaterial, Sphere, Torus, TorusKnot, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

// Simple seeded random number generator
function seededRandom(seed) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Mode 1: Uji Point Cloud (Drifting Stars)
function PointCloud({ seed }) {
  const points = useRef();
  const count = 3000;
  
  const positions = useMemo(() => {
    let rngSeed = seed;
    const pos = new Float32Array(count * 3);
    for(let i = 0; i < count * 3; i++) {
      pos[i] = (seededRandom(rngSeed++) - 0.5) * 25;
    }
    return pos;
  }, [seed]);

  useFrame((state, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.03;
      points.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <PointMaterial transparent color="#ffffff" size={0.08} sizeAttenuation={true} depthWrite={false} opacity={0.6} />
    </points>
  );
}

// Mode 2: Geometric Distortion (Mandelbox-lite)
function DistortedGeometry({ seed }) {
  const mesh = useRef();
  
  let rngSeed = seed;
  const shapeType = Math.floor(seededRandom(rngSeed++) * 3);
  const distort = seededRandom(rngSeed++) * 0.6 + 0.2;
  const speed = seededRandom(rngSeed++) * 2 + 1;
  const color = new THREE.Color().setHSL(seededRandom(rngSeed++), 0.5, 0.5);

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * 0.1;
      mesh.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <mesh ref={mesh} scale={3}>
        {shapeType === 0 && <torusKnotGeometry args={[1, 0.3, 128, 32]} />}
        {shapeType === 1 && <icosahedronGeometry args={[1.5, 4]} />}
        {shapeType === 2 && <torusGeometry args={[1.5, 0.5, 32, 100]} />}
        <MeshDistortMaterial 
          color={color} 
          envMapIntensity={1} 
          clearcoat={1} 
          clearcoatRoughness={0.1} 
          metalness={0.8} 
          roughness={0.2} 
          distort={distort} 
          speed={speed} 
        />
      </mesh>
    </Float>
  );
}

// Mode 3: Orbiting Orbs
function OrbitingOrbs({ seed }) {
  const group = useRef();
  
  const orbs = useMemo(() => {
    let rngSeed = seed;
    return Array.from({ length: 15 }).map(() => ({
      position: [(seededRandom(rngSeed++) - 0.5) * 15, (seededRandom(rngSeed++) - 0.5) * 15, (seededRandom(rngSeed++) - 0.5) * 15],
      scale: seededRandom(rngSeed++) * 1.5 + 0.5,
      color: new THREE.Color().setHSL(seededRandom(rngSeed++), 0.6, 0.6),
      speed: seededRandom(rngSeed++) * 2 + 0.5,
      wobble: seededRandom(rngSeed++) * 1
    }));
  }, [seed]);

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y -= delta * 0.05;
      group.current.children.forEach((child, i) => {
        child.position.y += Math.sin(state.clock.elapsedTime * orbs[i].speed) * 0.01;
      });
    }
  });

  return (
    <group ref={group}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position} scale={orb.scale}>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshWobbleMaterial 
            color={orb.color} 
            wobble={orb.wobble} 
            speed={orb.speed} 
            metalness={0.5} 
            roughness={0.2} 
            transparent 
            opacity={0.8} 
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ProceduralWorld({ route }) {
  // Use route + random offset for truly random on refresh, but stable during routing?
  // Wait, the user asked for "random every time you refresh". 
  // If we just use Math.random() once when the component mounts, it will be random every time!
  // But to keep it stable while navigating BACK to the same poem during a session, we can memoize based on route if we want.
  // Actually, let's just use the route hash combined with a session-level random seed!
  
  const sessionSeed = useMemo(() => Math.random() * 10000, []);
  
  const worldConfig = useMemo(() => {
    const routeHash = hashString(route);
    const combinedSeed = routeHash + sessionSeed;
    
    let rngSeed = combinedSeed;
    
    // Choose mode: 0 = Point Cloud, 1 = Distorted Geometry, 2 = Orbiting Orbs
    const mode = Math.floor(seededRandom(rngSeed++) * 3);
    
    return { mode, seed: rngSeed };
  }, [route, sessionSeed]);

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 20, 5]} intensity={2} color="#ffffff" />
      <directionalLight position={[-10, -20, -5]} intensity={1} color="#a3a3a3" />
      
      {worldConfig.mode === 0 && <PointCloud seed={worldConfig.seed} />}
      {worldConfig.mode === 1 && <DistortedGeometry seed={worldConfig.seed} />}
      {worldConfig.mode === 2 && <OrbitingOrbs seed={worldConfig.seed} />}
    </>
  );
}
