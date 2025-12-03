import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';

import Foliage from './Foliage';
import OrnamentGroup from './Ornaments';
import Environment from './Environment';
import PostProcessing from './PostProcessing';
import { TreeState } from '../types';
import { CONFIG, PALETTE } from '../constants';
import { getScatterPosition } from '../utils/math';

interface ExperienceProps {
  mode: TreeState;
}

const RotatingGroup: React.FC<{ children: React.ReactNode; mode: TreeState }> = ({ children, mode }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotate faster when forming tree, float when scattered
      const rotationSpeed = mode === TreeState.TREE_SHAPE ? 0.2 : 0.05;
      groupRef.current.rotation.y += delta * rotationSpeed;
    }
  });

  return <group ref={groupRef}>{children}</group>;
};

// --- New Component: The Grand Star Topper ---
const TreeTopper: React.FC<{ mode: TreeState }> = ({ mode }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Positions
  const treePos = useMemo(() => new THREE.Vector3(0, CONFIG.treeHeight / 2 + 0.5, 0), []);
  const scatterPos = useMemo(() => getScatterPosition(CONFIG.scatterRadius), []);
  
  // Animation state
  const mixRef = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Lerp Mix Factor
    const targetMix = mode === TreeState.TREE_SHAPE ? 1 : 0;
    const diff = targetMix - mixRef.current;
    mixRef.current += diff * (delta * 1.5); // Move slightly slower/faster than others
    const t = mixRef.current;
    
    // Position Interpolation
    groupRef.current.position.lerpVectors(scatterPos, treePos, t);
    
    // Rotation logic
    // When scattered: tumble randomly
    // When tree: spin slowly on Y axis
    const time = state.clock.elapsedTime;
    if (t < 0.8) {
        groupRef.current.rotation.x = time * 0.5;
        groupRef.current.rotation.z = time * 0.3;
    } else {
        // Correct upright orientation + gentle spin
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 2);
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 2);
        groupRef.current.rotation.y += delta * 0.5;
    }

    // Scale pulse
    const scale = 1.0 + Math.sin(time * 3) * 0.1;
    groupRef.current.scale.setScalar(scale);
  });

  return (
    <group ref={groupRef}>
        {/* Main Star Body */}
        <mesh>
            <octahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial 
                color={PALETTE.gold} 
                emissive={PALETTE.gold}
                emissiveIntensity={2}
                roughness={0.2}
                metalness={1}
            />
        </mesh>
        {/* Rays/Spikes */}
        <mesh rotation={[0, 0, Math.PI / 4]} scale={1.5}>
            <octahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial 
                color={PALETTE.white} 
                emissive={PALETTE.white}
                emissiveIntensity={1}
                transparent
                opacity={0.8}
            />
        </mesh>
        {/* Glow halo */}
        <pointLight intensity={50} distance={10} color={PALETTE.gold} decay={2} />
    </group>
  );
};

const Experience: React.FC<ExperienceProps> = ({ mode }) => {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ 
        antialias: false, 
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.2,
        alpha: false 
      }}
    >
      <color attach="background" args={['#000806']} />
      
      <PerspectiveCamera makeDefault position={[0, 2, 28]} fov={45} />
      <OrbitControls 
        enablePan={false} 
        minPolarAngle={Math.PI / 4} 
        maxPolarAngle={Math.PI / 1.8}
        minDistance={10}
        maxDistance={50}
        enableZoom={true}
        autoRotate={mode === TreeState.TREE_SHAPE}
        autoRotateSpeed={0.5}
      />

      <Environment />

      <RotatingGroup mode={mode}>
        <Foliage mode={mode} />
        <TreeTopper mode={mode} />
        <OrnamentGroup mode={mode} type="bauble" count={CONFIG.baubleCount} />
        <OrnamentGroup mode={mode} type="bow" count={CONFIG.bowCount} />
        <OrnamentGroup mode={mode} type="croissant" count={CONFIG.croissantCount} />
        <OrnamentGroup mode={mode} type="icicle" count={CONFIG.icicleCount} />
        <OrnamentGroup mode={mode} type="leaf" count={CONFIG.leafCount} />
      </RotatingGroup>

      <PostProcessing />
    </Canvas>
  );
};

export default Experience;