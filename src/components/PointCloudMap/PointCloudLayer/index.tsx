import { FC, useEffect, useRef } from 'react'
import { useThree } from '../hooks/useThree'
import { PCDLoader } from 'three/addons/loaders/PCDLoader.js'
import * as THREE from 'three'
import { useLatest } from 'ahooks'

type PointCloudLayerProps = {
  url: string
  onClick: (point: THREE.Vector3) => void
}
/** 点云图层 */
const PointCloudLayer: FC<PointCloudLayerProps> = ({ url, onClick }) => {
  const { scene, camera, renderer, controls } = useThree((state) => state)

  // const [plane, setPlane] = useState<THREE.Mesh | null>(null)
  const planeRef = useRef<THREE.Mesh | null>(null)
  const clickRef = useLatest(onClick)

  const handleClick = (event: MouseEvent) => {
    const raycaster = new THREE.Raycaster()
    // 鼠标控制对象
    const mouse = new THREE.Vector2()
    // 得到鼠标相对于容器的坐标
    mouse.x = (event.offsetX / renderer!.domElement.clientWidth) * 2 - 1
    mouse.y = -(event.offsetY / renderer!.domElement.clientHeight) * 2 + 1
    // 执行射线检测
    raycaster.setFromCamera(mouse, camera)
    if (planeRef.current) {
      // 判断指定的对象中哪些被该光线照射到了，在arrGroup中筛选
      const intersects = raycaster.intersectObjects([planeRef.current])
      // const intersects = raycaster.intersectObjects(scene.children)
      // 射线涉及到的物体集合
      if (intersects.length > 0) {
        const point = intersects[0].point
        clickRef.current(point)
      }
    }
  }

  useEffect(() => {
    const loader = new PCDLoader()
    let pointsO: THREE.Points | null = null
    let plane: THREE.Mesh | null = null
    let helper: THREE.GridHelper | null = null
    if (url && scene && camera && renderer) {
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

        // 计算平面
        const width = box.max.x - box.min.x
        const height = box.max.y - box.min.y
        const planeGeometry = new THREE.PlaneGeometry(width, height)
        const planeMaterial = new THREE.ShadowMaterial({
          color: 0x000000,
          opacity: 0.2,
        })

        plane = new THREE.Mesh(planeGeometry, planeMaterial)
        plane.receiveShadow = true
        plane.position.set(center.x, center.y, 0.0)
        scene?.add(plane)
        // setPlane(plane)
        planeRef.current = plane

        helper = new THREE.GridHelper(width, height)
        helper.position.set(center.x, center.y, 0.0)
        helper.rotation.x = -Math.PI / 2
        helper.material.opacity = 0.5
        // helper.material.transparent = true
        scene.add(helper)

        renderer?.domElement.addEventListener('click', handleClick)

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
      renderer?.domElement.removeEventListener('click', handleClick)
      if (pointsO) {
        scene?.remove(pointsO)
      }
      if (plane) {
        scene?.remove(plane)
      }
      if (helper) {
        scene?.remove(helper)
      }
    }
  }, [scene, camera, renderer, url])
  return null
}

export default PointCloudLayer
