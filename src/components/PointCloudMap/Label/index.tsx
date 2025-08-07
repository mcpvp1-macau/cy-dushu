import { FC, useEffect, useRef } from 'react'
import { useThree } from '../hooks/useThree'
import * as THREE from 'three'

type PropsType = {
  position: { x: number; y: number; z: number }
  text: string
  color?: string
  size?: number
  offset?: { x: number; y: number; z: number }
}

const Label: FC<PropsType> = ({ position, text, color, size = 0.7, offset = { x: 0, y: 0, z: 0 } }) => {
  const { scene, camera, renderer } = useThree((s) => s)
  const labelRef = useRef<THREE.Sprite | null>(null)
  useEffect(() => {
    if (!scene) return
    if (!camera) return
    if (!renderer) return
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 200
    const context = canvas.getContext('2d')
    if (!context) return
    context.font = 'Bold 48px Arial'
    context.fillStyle = color || '#FFFFFF' // 设置文本颜色
    context.fillText(text, 0, 100) // 在画布上绘制文本

    // 加载图片纹理
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(canvas.toDataURL())

    // 创建精灵对象
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      sizeAttenuation: false,
      depthTest: false,
    })
    const sprite = new THREE.Sprite(spriteMaterial)
    sprite.scale.set(0.3 * size, 0.2 * size, 0.2 * size)
    // sprite.position.set(position.x, position.y, position.z)

    // 添加精灵对象到场景中
    scene.add(sprite)
    labelRef.current = sprite
    return () => {
      scene.remove(sprite)
    }
  }, [scene, camera, renderer])

  useEffect(() => {
    if (!labelRef.current) return
    labelRef.current.position.set(position.x, position.y, position.z)
  }, [position])

  useEffect(() => {
    if (!labelRef.current) return
    labelRef.current.scale.set(0.3 * size, 0.2 * size, 0.2 * size)
  }, [size])

  useEffect(() => {
    if (!labelRef.current) return
    console.log('text2', text)
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 200
    const context = canvas.getContext('2d')
    if (!context) return
    context.font = 'Bold 48px Arial'
    context.fillStyle = color || '#FFFFFF' // 设置文本颜色
    context.fillText(text, 0 + offset.x, 100 + offset.y) // 在画布上绘制文本

    // 加载图片纹理
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(canvas.toDataURL())

    // 创建精灵对象
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      color: 0xffffff,
      sizeAttenuation: false,
      depthTest: false,
    })
    labelRef.current.material = spriteMaterial
  }, [text, offset])

  return null
}

export default Label
