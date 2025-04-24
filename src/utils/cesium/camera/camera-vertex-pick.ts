import { calcFovRadiation } from '@/utils/fov'
import * as Cesium from 'cesium'

/** Cesium 在地图上的四个角 */
export type GimbalPick = Partial<{
  leftBottom?: number[]
  leftTop?: number[]
  rightTop?: number[]
  rightBottom?: number[]
  center?: number[]
}>

/** 相机顶点 与 地图 🍌 四个角 */
export class CameraVertexPicker {
  private camera: Cesium.Camera
  private viewer: Cesium.Viewer

  constructor(viewer: Cesium.Viewer, useViewerCamera: boolean = false) {
    this.camera = useViewerCamera
      ? viewer.camera
      : new Cesium.Camera(viewer.scene)

    this.viewer = viewer
  }

  public getGimbalPick(
    position: { lon: number; lat: number; alt: number },
    direction: { yaw: number; pitch: number; roll: number },
    focal: number,
    width: number,
    aspectRatio: number,
    zoomFactor: number,
  ) {
    const camera = this.camera

    camera.frustum = new Cesium.PerspectiveFrustum({
      fov: calcFovRadiation(focal, width, zoomFactor),
      aspectRatio,
      near: 0.1,
      far: 1000,
    })

    camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(
        position.lon,
        position.lat,
        position.alt,
      ),
      orientation: {
        heading: Cesium.Math.toRadians(direction.yaw),
        pitch: Cesium.Math.toRadians(direction.pitch),
        roll: Cesium.Math.toRadians(direction.roll),
      },
    })

    // 获取相机四个角的经纬度 ---------------------
    const frustum = camera.frustum as Cesium.PerspectiveFrustum
    const tanFovY = Math.tan(frustum.fovy / 2)
    const _aspectRatio = frustum.aspectRatio
    const tanFovX = tanFovY * _aspectRatio
    const cameraDirection = Cesium.Cartesian3.clone(camera.direction)
    const cameraRight = Cesium.Cartesian3.clone(camera.right)
    const cameraUp = Cesium.Cartesian3.clone(camera.up)

    const directionTuples = [
      ['leftBottom', -tanFovX, -tanFovY],
      ['rightBottom', tanFovX, -tanFovY],
      ['leftTop', -tanFovX, tanFovY],
      ['rightTop', tanFovX, tanFovY],
    ] as const

    const calcDirection = (fovX: number, fovY: number) =>
      Cesium.Cartesian3.add(
        Cesium.Cartesian3.multiplyByScalar(
          cameraDirection,
          1.0,
          new Cesium.Cartesian3(),
        ),
        Cesium.Cartesian3.add(
          Cesium.Cartesian3.multiplyByScalar(
            cameraUp,
            fovY,
            new Cesium.Cartesian3(),
          ),
          Cesium.Cartesian3.multiplyByScalar(
            cameraRight,
            fovX,
            new Cesium.Cartesian3(),
          ),
          new Cesium.Cartesian3(),
        ),
        new Cesium.Cartesian3(),
      )

    // 视锥四个角的经纬度
    const gimbalPick: GimbalPick = {}

    // 如果相机高度小于地形高度，则不进行计算
    const height = this.viewer.scene.globe.getHeight(
      Cesium.Cartographic.fromDegrees(position.lon, position.lat),
    )
    if (height && height > position.alt) {
      return gimbalPick
    }

    for (const [key, fovX, fovY] of directionTuples) {
      const direction = calcDirection(fovX, fovY)
      const ray = new Cesium.Ray(camera.position, direction)

      // 计算射线与地球地形的交点
      const p = this.viewer.scene.globe.pick(ray, this.viewer.scene)
      if (p) {
        const cartographic = Cesium.Cartographic.fromCartesian(p)
        const lon = Cesium.Math.toDegrees(cartographic.longitude)
        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        gimbalPick[key] = [lon, lat]
        continue
      }

      // 计算射线与地球球面的交点
      const intersection = Cesium.IntersectionTests.rayEllipsoid(
        ray,
        this.viewer.scene.globe.ellipsoid,
      )
      if (Cesium.defined(intersection)) {
        const point = Cesium.Ray.getPoint(ray, intersection.start)
        const cartographic =
          this.viewer.scene.globe.ellipsoid.cartesianToCartographic(point)
        const lon = Cesium.Math.toDegrees(cartographic.longitude)
        const lat = Cesium.Math.toDegrees(cartographic.latitude)
        gimbalPick[key] = [lon, lat]
      }
    }

    return gimbalPick
  }
}
