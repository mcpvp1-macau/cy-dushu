import { useEffect, useRef, memo } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { useLatest } from 'ahooks'

type PropsType = {
  value: API_DBAPI.res.GetTrackQueryRes
  color?: Cesium.Color
  width?: number
}

const CallbackPath: React.FC<PropsType> = memo(({ 
  value, 
  color = Cesium.Color.RED, 
  width = 2 
}) => {
  const { viewer } = useCesium()
  const primitiveRef = useRef<Cesium.Primitive>()
  const instanceRef = useRef<Cesium.GeometryInstance>()
  const geometryRef = useRef<Cesium.PolylineGeometry>()
  
  const currentTime = useBackTrackingStore((state) => state.currentTime)
  const listRef = useLatest(value)
  const timeRef = useLatest(currentTime)
  
  // 用于跟踪上一次渲染的点数，避免不必要的更新
  const lastPointCountRef = useRef(0)
  
  // 创建和更新 Primitive
  const updatePrimitive = () => {
    if (!viewer || !viewer.scene) return
    
    // 过滤出当前时间之前的点
    const filteredPoints = listRef.current
      .filter((item) => item.acquisitionTime <= timeRef.current.valueOf())
    
    // 如果点数没变且不是第一次渲染，则不更新
    if (filteredPoints.length === lastPointCountRef.current && primitiveRef.current) {
      return
    }
    
    lastPointCountRef.current = filteredPoints.length
    
    // 如果点数少于2，无法形成线
    if (filteredPoints.length < 2) {
      if (primitiveRef.current) {
        viewer.scene.primitives.remove(primitiveRef.current)
        primitiveRef.current = undefined
      }
      return
    }
    
    // 创建位置数组
    const positions = filteredPoints.map((item) => {
      return Cesium.Cartesian3.fromDegrees(item.lng, item.lat, item.altitude || 0)
    })
    
    // 创建几何体实例
    instanceRef.current = new Cesium.GeometryInstance({
      geometry: new Cesium.PolylineGeometry({
        positions: positions,
        width: width,
        vertexFormat: Cesium.PolylineColorAppearance.VERTEX_FORMAT,
        colors: Array(positions.length).fill(color),
        colorsPerVertex: true
      }),
      id: 'callback-path'
    })
    
    // 如果已存在primitive，先移除
    if (primitiveRef.current) {
      viewer.scene.primitives.remove(primitiveRef.current)
    }
    
    // 创建新的primitive
    primitiveRef.current = new Cesium.Primitive({
      geometryInstances: instanceRef.current,
      appearance: new Cesium.PolylineColorAppearance({
        translucent: false
      }),
      asynchronous: false
    })
    
    // 添加到场景
    viewer.scene.primitives.add(primitiveRef.current)
  }
  
  // 初始化
  useEffect(() => {
    if (!viewer) return
    
    // 设置初始状态
    updatePrimitive()
    
    // 创建渲染事件监听器
    const preRenderListener = viewer.scene.preRender.addEventListener(() => {
      updatePrimitive()
    })
    
    return () => {
      // 清理
      try {
        if (primitiveRef.current && viewer?.scene) {
          attempt(() => viewer.scene.primitives.remove(primitiveRef.current!))
          primitiveRef.current = undefined
        }
      } catch (error) {
        console.error(error)
      }
      
      // 移除事件监听器
      preRenderListener()
    }
  }, [viewer])
  
  // 当值变化时重置计数器，强制更新
  useEffect(() => {
    lastPointCountRef.current = 0
  }, [value])
  
  return null
})

export default CallbackPath
