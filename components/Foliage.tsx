import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeState } from '../types';
import { CONFIG, PALETTE } from '../constants';
import { getTreePosition, getScatterPosition } from '../utils/math';

// Custom shader for magical needles
const FoliageMaterial = {
  uniforms: {
    uTime: { value: 0 },
    uMix: { value: 0 }, // 0 = Scatter, 1 = Tree
    uColor1: { value: PALETTE.emerald },
    uColor2: { value: PALETTE.gold },
    uPixelRatio: { value: 1 },
  },
  vertexShader: `
    attribute vec3 scatterPos;
    attribute vec3 treePos;
    attribute float size;
    attribute float speed;
    
    uniform float uMix;
    uniform float uTime;
    uniform float uPixelRatio;

    varying vec3 vColor;
    varying float vAlpha;

    // Cubic ease in-out
    float ease(float t) {
      return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
    }

    void main() {
      float t = ease(uMix);
      
      // Interpolate position
      vec3 pos = mix(scatterPos, treePos, t);
      
      // Add breathing motion
      float breathe = sin(uTime * speed + treePos.y) * 0.1;
      pos += normalize(pos) * breathe * (1.0 - t * 0.5); // Breathe more when scattered

      // Add gentle rotation when scattered
      if (t < 0.9) {
         float angle = uTime * 0.1 * speed;
         float s = sin(angle);
         float c = cos(angle);
         // Rotate around Y
         pos.x = pos.x * c - pos.z * s;
         pos.z = pos.x * s + pos.z * c;
      }

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Size attenuation
      // Reduced base size multiplier slightly for higher density
      gl_PointSize = size * uPixelRatio * (18.0 / -mvPosition.z);
      
      // Sparkle fade in/out
      vAlpha = 0.5 + 0.5 * sin(uTime * 3.0 + speed * 10.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    
    varying float vAlpha;

    void main() {
      // Circular particle
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      // Soft edge
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 2.0);

      // Color gradient
      vec3 color = mix(uColor1, uColor2, strength * 0.3);
      
      gl_FragColor = vec4(color, vAlpha * strength);
    }
  `
};

interface FoliageProps {
  mode: TreeState;
}

const Foliage: React.FC<FoliageProps> = ({ mode }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Generate particles once
  const { positions, scatterPositions, sizes, speeds } = useMemo(() => {
    const count = CONFIG.foliageCount;
    const positions = new Float32Array(count * 3);
    const scatterPositions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const speeds = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Tree Shape
      const treePos = getTreePosition(i / count, 0.6);
      positions[i * 3] = treePos.x;
      positions[i * 3 + 1] = treePos.y;
      positions[i * 3 + 2] = treePos.z;

      // Scatter Shape
      const scatterPos = getScatterPosition(CONFIG.scatterRadius * 1.2);
      scatterPositions[i * 3] = scatterPos.x;
      scatterPositions[i * 3 + 1] = scatterPos.y;
      scatterPositions[i * 3 + 2] = scatterPos.z;

      // Attributes
      sizes[i] = Math.random() * 3 + 1;
      speeds[i] = Math.random() * 0.5 + 0.5;
    }

    return { positions, scatterPositions, sizes, speeds };
  }, []);

  // Animation Loop
  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uPixelRatio.value = state.viewport.dpr;
      
      // Smooth transition logic
      const targetMix = mode === TreeState.TREE_SHAPE ? 1 : 0;
      const currentMix = materialRef.current.uniforms.uMix.value;
      
      // Lerp mix factor
      const step = delta / CONFIG.transitionDuration;
      if (Math.abs(currentMix - targetMix) > 0.001) {
          materialRef.current.uniforms.uMix.value = THREE.MathUtils.lerp(currentMix, targetMix, step * 2); 
      }
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={CONFIG.foliageCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-treePos"
          count={CONFIG.foliageCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-scatterPos"
          count={CONFIG.foliageCount}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={CONFIG.foliageCount}
          array={sizes}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-speed"
          count={CONFIG.foliageCount}
          array={speeds}
          itemSize={1}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        args={[FoliageMaterial]}
      />
    </points>
  );
};

export default Foliage;