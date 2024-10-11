import { useCesium } from 'resium'
import { useLatest } from 'ahooks'
import { useEffect, useRef } from 'react'
import * as Cesium from 'cesium'

import takeOffCursor from '@/assets/imgs/takeoff-cur.svg'
import addPointCursor from '@/assets/imgs/add-point.svg'
import mitt from 'mitt'
import { useShallow } from 'zustand/react/shallow'
import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'

export const emiter = mitt()

/** 开启鼠标样式 */
export const useMouseStyle = (open: boolean = true) => {
  const config = useAirlineConfigStore(
    useShallow((s) => ({
      isDrawHome: s.isDrawHome,
      isDrawPoint: s.isDrawPoint,
    })),
  )
  const currentIndex = useAirlineConfigStore((s) => s.currentIndex)

  const configRef = useLatest(config)
  const currentIndexRef = useLatest(currentIndex)

  const { viewer } = useCesium()
  const moveRef = useRef(false)
  useEffect(() => {
    if (!viewer?.scene || !open) return

    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    emiter.on('move', (e: any) => {
      moveRef.current = e
    })

    handler.setInputAction((e: Cesium.ScreenSpaceEventHandler.MotionEvent) => {
      if (configRef.current.isDrawHome) {
        viewer.scene.canvas.style.cursor = `url(${takeOffCursor}) 0 0, auto`
        return
      }
      if (configRef.current.isDrawPoint) {
        viewer.scene.canvas.style.cursor = `url(${addPointCursor}) 10 10, auto`
        return
      }

      if (moveRef.current) {
        viewer.scene.canvas.style.cursor = 'move'
        return
      }

      const pickedObject = viewer.scene.pick(e.endPosition)

      if (!pickedObject || !pickedObject.id || !pickedObject.id.properties) {
        viewer.scene.canvas.style.cursor = 'default'
        return
      }
      // 判断实体为起飞点
      if (
        'takeoff' ===
        pickedObject.id.properties.xtype?.getValue(Cesium.JulianDate.now())
      ) {
        viewer.scene.canvas.style.cursor = 'move'
        return
      }
      // 判断实体为航点
      if (
        'airpoint' ===
        pickedObject.id.properties.xtype?.getValue(Cesium.JulianDate.now())
      ) {
        // 判断是否为当前选中的航点
        if (
          currentIndexRef.current ===
          pickedObject.id.properties.point?.getValue(Cesium.JulianDate.now())
            ?.positionIndex
        ) {
          viewer.scene.canvas.style.cursor = 'move'
          return
        }
      }
      viewer.scene.canvas.style.cursor = 'default'
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    return () => {
      emiter.off('move')
      try {
        handler.destroy()
        viewer.scene.canvas.style.cursor = 'default'
      } catch (error) {}
    }
  }, [open])
}
