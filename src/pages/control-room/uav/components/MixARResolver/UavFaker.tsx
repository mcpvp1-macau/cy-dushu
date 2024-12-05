import { memo, useEffect, useRef, type FC } from 'react'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import useMixARStore, {
  ArFeature,
  GimbalPick,
} from '@/store/control-room/useMixAR.store'
import { isNil } from 'lodash'
import H from '@/utils/cesium-hack'
import { useThrottleEffect } from 'ahooks'
import { Position } from 'geojson'
import { calcFovRadiation } from '@/utils/fov'
import gimbalMap from '@/constant/uav/gimbal'
import useSettingStore from '@/store/useSetting.store'
import useMapLayerAndOverlayStore from '@/store/map/useLayerAndOverlay.store'
import { shouldJson } from '@/utils/json'

type PropsType = unknown

const UavFaker: FC<PropsType> = memo(() => {
  const uav = useMixARStore((s) => s.uavProperties)
  const updateGimbalPick = useMixARStore((s) => s.updateGimbalPick)
  const enable = useMixARStore((s) => s.enable)
  // const startInfo = useMixARStore((s) => s.startInfo)

  const { viewer } = useCesium()
  const cameraRef = useRef<Cesium.Camera | null>(null)

  const shiftSetting = useSettingStore((s) => s.virtualReal.shift)

  useEffect(() => {
    if (!viewer) {
      return
    }
    cameraRef.current = new Cesium.Camera(viewer.scene)

    return () => {
      cameraRef.current = null
    }
  }, [viewer])

  useThrottleEffect(
    () => {
      if (
        !enable ||
        !viewer ||
        !cameraRef.current ||
        !uav.longitude ||
        !uav.latitude ||
        !uav.altitude ||
        isNil(uav.gimbalYaw) ||
        isNil(uav.gimbalPitch) ||
        isNil(uav.zoomFactor)
      ) {
        return
      }

      const { current: camera } = cameraRef
      camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(
          uav.longitude,
          uav.latitude,
          // startInfo.startHeight + uav.altitude! - startInfo.startAGL,
          uav.altitude! + shiftSetting.height,
        ),
        orientation: {
          heading: Cesium.Math.toRadians(
            uav.gimbalYaw + shiftSetting.gimbalYaw,
          ),
          pitch: Cesium.Math.toRadians(
            uav.gimbalPitch + shiftSetting.gimbalPitch,
          ),
          roll: Cesium.Math.toRadians(0),
        },
      })
      camera.frustum = new Cesium.PerspectiveFrustum({
        fov: calcFovRadiation(
          gimbalMap[uav.cameraType!]?.wide_focal ?? 4.5,
          gimbalMap[uav.cameraType!]?.wide_camera_w ?? 6.4,
          uav.lensType === 2 ? uav.zoomFactor : 1,
        ), // 75.17455291748047
        aspectRatio: (uav.width ?? 1) / (uav.height ?? 1),
        near: 0.1,
        far: 100000,
      })

      const frustum = camera.frustum as Cesium.PerspectiveFrustum
      const tanFovY = Math.tan(camera.frustum.fovy! / 2)
      const aspectRatio = frustum.aspectRatio
      const tanFovX = tanFovY * aspectRatio!
      const cameraDirection = Cesium.Cartesian3.clone(camera.direction)
      const cameraRight = Cesium.Cartesian3.clone(camera.right)
      const cameraUp = Cesium.Cartesian3.clone(camera.up)

      // 四个方向向量
      const topLeft = Cesium.Cartesian3.add(
        Cesium.Cartesian3.multiplyByScalar(
          cameraDirection,
          1.0,
          new Cesium.Cartesian3(),
        ),
        Cesium.Cartesian3.add(
          Cesium.Cartesian3.multiplyByScalar(
            cameraUp,
            tanFovY,
            new Cesium.Cartesian3(),
          ),
          Cesium.Cartesian3.multiplyByScalar(
            cameraRight,
            -tanFovX,
            new Cesium.Cartesian3(),
          ),
          new Cesium.Cartesian3(),
        ),
        new Cesium.Cartesian3(),
      )

      const topRight = Cesium.Cartesian3.add(
        Cesium.Cartesian3.multiplyByScalar(
          cameraDirection,
          1.0,
          new Cesium.Cartesian3(),
        ),
        Cesium.Cartesian3.add(
          Cesium.Cartesian3.multiplyByScalar(
            cameraUp,
            tanFovY,
            new Cesium.Cartesian3(),
          ),
          Cesium.Cartesian3.multiplyByScalar(
            cameraRight,
            tanFovX,
            new Cesium.Cartesian3(),
          ),
          new Cesium.Cartesian3(),
        ),
        new Cesium.Cartesian3(),
      )

      const bottomLeft = Cesium.Cartesian3.add(
        Cesium.Cartesian3.multiplyByScalar(
          cameraDirection,
          1.0,
          new Cesium.Cartesian3(),
        ),
        Cesium.Cartesian3.add(
          Cesium.Cartesian3.multiplyByScalar(
            cameraUp,
            -tanFovY,
            new Cesium.Cartesian3(),
          ),
          Cesium.Cartesian3.multiplyByScalar(
            cameraRight,
            -tanFovX,
            new Cesium.Cartesian3(),
          ),
          new Cesium.Cartesian3(),
        ),
        new Cesium.Cartesian3(),
      )

      const bottomRight = Cesium.Cartesian3.add(
        Cesium.Cartesian3.multiplyByScalar(
          cameraDirection,
          1.0,
          new Cesium.Cartesian3(),
        ),
        Cesium.Cartesian3.add(
          Cesium.Cartesian3.multiplyByScalar(
            cameraUp,
            -tanFovY,
            new Cesium.Cartesian3(),
          ),
          Cesium.Cartesian3.multiplyByScalar(
            cameraRight,
            tanFovX,
            new Cesium.Cartesian3(),
          ),
          new Cesium.Cartesian3(),
        ),
        new Cesium.Cartesian3(),
      )

      const ellipsoid = viewer.scene.globe.ellipsoid
      const newPickData: GimbalPick = {}
      ;[topLeft, topRight, bottomLeft, bottomRight].forEach((direction, i) => {
        const ray = new Cesium.Ray(camera.position, direction)
        // const intersection = scene.globe.pick(ray, scene);
        const intersection = Cesium.IntersectionTests.rayEllipsoid(
          ray,
          ellipsoid,
        )

        if (Cesium.defined(intersection)) {
          const point = Cesium.Ray.getPoint(ray, intersection.start)
          const cartographic = ellipsoid.cartesianToCartographic(point)
          const lon = Cesium.Math.toDegrees(cartographic.longitude)
          const lat = Cesium.Math.toDegrees(cartographic.latitude)
          if (i === 0) {
            newPickData.leftTop = [lon, lat]
          } else if (i === 1) {
            newPickData.rightTop = [lon, lat]
          }
          if (i === 2) {
            newPickData.leftBottom = [lon, lat]
          } else if (i === 3) {
            newPickData.rightBottom = [lon, lat]
          }
        }
      })
      updateGimbalPick(newPickData)
    },
    [
      uav.longitude,
      uav.latitude,
      uav.altitude,
      uav.gimbalYaw,
      uav.gimbalPitch,
      shiftSetting,
    ],
    {
      wait: enable ? 33 : undefined,
      trailing: true,
    },
  )

  const rTree = useMixARStore((s) => s.rTree)
  const gimbalPick = useMixARStore((s) => s.gimbalPick)
  const updateArData = useMixARStore((s) => s.updateArData)
  useThrottleEffect(
    () => {
      if (
        !rTree ||
        !gimbalPick ||
        !viewer ||
        !uav.width ||
        !uav.height ||
        !enable
      ) {
        return
      }
      const coordinates = [
        gimbalPick.leftBottom,
        gimbalPick.leftTop,
        gimbalPick.rightTop,
        gimbalPick.rightBottom,
      ].filter((v) => !!v)
      if (coordinates.length < 4) {
        updateArData([])
        return
      }
      // 查询与给定边界相交的 GeoJSON Features
      const searchResult = rTree.search({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [coordinates],
        },
        properties: {},
      })
      const features = searchResult.features
      const arResult: ArFeature[] = []
      let fc: Position[] = []
      // 处理所有 feature
      for (const feature of features) {
        // LiqunLog.log(feature.geometry.type, feature.geometry.coordinates);
        switch (feature.geometry.type) {
          case 'LineString':
            fc = feature.geometry.coordinates
            break
          case 'MultiLineString':
          case 'Polygon':
            fc = feature.geometry.coordinates[0]
            break
          case 'MultiPolygon':
            fc = feature.geometry.coordinates[0][0]
            break
        }

        // const coordinates = feature.geometry.coordinates;
        const res: ArFeature = {
          coodinates: [],
          properties: feature.properties,
          isClosed:
            fc.length >= 2 &&
            Math.abs(fc[0][0] - fc.at(-1)![0]) < 1e-5 &&
            Math.abs(fc[0][1] - fc.at(-1)![1]) < 1e-5,
        }
        // 排除没有名字的路段
        const inScreens: boolean[] = []
        // 所有点是否在屏幕内
        let anyInScreen = false
        for (const coordinate of fc) {
          const cartesian2 = H.worldToWindowCoordinates(
            viewer?.scene,
            Cesium.Cartesian3.fromDegrees(
              coordinate[0] + 0.00001 * shiftSetting.lng,
              coordinate[1] + 0.00001 * shiftSetting.lat,
              0,
            ),
            cameraRef.current,
            uav.width,
            uav.height,
          )
          if (!cartesian2) {
            continue
          }
          const pixel = [cartesian2.x, cartesian2.y]
          const inScreen =
            pixel[0] >= 0 &&
            pixel[0] <= uav.width! &&
            pixel[1] >= 0 &&
            pixel[1] <= uav.height!
          anyInScreen ||= inScreen
          res.coodinates.push(pixel)
          inScreens.push(inScreen)
        }
        if (!anyInScreen) {
          continue
        }
        // 不是闭合的 (道路)
        if (!res.isClosed) {
          res.coodinates = res.coodinates.filter(
            (_, i) =>
              !!inScreens[i - 1] || !!inScreens[i + 1] || !!inScreens[i],
          )
        }
        arResult.push(res)
      }
      updateArData(arResult)
    },
    [rTree, gimbalPick, shiftSetting],
    {
      wait: enable ? 33 : undefined,
      trailing: true,
    },
  )

  // 计算航线空中点的位置
  const airpointPositions = useMixARStore((s) => s.airpointPositions)
  const updateAirpointPositionsAR = useMixARStore(
    (s) => s.updateAirpointPositionsAR,
  )
  useEffect(() => {
    if (!viewer || !cameraRef.current || !uav.width || !uav.height) {
      return
    }
    const positionsAR: number[][] = []
    for (const point of airpointPositions) {
      const cartesian2 = H.worldToWindowCoordinates(
        viewer?.scene,
        Cesium.Cartesian3.fromDegrees(point.pointX, point.pointY, point.pointZ),
        cameraRef.current,
        uav.width,
        uav.height,
      )
      if (!cartesian2) {
        continue
      }
      const pixel = [cartesian2.x, cartesian2.y]
      positionsAR.push(pixel)
    }
    updateAirpointPositionsAR(positionsAR)
  }, [airpointPositions, uav.width, uav.height, gimbalPick, shiftSetting])

  // 计算覆盖物点的位置
  const overlayList = useMapLayerAndOverlayStore((s) => s.overlayList)
  const updateOverlaiesAR = useMixARStore((s) => s.updateOverlaiesAR)
  useEffect(() => {
    if (!viewer || !cameraRef.current || !uav.width || !uav.height) {
      return
    }
    const positionsAR: number[][][] = []
    for (const overlay of overlayList) {
      if (overlay.overlayType === 'POLYGON') {
        const positions: number[][] = []
        const overlayPositions = shouldJson(overlay.overlayPositions)
        if (!overlayPositions) {
          continue
        }
        if (
          overlayPositions[0][0] !== overlayPositions.at(-1)![0] ||
          overlayPositions[0][1] !== overlayPositions.at(-1)![1]
        ) {
          overlayPositions.push(overlayPositions[0])
        }
        for (const point of overlayPositions) {
          const cartesian2 = H.worldToWindowCoordinates(
            viewer?.scene,
            Cesium.Cartesian3.fromDegrees(
              point[0] + 0.00001 * shiftSetting.lng,
              point[1] + 0.00001 * shiftSetting.lat,
              0,
            ),
            cameraRef.current,
            uav.width,
            uav.height,
          )
          if (!cartesian2) {
            continue
          }
          const pixel = [cartesian2.x, cartesian2.y]
          positions.push(pixel)
        }
        positionsAR.push(positions)
      }
    }

    updateOverlaiesAR(positionsAR)
  }, [overlayList, uav.width, uav.height, gimbalPick, shiftSetting])

  return null
})

UavFaker.displayName = 'UavFaker'

export default UavFaker
