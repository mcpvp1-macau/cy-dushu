import { FC, useEffect } from 'react'
import { useThree } from '../hooks/useThree'
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js'
import * as THREE from 'three'

type PointCloudLayerProps = {
  url: string
}
const PointCloudLayer: FC<PointCloudLayerProps> = ({ url }) => {
  const { scene, camera, renderer, controls } = useThree((state) => state)

  const [plane, setPlane] = useState<THREE.Mesh | null>(null)

  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())

  const onClick = (event: MouseEvent) => {
    console.log('window click', event)
    mouseRef.current.set(event.clientX, event.clientY)
  }

  useEffect(() => {
    const loader = new PCDLoader()
    let pointsO: THREE.Points | null = null
    let plane: THREE.Mesh | null = null
    if (url) {
      loader.load(url, (points) => {
        pointsO = points
        scene?.add(points)
        // 计算包围盒
        const box = new THREE.Box3().setFromObject(points)
        console.log('包围盒的角点:', box, box.min, box.max)
        const center = box.getCenter(new THREE.Vector3())

        // 计算平面
        const width = box.max.x - box.min.x
        const height = box.max.y - box.min.y
        const planeGeometry = new THREE.PlaneGeometry(width, height)
        const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x222222 })
        plane = new THREE.Mesh(planeGeometry, planeMaterial)
        plane.position.set(center.x, center.y, center.z)
        scene?.add(plane)
        setPlane(plane)


        window.addEventListener('click', onClick, false)

        // 计算相机位置 - 移动到点云中心的正上方
        const boxSize = box.getSize(new THREE.Vector3())
        const maxDimension = Math.max(boxSize.x, boxSize.y, boxSize.z)
        const distance = maxDimension * 1.5 // 相机距离为最大边长的1.5倍

        // 设置相机位置在点云中心的正上方
        camera.position.set(center.x, center.y, center.z + distance)
        camera.lookAt(center)

        // 创建 OrbitControls 并设置点云中心为锚定点
        if (renderer) {
          //   const controls = new OrbitControls(camera, renderer.domElement)
          controls.target.copy(center) // 设置控制器的目标点为点云中心
          controls.enableDamping = true // 启用阻尼效果
          controls.dampingFactor = 0.05
          controls.enableZoom = true
          controls.enablePan = true
          controls.enableRotate = true
          controls.update() // 更新控制器
        }
      })
    }
    return () => {
      if (pointsO) {
        scene?.remove(pointsO)
      }
      if (plane) {
        scene?.remove(plane)
      }
    }
  }, [scene, camera, renderer, url])
  return null
}

export default PointCloudLayer
