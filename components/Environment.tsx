import React from 'react';
import { Environment as DreiEnv, Sparkles, Stars, Lightformer } from '@react-three/drei';
import { PALETTE } from '../constants';
import * as THREE from 'three';

const Environment: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.2} color={PALETTE.emeraldDark} />
      <pointLight position={[10, 20, 10]} intensity={200} color={PALETTE.pinkPastel} castShadow />
      <pointLight position={[-10, 5, -10]} intensity={100} color={PALETTE.gold} />
      <spotLight 
        position={[0, 30, 0]} 
        angle={0.5} 
        penumbra={1} 
        intensity={300} 
        color={PALETTE.white} 
        castShadow 
      />
      
      {/* Background Magic */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Sparkles 
        count={200} 
        scale={20} 
        size={4} 
        speed={0.4} 
        opacity={0.5} 
        color={PALETTE.gold}
      />
      
      {/* Reflection Env - Procedural to avoid external asset fetch errors */}
      <DreiEnv resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, -1, -1]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={8} />
          <Lightformer form="ring" color={PALETTE.emeraldLight} intensity={5} scale={5} position={[0, 10, 0]} />
        </group>
      </DreiEnv>
      
      {/* Floor reflection for grounding */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -8, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial 
          color={0x000000} 
          roughness={0.1} 
          metalness={0.8} 
          transparent 
          opacity={0.5} 
        />
      </mesh>
    </>
  );
};

export default Environment;