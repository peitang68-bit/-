import * as THREE from 'three';

export enum TreeState {
  SCATTERED = 'SCATTERED',
  TREE_SHAPE = 'TREE_SHAPE',
}

export interface DualPosition {
  scatterPos: THREE.Vector3;
  treePos: THREE.Vector3;
  rotation: THREE.Euler;
  scale: number;
  color: THREE.Color;
  speed: number; // For floating animation
  phase: number; // For offset animation
}

export interface OrnamentProps {
  mode: TreeState;
  count: number;
}
