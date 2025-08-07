import { createContext, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
export type ThreeState = {
  scene: THREE.Scene | null
  camera: THREE.Camera | null
  renderer: THREE.WebGLRenderer | null
  controls: OrbitControls | null
}
const initialState: ThreeState = {
  scene: null,
  camera: null,
  renderer: null,
  controls: null,
}
export const ThreeContext = createContext<ThreeState | null>(initialState)

export const useThree = <T>(select: (state: any) => T) => {
  const store = useContext(ThreeContext)!
  return select(store)
}
