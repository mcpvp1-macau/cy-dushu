import * as Cesium from 'cesium'
import * as turf from '@turf/turf'

type RecursiveRequired<T> = {
  [P in keyof T]-?: T[P] extends object
    ? RecursiveRequired<T[P]>
    : Required<T[P]>
}

/**增强多边形显示，聚合polygon/polyline，折点、边长label、面积label。更新坐标时应该传入一个新数组，否则无法更新
 * @example
 * const areaPrimitive = new ReconstructionAreaPrimitive('#22c')
 * viewer.scene.primitives.add(areaPrimitive)
 * areaPrimitive.positions = positions
 */
export default class ReconstructionAreaPrimitive {
  private _positions: Cesium.Cartesian3[] = []
  positions: Cesium.Cartesian3[] = []
  private _pointCollection: Cesium.PointPrimitiveCollection
  private _labelCollection: Cesium.LabelCollection
  private _centerLabel: Cesium.LabelCollection
  private _polygon: Cesium.Primitive | null = null
  private _polyline: Cesium.Primitive | null = null
  private _drawingColor: string
  private _area: number = 0

  constructor(drawingColor: string) {
    this._pointCollection = new Cesium.PointPrimitiveCollection()
    this._labelCollection = new Cesium.LabelCollection({
      blendOption: Cesium.BlendOption.TRANSLUCENT,
    })
    this._centerLabel = new Cesium.LabelCollection({
      blendOption: Cesium.BlendOption.TRANSLUCENT,
    })
    this._drawingColor = drawingColor
  }

  private update(frameState: any) {
    if (this._positions !== this.positions) {
      this._positions = this.positions

      this._polygon = this.createPolygon()
      this._polyline = this.createPolyline()
      this.updatePointAndLabel()
      this.onAreaChanged && this.onAreaChanged(this._area / 1000000)
    }
    // @ts-ignore
    this._polygon && this._polygon.update(frameState)
    // @ts-ignore
    this._polyline && this._polyline.update(frameState)
    // @ts-ignore
    this._pointCollection.update(frameState)
    // @ts-ignore
    this._labelCollection.update(frameState)
    // @ts-ignore
    this._centerLabel.update(frameState)
  }

  private destroy() {
    this._positions = []
    this._pointCollection.destroy()
    this._labelCollection.destroy()
  }

  private isDestroyed() {
    return false
  }

  private createPolygon() {
    if (this._positions.length < 3) return null

    return new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(this._positions),
        }),
      }),
      appearance: new Cesium.MaterialAppearance({
        material: Cesium.Material.fromType(Cesium.Material.ColorType, {
          color: Cesium.Color.fromCssColorString(this._drawingColor).withAlpha(
            0.4,
          ),
        }),
      }),
      asynchronous: false,
    })
  }

  private createPolyline() {
    if (this._positions.length < 2) return null

    const closedPositions = [...this._positions, this._positions[0]]
    return new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
          positions: closedPositions,
          width: 3,
        }),
      }),
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType(
          Cesium.Material.PolylineOutlineType,
          {
            color: Cesium.Color.fromCssColorString(this._drawingColor),
            outlineColor: Cesium.Color.fromCssColorString('#fff'),
            outlineWidth: 2,
          },
        ),
      }),
      asynchronous: false,
    })
  }

  private updatePointAndLabel() {
    if (this._positions.length === 0 || this._positions.length === 1) {
      this._pointCollection.removeAll()
      this._labelCollection.removeAll()
      this._centerLabel.removeAll()
      return
    }

    let prePosition = this._positions[this._positions.length - 1]
    this._positions.forEach((position, index) => {
      const point = this._pointCollection.get(index)
      const label = this._labelCollection.get(index)
      const centerPosition = Cesium.Cartesian3.midpoint(
        prePosition,
        position,
        new Cesium.Cartesian3(),
      )
      if (point && label) {
        point.position = position
        label.position = centerPosition
        label.text = `${Cesium.Cartesian3.distance(
          prePosition,
          position,
        ).toFixed()}m`
      } else {
        this._pointCollection.add({
          position: position,
          color: Cesium.Color.fromCssColorString('#fff'),
          pixelSize: 9,
          outlineWidth: 1,
          outlineColor: Cesium.Color.fromCssColorString(this._drawingColor),
        })
        this._labelCollection.add({
          position: centerPosition,
          text: `${Cesium.Cartesian3.distance(
            prePosition,
            position,
          ).toFixed()}m`,
          font: '12px system-ui',
          fillColor: Cesium.Color.fromCssColorString('#fff'),
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString(
            'rgba(25, 32, 47, 0.7)',
          ),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        })
      }
      prePosition = position
    })

    // 当点大于3开始计算面积并显示
    if (this.positions.length >= 3) {
      // 没有面积显示的label就创建，有就更新位置和文字
      if (this._centerLabel.length === 0) {
        this._centerLabel.add({
          font: '14px system-ui',
          fillColor: Cesium.Color.fromCssColorString('#fff'),
          showBackground: true,
          backgroundColor: Cesium.Color.fromCssColorString(
            'rgba(25, 32, 47, 0.8)',
          ),
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
        })
      }
      const [center, area] = this.calcCenterPoint()
      this._area = area
      const lat = center.geometry.coordinates[0]
      const lon = center.geometry.coordinates[1]
      this._centerLabel.get(0).position = Cesium.Cartesian3.fromDegrees(
        lat,
        lon,
        0,
      )
      this._centerLabel.get(0).text = `${(area / 1000000).toFixed(2)}km²`
    } else {
      this._area = 0
    }
  }

  private calcCenterPoint() {
    const coordinates: number[][] = []
    const closedPositions = [...this._positions, this._positions[0]]
    closedPositions.forEach((item) => {
      const lontitude = Cesium.Math.toDegrees(
        Cesium.Cartographic.fromCartesian(item).longitude,
      )
      const latitude = Cesium.Math.toDegrees(
        Cesium.Cartographic.fromCartesian(item).latitude,
      )
      coordinates.push([lontitude, latitude])
    })
    const trufPolygon = turf.polygon([coordinates])

    return [
      turf.centerOfMass(trufPolygon),
      turf.area(turf.polygon([coordinates])),
    ] as const
  }

  /**获取当前绘制的面积，单位：km² */
  get area() {
    return this._area / 1000000
  }

  /** 监听面积变化的回调，返回面积单位为km² */
  onAreaChanged: ((area: number) => void) | null = null
}
