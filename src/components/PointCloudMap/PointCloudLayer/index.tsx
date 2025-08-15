import React, { useEffect, useState } from 'react'
import { PCDLoader } from 'three/examples/jsm/loaders/PCDLoader.js'
import * as THREE from 'three'
import { useThree, ThreeElements } from '@react-three/fiber'
import { shallowEquals } from 'resium'
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei'

type PropsType = {
  url: string
} & Omit<ThreeElements['mesh'], 'position'>

const PointCloudLayer: React.FC<PropsType> = ({ url, ...props }) => {
  const { scene, camera } = useThree(
    (s) => ({
      scene: s.scene,
      camera: s.camera,
    }),
    shallowEquals,
  )

  const [size, setSize] = useState<{ width: number; height: number }>({
    width: 10,
    height: 10,
  })

  const [center, setCenter] = useState<THREE.Vector3>(
    new THREE.Vector3(0, 0, 0),
  )

  useEffect(() => {
    const loader = new PCDLoader()
    let pointsO: THREE.Points | null = null
    if (url && scene && camera) {
      loader.load(url, (points) => {
        // 根据z值设置点云颜色
        const positions = points.geometry.attributes.position
        const colors = new Float32Array(positions.count * 3)
        // 创建一个新的几何体来存储过滤后的点
        const geometry = new THREE.BufferGeometry()
        const vertices: number[] = []
        // 获取z值的范围
        let minZ = Infinity
        let maxZ = -Infinity
        for (let i = 0; i < positions.count; i++) {
          const z = positions.getZ(i)
          minZ = Math.min(minZ, z)
          maxZ = Math.max(maxZ, z)
        }

        // 根据z值设置颜色
        for (let i = 0; i < positions.count; i++) {
          const z = positions.getZ(i)

          // 过滤掉z值小于0.02的点
          if (z > 0.02) {
            const normalizedZ = Math.min(z / 1, 1) // 归一化到0-1

            // 使用颜色映射：z=0绿色，z=0.5黄色，z=1红色
            let r, g, b

            if (normalizedZ <= 0.5) {
              // 0到0.5：绿色到黄色
              const t = normalizedZ * 2 // 0到1
              r = 255 * t
              g = 255
              b = 0
            } else {
              // 0.5到1：黄色到红色
              const t = (normalizedZ - 0.5) * 2 // 0到1
              r = 255
              g = 255 * (1 - t)
              b = 0
            }

            colors[i * 3] = r / 255
            colors[i * 3 + 1] = g / 255
            colors[i * 3 + 2] = b / 255
            vertices.push(positions.getX(i), positions.getY(i), z)
          }
        }
        geometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(vertices, 3),
        )
        // 设置颜色属性
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

        const material = new THREE.PointsMaterial({
          size: 0.01,
          sizeAttenuation: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexColors: true,
          depthTest: false,
        })

        // points.material = material
        pointsO = new THREE.Points(geometry, material)

        scene?.add(pointsO)
        // 计算包围盒
        const box = new THREE.Box3().setFromObject(points)
        const center = box.getCenter(new THREE.Vector3())
        setCenter(center)
        // 计算平面
        const width = box.max.x - box.min.x
        const height = box.max.y - box.min.y
        setSize({ width, height })

        // 计算相机位置 - 移动到点云中心的正上方
        const boxSize = box.getSize(new THREE.Vector3())
        const maxDimension = Math.max(boxSize.x, boxSize.y, boxSize.z)
        const distance = maxDimension * 1.5 // 相机距离为最大边长的1.5倍

        // 设置相机位置在点云中心的正上方
        camera.up.set(0, 0, 1)
        camera.position.set(center.x, center.y, center.z + distance)
        camera.lookAt(center)
      })
    }
    return () => {
      if (pointsO) {
        scene?.remove(pointsO)
      }
    }
  }, [scene, camera, url])

  return (
    <>
      <mesh {...props} position={[center.x, center.y, 0]}>
        <planeGeometry args={[size.width, size.height]} />
        <meshBasicMaterial color={0x000000} transparent opacity={0.2} />
      </mesh>
      <gridHelper
        args={[size.width, size.height]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[center.x, center.y, 0]}
      />
      <OrbitControls
        target={center}
        mouseButtons={{
          LEFT: THREE.MOUSE.RIGHT,
          MIDDLE: THREE.MOUSE.MIDDLE,
          RIGHT: THREE.MOUSE.LEFT,
        }}
        enableDamping={false}
      />
      <GizmoHelper alignment="bottom-right" margin={[100, 100]} >
        <GizmoViewport labelColor="white" axisHeadScale={1} />
      </GizmoHelper>
    </>
  )
}

export default PointCloudLayer
