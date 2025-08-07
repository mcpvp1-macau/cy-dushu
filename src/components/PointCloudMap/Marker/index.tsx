import { FC, useEffect, useRef } from 'react'
import { useThree } from '../hooks/useThree'
import * as THREE from 'three'
import { useLatest } from 'ahooks'

type PropsType = {
  position: { x: number; y: number; z: number }
  image: string
  onClick: (point: THREE.Vector3) => void
}

/** 图标标记 */
const Marker: FC<PropsType> = ({ position, image, onClick }) => {
  const { scene, renderer, camera } = useThree((s) => s)
  const markerRef = useRef<THREE.Sprite | null>(null)
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
    if (markerRef.current) {
      // 判断指定的对象中哪些被该光线照射到了，在arrGroup中筛选
      const intersects = raycaster.intersectObjects([markerRef.current])
      // const intersects = raycaster.intersectObjects(scene.children)
      // 射线涉及到的物体集合
      if (intersects.length > 0) {
        const point = intersects[0].point
        clickRef.current(point)
      }
    }
  }

  useEffect(() => {
    if (!image) return
    if (!scene) return
    if (!renderer) return
    if (!camera) return

    // 加载图片纹理
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(image)

    // 创建精灵对象
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      sizeAttenuation: false,
      depthTest: false,
    })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(0.05, 0.05, 0.05)
    // sprite.position.set(position.x, position.y, position.z)

    // 添加精灵对象到场景中
    scene.add(sprite)

    markerRef.current = sprite

    renderer?.domElement.addEventListener('click', handleClick)
    return () => {
      scene.remove(sprite)
      renderer?.domElement.removeEventListener('click', handleClick)
    }
  }, [scene, renderer, camera])

  useEffect(() => {
    if (!markerRef.current) return
    // 加载图片纹理
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(image)
    markerRef.current.material.map = texture
    markerRef.current.scale.set(0.05, 0.05, 0.05)
  }, [image])

  useEffect(() => {
    if (!scene) return
    if (!renderer) return
    if (!camera) return
    if (!markerRef.current) return

    markerRef.current?.position.set(position.x, position.y, position.z)
  }, [position])

  return null
}

export default Marker
