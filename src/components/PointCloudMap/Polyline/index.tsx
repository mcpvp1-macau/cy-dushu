import { FC, useEffect, useRef } from 'react'
import { useThree } from '../hooks/useThree'
import * as THREE from 'three'

type PropsType = {
  positions: { x: number; y: number; z: number }[]
  color: string
}

const Polyline: FC<PropsType> = ({ positions, color = '#000000' }) => {
  const { scene } = useThree((s) => s)
  const polylineRef = useRef<THREE.Line | null>(null)

  useEffect(() => {
    if (!scene) return
    // 创建线条的顶点
    const points: THREE.Vector3[] = []
    positions.forEach((position) => {
      points.push(new THREE.Vector3(position.x, position.y, position.z))
    })
    // 创建几何体
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    // 创建线条材质
    const material = new THREE.LineBasicMaterial({ color: color })
    // 创建线条对象
    const line = new THREE.Line(geometry, material)
    // 将线条添加到场景中
    scene.add(line)
    polylineRef.current = line
    return () => {
      scene.remove(line)
      polylineRef.current = null
    }
  }, [scene])

  // 更新线条的顶点
  useEffect(() => {
    if (!polylineRef.current) return
    const points: THREE.Vector3[] = []
    positions.forEach((position) => {
      points.push(new THREE.Vector3(position.x, position.y, position.z))
    })
    polylineRef.current.geometry.setFromPoints(points)
  }, [positions])

  // 更新线条的颜色
  useEffect(() => {
    if (!polylineRef.current) return
    const material = new THREE.LineBasicMaterial({ color })
    polylineRef.current.material = material
  }, [color])

  return null
}

export default Polyline
