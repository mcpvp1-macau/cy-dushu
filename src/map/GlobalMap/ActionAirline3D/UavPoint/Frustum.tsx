import { useEffect, useRef } from 'react'
import * as Cesium from 'cesium'
import { useDeepCompareEffect } from 'ahooks'
import { useUnmount } from 'ahooks'
import React from 'react'
import { useCesium } from 'resium'
import { getColorWithAlpha } from '@/utils/color'

interface Rotation {
  x: number
  y: number
  z: number
}

interface Props {
  position: Array<number>
  rotation: Rotation
  far?: number
  aspectRatio?: number
  fov: number
  color?: string
}

const Frustum: React.FC<Props> = (props) => {
  const {
    position,
    rotation,
    far = 15000,
    aspectRatio = 16 / 9,

    color = '#1bc07f',
  } = props
  // 为 0 时会报错
  let { fov } = props
  fov = Math.max(0.01, fov)

  const { viewer } = useCesium() as any
  // const rotation = { x: 90, y: 0, z: 0 };
  // const frustums = useRef<any[]>([null, null, null, null, null, null]);
  const frustumPrimitive = useRef(null)
  const outlinePrimitive = useRef(null)

  const near = 1
  const [lng, lat, height = 0] = position
  const positionC = Cesium.Cartesian3.fromDegrees(lng, lat, height)
  const getOrientation = () => {
    const { x, y, z } = rotation
    const camera = new Cesium.Camera(viewer.scene)
    camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(lng, lat, height),
      orientation: {
        heading: Cesium.Math.toRadians(y || 0), // 方向
        pitch: Cesium.Math.toRadians(x - 90 || 0),
        roll: Cesium.Math.toRadians(z || 0),
      },
    })
    const directionWC = camera.directionWC
    const upWC = camera.upWC
    let rightWC = camera.rightWC
    const o = new Cesium.Cartesian3()
    const l = new Cesium.Matrix3()
    const u = new Cesium.Quaternion()
    rightWC = Cesium.Cartesian3.negate(rightWC, o)
    const d = l
    Cesium.Matrix3.setColumn(d, 0, rightWC, d)
    Cesium.Matrix3.setColumn(d, 1, upWC, d)
    Cesium.Matrix3.setColumn(d, 2, directionWC, d)
    const c = Cesium.Quaternion.fromRotationMatrix(d, u)
    return c
  }
  // // 创建视锥体
  const addFrustum = () => {
    const frustum = new Cesium.PerspectiveFrustum({
      // 查看的视场角，绕Z轴旋转，以弧度方式输入
      // fov: Cesium.Math.PI_OVER_THREE,
      fov: Cesium.Math.toRadians(fov),
      // 视锥体的宽度/高度
      aspectRatio: aspectRatio,
      // 近面距视点的距离
      near: near,
      // 远面距视点的距离
      far: far,
    })
    const geometry = new Cesium.FrustumGeometry({
      frustum: frustum,
      origin: positionC,
      orientation: getOrientation(),
      vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
    })

    const id = Math.random()
    const instance = new Cesium.GeometryInstance({
      id: id,
      geometry: geometry,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString(
            getColorWithAlpha(color, 0.2) || color,
          ),
        ),
      },
    })

    const primitive = new Cesium.Primitive({
      geometryInstances: instance,
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: true,
        flat: true,
      }),
      asynchronous: false,
    })

    frustumPrimitive.current = viewer.scene.primitives.add(primitive)
  }

  // // 创建轮廓线
  const addOutline = async () => {
    const frustum = new Cesium.PerspectiveFrustum({
      fov: Cesium.Math.toRadians(fov),
      // 视锥体的宽度/高度
      aspectRatio: aspectRatio,
      // 近面距视点的距离
      near: near,
      // 远面距视点的距离
      far: far,
    })

    const geometry = new Cesium.FrustumOutlineGeometry({
      frustum: frustum,
      origin: positionC,
      orientation: getOrientation(),
    })

    const instance = new Cesium.GeometryInstance({
      geometry: geometry,
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.fromCssColorString(color),
        ),
      },
    })

    const primitive = new Cesium.Primitive({
      geometryInstances: instance,
      appearance: new Cesium.PerInstanceColorAppearance({
        closed: true,
        flat: true,
      }),
      asynchronous: false,
    })
    outlinePrimitive.current = viewer.scene.primitives.add(primitive)
  }

  const clear = () => {
    if (frustumPrimitive.current && viewer) {
      try {
        viewer.scene.primitives.remove(frustumPrimitive.current)
        viewer.scene.primitives.remove(outlinePrimitive.current)
      } catch (error) {}
    }
  }

  useEffect(() => {
    clear()
    addFrustum()
    addOutline()

    return () => {
      clear()
    }
  }, [])

  useDeepCompareEffect(() => {
    clear()
    addFrustum()
    addOutline()
  }, [position, rotation.x, rotation.y, fov, aspectRatio])

  useUnmount(() => {
    clear()
  })
  return null
}

export default React.memo(Frustum)
