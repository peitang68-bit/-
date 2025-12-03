import * as THREE from 'three';

// Arix Signature Palette
export const PALETTE = {
  emeraldDark: new THREE.Color('#012b22'), // Deep background
  emerald: new THREE.Color('#005c4b'),     // Tree primary
  emeraldLight: new THREE.Color('#2e8b57'), // Highlights
  pinkPastel: new THREE.Color('#ffc1cc'),   // Ornament primary
  pinkHot: new THREE.Color('#ff69b4'),      // Ornament accent
  gold: new THREE.Color('#ffd700'),         // Glow/Star
  white: new THREE.Color('#ffffff'),
  redVelvet: new THREE.Color('#8a0a1e'),    // Deep red for classic bows
  croissant: new THREE.Color('#e8b880'),    // Golden pastry
};

export const CONFIG = {
  foliageCount: 12000, // Massively increased for density
  baubleCount: 150,
  giftCount: 0,
  bowCount: 120,
  starCount: 0,
  leafCount: 400,   // Increased to fill gaps
  croissantCount: 45, 
  icicleCount: 80, 
  scatterRadius: 20, 
  treeHeight: 15, // Slightly taller
  treeRadius: 6,
  transitionDuration: 2.5,
};