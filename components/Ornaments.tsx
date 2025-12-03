import React, { useRef, useMemo, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState, DualPosition } from '../types';
import { CONFIG, PALETTE } from '../constants';
import { getTreePosition, getScatterPosition } from '../utils/math';

interface InstanceGroupProps {
  mode: TreeState;
  type: 'bauble' | 'gift' | 'bow' | 'star' | 'croissant' | 'icicle' | 'leaf';
  count: number;
}

const dummy = new THREE.Object3D();
const _color = new THREE.Color();

const OrnamentGroup: React.FC<InstanceGroupProps> = ({ mode, type, count }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Calculate Dual Data
  const data = useMemo<DualPosition[]>(() => {
    return new Array(count).fill(0).map((_, i) => {
      // Tree Position Distribution
      let normalizedH = i / count;

      // Custom distribution logic per type
      if (type === 'bow') {
         normalizedH = Math.pow(Math.random(), 0.8);
      } else if (type === 'croissant') {
         normalizedH = Math.random() * 0.8 + 0.1; 
      } else if (type === 'icicle') {
         normalizedH = Math.random(); 
      } else if (type === 'leaf') {
         normalizedH = Math.random(); // Leaves everywhere
      }
      
      const treePos = getTreePosition(normalizedH, type === 'leaf' ? 0.4 : 0.2);
      
      // Radius adjustments
      if (type === 'bow') treePos.multiplyScalar(1.05); 
      if (type === 'croissant') treePos.multiplyScalar(1.05);
      if (type === 'icicle') treePos.multiplyScalar(1.02); 
      if (type === 'leaf') treePos.multiplyScalar(0.95); // Inside the volume slightly

      const scatterPos = getScatterPosition(CONFIG.scatterRadius);
      
      let scale = 1;
      if (type === 'bauble') scale = Math.random() * 0.3 + 0.2;
      else if (type === 'bow') scale = Math.random() * 0.3 + 0.3;
      else if (type === 'croissant') scale = Math.random() * 0.3 + 0.3;
      else if (type === 'icicle') scale = Math.random() * 0.4 + 0.6;
      else if (type === 'leaf') scale = Math.random() * 0.4 + 0.3;

      // Colors - Heavily favoring Pink as requested
      let color;
      if (type === 'bow') {
         // Mostly pinks, rare red
         const r = Math.random();
         if (r > 0.3) color = PALETTE.pinkHot;
         else if (r > 0.1) color = PALETTE.pinkPastel;
         else color = PALETTE.redVelvet;
      } else if (type === 'croissant') {
         color = PALETTE.croissant;
      } else if (type === 'icicle') {
         color = PALETTE.white;
      } else if (type === 'leaf') {
         // Green leaves
         color = Math.random() > 0.5 ? PALETTE.emerald : PALETTE.emeraldLight;
      } else if (type === 'bauble') {
         // Pure pinks for baubles now
         color = Math.random() > 0.5 ? PALETTE.pinkPastel : PALETTE.pinkHot;
      } else {
         color = PALETTE.white;
      }

      return {
        treePos,
        scatterPos,
        rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI),
        scale,
        color,
        speed: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2
      };
    });
  }, [count, type]);

  // Initial Layout
  useLayoutEffect(() => {
    if (!meshRef.current) return;
    data.forEach((d, i) => {
      _color.set(d.color);
      meshRef.current!.setColorAt(i, _color);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor!.needsUpdate = true;
  }, [data]);

  // Animation Loop
  const mixRef = useRef(0);
  
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    const targetMix = mode === TreeState.TREE_SHAPE ? 1 : 0;
    const diff = targetMix - mixRef.current;
    mixRef.current += diff * (delta * 2.0);

    const t = mixRef.current;
    const time = state.clock.elapsedTime;

    data.forEach((d, i) => {
        // Position
        const p = new THREE.Vector3().lerpVectors(d.scatterPos, d.treePos, t);
        
        // Float Noise
        const floatStrength = (1 - t) * 1.5 + 0.1;
        p.y += Math.sin(time * d.speed + d.phase) * floatStrength;
        p.x += Math.cos(time * d.speed * 0.5) * floatStrength * 0.5;

        // Rotation logic
        const rotX = d.rotation.x + (1-t) * time * 0.5;
        const rotY = d.rotation.y + (1-t) * time * 0.3;
        
        dummy.position.copy(p);
        
        // Orientation Adjustment for Tree Shape
        if (t > 0.8) {
           if (type === 'leaf') {
             // Leaves point out and up
             dummy.lookAt(0, p.y + 2, 0); 
             dummy.rotateX(-Math.PI / 2); 
           } else if (type === 'croissant') {
              dummy.lookAt(0, p.y, 0);
              dummy.rotateY(Math.PI / 2); 
              dummy.rotateX(Math.PI / 4);
           } else if (type === 'icicle') {
             dummy.lookAt(0, p.y, 0);
             dummy.rotateY(Math.PI); 
             dummy.rotateX(-Math.PI / 2);
           } else {
             // Baubles and Bows face out broadly or retain some random spin
             dummy.lookAt(0, p.y, 0);
             dummy.rotation.set(rotX * 0.1, dummy.rotation.y + Math.PI, 0); // Slight wobble
           }
        } else {
           dummy.rotation.set(rotX, rotY, d.rotation.z);
        }
        
        // Scale Pop
        const scale = d.scale * (0.8 + 0.2 * Math.sin(time * 2 + i));
        dummy.scale.setScalar(scale);
        
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Geometry selection
  const geometry = useMemo(() => {
    if (type === 'bauble') return <sphereGeometry args={[1, 32, 32]} />;
    if (type === 'bow') return <torusKnotGeometry args={[0.6, 0.2, 64, 8, 2, 3]} />;
    if (type === 'croissant') return <torusGeometry args={[0.6, 0.25, 12, 24, 3.5]} />;
    if (type === 'icicle') return <cylinderGeometry args={[0.02, 0.05, 2.5, 6]} />; 
    if (type === 'leaf') return <coneGeometry args={[0.4, 1.2, 3]} />; // Triangular leaf shape
    return <sphereGeometry />;
  }, [type]);

  // Material properties
  const materialProps = useMemo(() => {
    if (type === 'bauble') return { roughness: 0.1, metalness: 0.8, emissiveIntensity: 0.2 };
    if (type === 'bow') return { roughness: 0.8, metalness: 0.2, emissiveIntensity: 0.1 };
    if (type === 'croissant') return { roughness: 0.6, metalness: 0.0, emissiveIntensity: 0.0 };
    if (type === 'icicle') return { roughness: 0.1, metalness: 0.9, emissiveIntensity: 0.5 };
    if (type === 'leaf') return { roughness: 0.7, metalness: 0.1, emissiveIntensity: 0.0, flatShading: true };
    return {};
  }, [type]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count]}
      castShadow
      receiveShadow
    >
      {geometry}
      <meshStandardMaterial
        {...materialProps}
        emissive={type === 'icicle' ? new THREE.Color('#88ffff') : (type === 'bauble' ? PALETTE.pinkPastel : 0x000000)}
      />
    </instancedMesh>
  );
};

export default OrnamentGroup;