import { cellToBoundary } from 'h3-js'
import { memo, useEffect, useMemo, useState, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import { Math as CesiumMath } from 'cesium'
import { attempt, flatten } from 'lodash'
import SignalBoardMarkers from './boards'
import { useLatest } from 'ahooks'
import useLockCameraPitch from '@/hooks/cesium/useLockCameraPitch'
import useWirelessSituationStore from '@/store/map/useSignalLayer.store'

type PropsType = unknown

const colorMap = [
  '#360505',
  '#b91c1c',
  '#F29D49',
  '#eab308',
  '#80D177',
  '#15B371',
]

const addH3 = (viewer: Cesium.Viewer, data: any[]) => {
  const pris = data.map((data) => {
    let h3Code, heavy
    if ('E' in data) {
      const res = data.E.split(',')
      h3Code = res[0]
      heavy = res[1]
    } else {
      h3Code = data.h3Code
      heavy = data.quality
    }
    const hexBoundary = cellToBoundary(h3Code)
    const p = flatten(hexBoundary.map((item) => [item[1], item[0]]))
    p.push(p[0], p[1])
    const positions = Cesium.Cartesian3.fromDegreesArray(p)

    // 创建多边形几何实例
    const instance1 = new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(positions),
        extrudedHeight: 1,
      }),

      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString(
            colorMap[Math.ceil(heavy)] ?? '#f00',
          ).withAlpha(0.25),
        ),
      },
    })

    // 创建边界线几何实例
    const instance2 = new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonOutlineGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(positions),
      }),

      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString(colorMap[Math.ceil(heavy)] ?? '#f00'),
        ),
      },
    })

    return { instance1, instance2 }
  })
  const primitive = new Cesium.Primitive({
    geometryInstances: pris.map((e) => e.instance1), //可以是实例数组
    appearance: new Cesium.PerInstanceColorAppearance({
      closed: true,
      flat: true,
      renderState: {
        depthTest: {
          enabled: false,
        },
      },
    }),
  })
  const outlinePrimitive = new Cesium.Primitive({
    geometryInstances: pris.map((e) => e.instance2),
    appearance: new Cesium.PerInstanceColorAppearance({
      flat: true,
      renderState: {
        lineWidth: Math.min(2.0, viewer.scene.maximumAliasedLineWidth),
        depthTest: {
          enabled: false,
        },
      },
    }),
  })
  viewer.scene.primitives.add(primitive)
  viewer.scene.primitives.add(outlinePrimitive)
  return { primitive, outlinePrimitive }
}

const getLevel = (height: number) => {
  if (height < 1000) {
    return 13
  }
  if (height < 2000) {
    return 12
  }
  if (height < 4000) {
    return 11
  }
  if (height < 8000) {
    return 10
  }
  if (height < 16000) {
    return 9
  }
  if (height < 32000) {
    return 8
  }
  return 7
}

const WirelessSituation: FC<PropsType> = memo(() => {
  const levelData = useWirelessSituationStore((s) => s.levelData)
  const levelGQS = useWirelessSituationStore((s) => s.levelGQS)
  const { viewer } = useCesium()

  const [level, setLevel] = useState(7)
  // 监听地图层级变化过程
  useEffect(() => {
    setLevel(getLevel(viewer?.camera.positionCartographic.height ?? 0x3f3f3f3f))
    viewer?.camera.changed.addEventListener(() => {
      const height = viewer.camera.positionCartographic.height
      setLevel(getLevel(height))
    })
  }, [])

  const [cameraPos, setCameraPos] = useState({ lng: 0, lat: 0 })
  const [viewRect, setViewRect] = useState({
    west: 0,
    south: 0,
    east: 0,
    north: 0,
  })

  const cameraPostRef = useLatest(cameraPos)
  useEffect(() => {
    if (!viewer) {
      return
    }
    const handleCameraChange = () => {
      const cameraPosition = viewer.camera.positionCartographic
      const longitude = CesiumMath.toDegrees(cameraPosition.longitude)
      const latitude = CesiumMath.toDegrees(cameraPosition.latitude)

      const canvas = viewer.scene.canvas
      const ellipsoid = viewer.scene.globe.ellipsoid

      // 屏幕左下角
      const leftBottom = new Cesium.Cartesian2(0, canvas.height)
      const leftBottomCartographic = viewer.scene.camera.pickEllipsoid(
        leftBottom,
        ellipsoid,
      )
      // 屏幕右上角
      const rightTop = new Cesium.Cartesian2(canvas.width, 0)
      const rightTopCartographic = viewer.scene.camera.pickEllipsoid(
        rightTop,
        ellipsoid,
      )

      if (!leftBottomCartographic || !rightTopCartographic) {
        setViewRect({
          west: 0,
          south: 0,
          east: 0,
          north: 0,
        })
        return
      }

      const leftBottomCoordinates = Cesium.Cartographic.fromCartesian(
        leftBottomCartographic,
        ellipsoid,
      )

      const rightTopCoordinates = Cesium.Cartographic.fromCartesian(
        rightTopCartographic,
        ellipsoid,
      )

      if (leftBottomCoordinates && rightTopCoordinates) {
        const leftBottomLongitude = CesiumMath.toDegrees(
          leftBottomCoordinates.longitude,
        )
        const leftBottomLatitude = CesiumMath.toDegrees(
          leftBottomCoordinates.latitude,
        )
        const rightTopLongitude = CesiumMath.toDegrees(
          rightTopCoordinates.longitude,
        )
        const rightTopLatitude = CesiumMath.toDegrees(
          rightTopCoordinates.latitude,
        )

        setViewRect({
          west: leftBottomLongitude,
          south: leftBottomLatitude,
          east: rightTopLongitude,
          north: rightTopLatitude,
        })
      }
      setCameraPos({ lng: longitude, lat: latitude })
    }

    viewer.camera.changed.addEventListener(handleCameraChange)
    handleCameraChange()
    return () => {
      attempt(() =>
        viewer.camera.changed.removeEventListener(handleCameraChange),
      )
    }
  }, [viewer])

  const data = useMemo(() => {
    if (level <= 10) {
      return levelData[level] ?? []
    }
    let d = 0.006
    if (level === 11) {
      d = 0.3
    } else if (level === 12) {
      d = 0.02
    }
    const result =
      levelGQS[level]?.search(
        viewRect.west - (viewRect.east - viewRect.west) / 2,
        viewRect.south - (viewRect.north - viewRect.south) / 2,
        viewRect.east + (viewRect.east - viewRect.west) / 2,
        viewRect.north + (viewRect.north - viewRect.south) / 2,
      ) ?? []
    return result
  }, [level, levelData, cameraPos, viewRect, levelGQS])

  useEffect(() => {
    if (!viewer?.scene || !data?.length) {
      return
    }
    const { primitive, outlinePrimitive } = addH3(viewer, data)

    return () => {
      attempt(() => viewer.scene.primitives.remove(primitive))
      attempt(() => viewer.scene.primitives.remove(outlinePrimitive))
    }
  }, [data])

  useLockCameraPitch(-90)

  return (
    <>
      <SignalBoardMarkers level={level} />
    </>
  )
})

WirelessSituation.displayName = 'WirelessSituation'

export default WirelessSituation
