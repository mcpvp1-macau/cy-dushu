import { useSize } from 'ahooks'
import { FC, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { ThreeContext } from '../hooks/useThree'
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

/** 点云地图 */
const PointCloudMap: FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null)
  const [scene, setScene] = useState<THREE.Scene | null>(null)
  const [camera, setCamera] = useState<THREE.Camera | null>(null)
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null)
  const [controls, setControls] = useState<OrbitControls | null>(null)
  const size = useSize(ref)

  useEffect(() => {
    if (ref.current) {
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      )
      const renderer = new THREE.WebGLRenderer()
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(window.innerWidth, window.innerHeight)
      ref.current.appendChild(renderer.domElement)
      //   renderer.render(scene, camera)
      setScene(scene)
      setCamera(camera)
      setRenderer(renderer)

      // 背景
      scene.background = new THREE.Color(0x000000)

      // 灯光
      const light = new THREE.SpotLight(0xffffff, 1)
      light.position.set(-4, 4, -4)
      scene.add(light)

      // 相机
      camera.position.set(0, 0, 10)
      camera.lookAt(0, 0, 0)

      //   const geometry = new THREE.BoxGeometry(1, 1, 1)
      //   // 创建材质
      //   const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
      //   // 创建网络
      //   const cube = new THREE.Mesh(geometry, material)
      //   // 网络添加到场景
      //   scene.add(cube)

      const controls = new OrbitControls(camera, renderer.domElement)
      setControls(controls)
      controls.enableDamping = true

      // 渲染
      renderer.render(scene, camera)
      const animate = () => {
        requestAnimationFrame(animate)
        renderer.render(scene, camera)
      }
      animate()
      return () => {
        ref.current?.removeChild(renderer.domElement)
        controls.dispose()
        renderer.dispose()

        // scene.dispose()
        // camera.dispose()
      }
    }
  }, [])
  useEffect(() => {
    if (size?.width && size?.height && ref.current && camera && renderer) {
      renderer.setSize(size.width, size.height, true)
      renderer.setPixelRatio(window.devicePixelRatio)
      // @ts-ignore
      camera.aspect = size.width / size.height
      // @ts-ignore
      camera.updateProjectionMatrix()
    }
  }, [size])
  return (
    <ThreeContext.Provider value={{ scene, camera, renderer, controls }}>
      <div className="h-full w-full" ref={ref}>
        {children}
      </div>
    </ThreeContext.Provider>
  )
}

PointCloudMap.displayName = 'PointCloudMap'

export default PointCloudMap
