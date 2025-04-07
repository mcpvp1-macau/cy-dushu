import { useCesium } from 'resium'
import { attempt } from 'lodash'
import { useEffect, useRef } from 'react'
import * as Cesium from 'cesium'

const useFly = (curAttr) => {
  const { viewer } = useCesium()
  const flyedRef = useRef(false)

  useEffect(() => {
    try {
      if (curAttr) {
        if (viewer && curAttr?.longitude && curAttr?.latitude) {
          if (!viewer?.camera) {
            return
          }
          if (flyedRef.current) {
            return
          }
          const cameraHeight = curAttr.altitude ? curAttr.altitude + 800 : Math.round(viewer?.camera?.positionCartographic?.height) || 0
          let targetHeight = cameraHeight
          if (cameraHeight > (globalConfig?.disableZoomHeight || 2000)) {
            targetHeight = (curAttr.altitude || 0) + 500
          }

          const destination = Cesium.Cartesian3.fromDegrees(
            curAttr.longitude,
            curAttr.latitude,
            targetHeight,
          )
          attempt(() => {
            viewer.camera?.flyTo({
              destination, //相机飞入点
              duration: 0.8,
            })
            flyedRef.current = true
          })
        }
      }
    } catch (error) {}
  }, [curAttr])
}

export default useFly
