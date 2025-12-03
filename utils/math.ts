import * as THREE from 'three';
import { CONFIG } from '../constants';

/**
 * Returns a position on a cone surface (Christmas Tree shape)
 * Updated to have volumetric thickness so the tree isn't empty inside.
 */
export const getTreePosition = (normalizedIndex: number, jitter = 0.5): THREE.Vector3 => {
  // Spiral distribution
  const y = normalizedIndex * CONFIG.treeHeight - (CONFIG.treeHeight / 2);
  
  // Radius calculation
  const maxRadiusAtHeight = ((CONFIG.treeHeight / 2 - y) / CONFIG.treeHeight) * CONFIG.treeRadius;
  
  // Volumetric logic: 
  // We want most points on the surface, but some inside to create density.
  // Math.sqrt(Math.random()) gives uniform distribution in a circle, 
  // but we want a "shell" with thickness.
  const thickness = 0.6; // 0 = empty shell, 1 = solid cone
  const radiusScale = 1.0 - (Math.random() * thickness * Math.random()); // Biased towards outer edge
  const r = maxRadiusAtHeight * radiusScale;
  
  // Tighter spiral for denser look
  // Golden angle * higher multiplier
  const theta = normalizedIndex * Math.PI * 2 * 35; 
  
  const x = Math.cos(theta) * r;
  const z = Math.sin(theta) * r;

  return new THREE.Vector3(
    x + (Math.random() - 0.5) * jitter,
    y + (Math.random() - 0.5) * jitter,
    z + (Math.random() - 0.5) * jitter
  );
};

/**
 * Returns a random position inside a sphere (Scattered shape)
 */
export const getScatterPosition = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  
  const sinPhi = Math.sin(phi);
  const x = r * sinPhi * Math.cos(theta);
  const y = r * sinPhi * Math.sin(theta);
  const z = r * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};