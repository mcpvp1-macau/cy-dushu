import * as turf from '@turf/turf'
import * as Cesium from 'cesium'
import customDashedShader from './customDashed.glsl?raw'
import noFlyPolylineShader from './noFlyPolyline.glsl?raw'

type Coordinate = [number, number] | [number, number, number]

export type StyleOptions = {
  /**填充颜色 */
  fill: string
  /**描边颜色，透明度为1 */
  stroke: string
  /**中心标注文字 */
  label: string
  /**填充颜色 */
  fillOpacity: number
  /**描边类型 */
  strokeStyle: 'solid' | 'dashed' | 'no-fly'
  /**描边宽度, 如果为禁飞区，那么宽度无法设置为一个固定值 */
  strokeWeight: number | string
}

type Label = {
  show?: boolean
  position: Cesium.Cartesian3
  text: string
  font?: string
  fillColor?: Cesium.Color
  outlineColor?: Cesium.Color
  outlineWidth?: number
  showBackground?: false
  backgroundColor?: Cesium.Color
  backgroundPadding?: Cesium.Cartesian2
  style?: Cesium.LabelStyle
  pixelOffset?: Cesium.Cartesian2
  eyeOffset?: Cesium.Cartesian3
  horizontalOrigin?: Cesium.HorizontalOrigin
  verticalOrigin?: Cesium.VerticalOrigin
  scale?: number
  translucencyByDistance?: Cesium.NearFarScalar
  pixelOffsetScaleByDistance?: Cesium.NearFarScalar
  scaleByDistance?: Cesium.NearFarScalar
  heightReference?: Cesium.HeightReference
  distanceDisplayCondition?: Cesium.DistanceDisplayCondition
  disableDepthTestDistance?: number
}
export function createLabel(
  position: Cesium.Cartesian3,
  styleOptions: Pick<StyleOptions, 'label'>,
): Label {
  return {
    position,
    text: styleOptions.label,
    font: '700 64px Helvetica',
    verticalOrigin: Cesium.VerticalOrigin.CENTER,
    horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
    scale: 0.2,
    disableDepthTestDistance: 50000,
    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
    outlineColor: Cesium.Color.BLACK, //边框颜色
    outlineWidth: 5, //边框宽度
  }
}

type Point = {
  position: Cesium.Cartesian3
  show?: boolean
  pixelSize?: number
  color?: Cesium.Color
  outlineColor?: Cesium.Color
  outlineWidth?: number
  id?: any
  disableDepthTestDistance?: number
  distanceDisplayCondition?: Cesium.DistanceDisplayCondition
  scaleByDistance?: Cesium.NearFarScalar
  translucencyByDistance?: Cesium.NearFarScalar
}
function createDragPoint(position: Cesium.Cartesian3): Point {
  return {
    position,
    color: Cesium.Color.WHITE,
    pixelSize: 8,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 1,
    disableDepthTestDistance: 1000000,
  }
}

type CreateOptions = {
  positions: Cesium.Cartesian3[]
  styleOptions: StyleOptions
  asynchronous: boolean
  isGround: boolean
  primitiveType: PrimitiveType
  flightAreaHeight: number
  mode: Cesium.SceneMode
}

async function createPolyline(options: CreateOptions) {
  const {
    positions,
    styleOptions,
    asynchronous,
    isGround,
    primitiveType,
    flightAreaHeight,
    mode,
  } = options
  // // 禁飞区为拉伸的实心多边形，不显示描边
  // if (primitiveType === 'NO_FLY_ZONE') return null
  const useFenceStyle = globalConfig.noFlyZoneDisplayStyle === 'fence'

  const isWallOfFence =
    mode === Cesium.SceneMode.SCENE3D &&
    primitiveType === 'ELECTRONIC_FENCE' &&
    flightAreaHeight > 0

  const isWallOfNoFlyZone =
    mode === Cesium.SceneMode.SCENE3D &&
    primitiveType === 'NO_FLY_ZONE' &&
    flightAreaHeight > 0 &&
    useFenceStyle

  // 电子围栏为围墙，使用WallGeometry
  if (isWallOfFence || isWallOfNoFlyZone) {
    return new Cesium.Primitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.WallGeometry({
          positions,
          maximumHeights: positions.map(() => flightAreaHeight),
        }),
      }),
      appearance: new Cesium.MaterialAppearance({
        material: Cesium.Material.fromType(Cesium.Material.ColorType, {
          color: Cesium.Color.fromCssColorString(styleOptions.fill).withAlpha(
            styleOptions.fillOpacity,
          ),
        }),
      }),
      asynchronous,
    })
  }

  let u_polylineLength = 0
  for (let i = 1; i < positions.length; i++) {
    u_polylineLength += Cesium.Cartesian3.distance(
      positions[i],
      positions[i - 1],
    )
  }

  let material
  if (styleOptions.strokeStyle === 'dashed') {
    material = new Cesium.Material({
      fabric: {
        type: 'custom-dashed',
        uniforms: {
          color: Cesium.Color.fromCssColorString(styleOptions.stroke),
          gapColor: Cesium.Color.TRANSPARENT,
          solidLength: 8,
          gapLength: 8,
          u_polylineLength: u_polylineLength,
          u_pixelSizeInMeters: 1,
        },
        source: customDashedShader,
      },
      translucent: true,
    })
  } else if (styleOptions.strokeStyle === 'no-fly') {
    material = new Cesium.Material({
      fabric: {
        type: 'no-fly',
        uniforms: {
          color: Cesium.Color.fromCssColorString(styleOptions.stroke),
          offset: 10,
          lineWidth: 2,
          u_polylineLength: u_polylineLength,
          u_pixelSizeInMeters: 1,
        },
        source: noFlyPolylineShader,
      },
      translucent: true,
    })
  } else {
    material = Cesium.Material.fromType(Cesium.Material.ColorType, {
      color: Cesium.Color.fromCssColorString(styleOptions.stroke),
    })
  }

  const PrimitiveClass = isGround
    ? Cesium.GroundPolylinePrimitive
    : Cesium.Primitive
  const GeometryClass = isGround
    ? Cesium.GroundPolylineGeometry
    : Cesium.PolylineGeometry
  if (isGround) {
    await Cesium.GroundPolylinePrimitive.initializeTerrainHeights()
  }

  return new PrimitiveClass({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new GeometryClass({
        positions,
        width:
          styleOptions.strokeStyle === 'no-fly'
            ? 10
            : parseFloat(styleOptions.strokeWeight as string),
      }),
    }),
    appearance: new Cesium.PolylineMaterialAppearance({
      material: material,
    }),
    asynchronous,
  })
}

async function createPolygon(options: CreateOptions) {
  const {
    positions,
    styleOptions,
    asynchronous,
    isGround,
    primitiveType,
    flightAreaHeight,
    mode,
  } = options

  // 电子围栏为墙，不显示填充，但是2d情况下需要显示
  if (
    mode === Cesium.SceneMode.SCENE3D &&
    primitiveType === 'ELECTRONIC_FENCE' &&
    flightAreaHeight > 0
  )
    return null

  const PrimitiveClass = isGround ? Cesium.GroundPrimitive : Cesium.Primitive
  // // 禁飞区为拉伸的多边形
  // PrimitiveClass =
  //   primitiveType === 'NO_FLY_ZONE' ? Cesium.Primitive : PrimitiveClass

  if (isGround) {
    await Cesium.GroundPrimitive.initializeTerrainHeights()
  }
  return new PrimitiveClass({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(positions),
        perPositionHeight: isGround ? false : true,
        // extrudedHeight: flightAreaHeight,
      }),
    }),
    appearance: new Cesium.MaterialAppearance({
      material: Cesium.Material.fromType('Color', {
        color: Cesium.Color.fromCssColorString(styleOptions.fill).withAlpha(
          styleOptions.fillOpacity,
        ),
      }),
    }),
    asynchronous,
  })
}

export const CIRCLE_POINT_NUMBER = 180
function createCircle(options: {
  center: Coordinate
  radius: number
  styleOptions: StyleOptions
  asynchronous: boolean
  isGround: boolean
  primitiveType: PrimitiveType
  flightAreaHeight: number
  mode: Cesium.SceneMode
}) {
  const {
    center,
    radius,
    styleOptions,
    asynchronous,
    isGround,
    primitiveType,
    flightAreaHeight,
    mode,
  } = options

  const circle = turf.circle(center, radius, {
    steps: CIRCLE_POINT_NUMBER,
    units: 'meters',
  })

  const positions = circle.geometry.coordinates[0].map((coord) =>
    Cesium.Cartesian3.fromDegrees(coord[0], coord[1], coord?.[2] ?? 0),
  )

  return createPolygon({
    positions,
    styleOptions,
    asynchronous,
    isGround,
    primitiveType,
    flightAreaHeight,
    mode,
  })
}

function createCircleOutline(options: {
  center: Coordinate
  radius: number
  styleOptions: StyleOptions
  asynchronous: boolean
  isGround: boolean
  primitiveType: PrimitiveType
  flightAreaHeight: number
  mode: Cesium.SceneMode
}) {
  const {
    center,
    radius,
    styleOptions,
    asynchronous,
    isGround,
    primitiveType,
    flightAreaHeight,
    mode,
  } = options

  const circle = turf.circle(center, radius, {
    steps: CIRCLE_POINT_NUMBER,
    units: 'meters',
  })

  const positions = circle.geometry.coordinates[0].map((coord) =>
    Cesium.Cartesian3.fromDegrees(coord[0], coord[1], coord?.[2] ?? 0),
  )

  return createPolyline({
    positions,
    styleOptions,
    asynchronous,
    isGround,
    primitiveType,
    flightAreaHeight,
    mode,
  })
}

export function getCenter(points: Coordinate[]) {
  const features = turf.points(points)
  const center = turf.center(features)
  const averageHeight =
    points.reduce((pre, cur) => pre + (cur?.[2] ?? 0), 0) / points.length

  return [
    center.geometry.coordinates[0],
    center.geometry.coordinates[1],
    averageHeight,
  ]
}

// 同一帧内像素大小不会变，所以将计算结果缓存起来
const cachedPixelSizeInMeters: {
  [key: string]: number
} = {}
function getPixelSizeInMeters(frameState: any) {
  const contextId = frameState.context.id
  const cacheKey = `${contextId}-frameNumber${frameState.frameNumber}`

  const cacheResult = cachedPixelSizeInMeters[cacheKey]

  if (cacheResult) {
    return cacheResult
  }

  const camera = frameState.camera as Cesium.Camera
  const canvas = frameState.context._canvas

  const cneterPosition = camera.pickEllipsoid(
    new Cesium.Cartesian2(canvas.width / 2, canvas.height / 2),
  )
  const pixelSizeInMeters = camera.getPixelSize(
    new Cesium.BoundingSphere(cneterPosition, 0.1),
    canvas.width,
    canvas.height,
  )

  Object.keys(cachedPixelSizeInMeters).forEach((key) => {
    if (key.startsWith(contextId)) {
      delete cachedPixelSizeInMeters[key]
    }
  })
  cachedPixelSizeInMeters[cacheKey] = pixelSizeInMeters
  return pixelSizeInMeters
}

export type PrimitiveType =
  | 'OVERLAY'
  | 'ELECTRONIC_FENCE'
  | 'NO_FLY_ZONE'
  | 'AI_COUNT_ZONE'
  | 'NO_COUNT_ZONE'

type OverlayPrimitiveProps = {
  styleOptions: StyleOptions
  asynchronous?: boolean
  props?: any
  isGround?: boolean
  /**该图元的类型，默认是覆盖物 */
  primitiveType?: PrimitiveType
  /**飞行区域的高度 */
  flightAreaHeight?: number
}

// 所有的几何图形如果想要更新需要改变position的地址，而不能通过push这些方法

/**覆盖物多边形 */
export class OverlayPolygonPrimitive {
  private _positions: Coordinate[] = []
  private _polygon: Cesium.GroundPrimitive | Cesium.Primitive | null = null
  private _polygonOutline:
    | Cesium.GroundPolylinePrimitive
    | Cesium.Primitive
    | null = null
  private _isGround: boolean = true
  private _label: Cesium.LabelCollection
  private _styleOptions: StyleOptions
  private _mode: Cesium.SceneMode = Cesium.SceneMode.SCENE3D
  /**是否异步创建几何体 */
  asynchronous: boolean
  positions: Coordinate[] = []
  show: boolean = true
  isGround: boolean
  props: any
  primitiveType: PrimitiveType
  flightAreaHeight: number

  constructor(overlayOptions: OverlayPrimitiveProps) {
    this._styleOptions = overlayOptions.styleOptions
    this._label = new Cesium.LabelCollection()
    this.props = overlayOptions.props
    this.asynchronous = overlayOptions.asynchronous ?? true
    this.isGround = overlayOptions.isGround ?? true
    this.primitiveType = overlayOptions.primitiveType ?? 'OVERLAY'
    this.flightAreaHeight = overlayOptions.flightAreaHeight ?? 0
  }

  update(frameState: any) {
    if (
      this.positions !== this._positions ||
      this.isGround !== this._isGround ||
      this._mode !== frameState.mode
    ) {
      this._positions = this.positions
      this._isGround = this.isGround
      this._mode = frameState.mode
      this.updateGeometry(frameState)
    }

    if (this._polygonOutline) {
      this._polygonOutline.appearance.material.uniforms.u_pixelSizeInMeters =
        getPixelSizeInMeters(frameState)
    }

    if (this._polygon) {
      // @ts-ignore
      this._polygon.update(frameState)
    }
    if (this._polygonOutline) {
      // @ts-ignore
      this._polygonOutline.update(frameState)
    }
    // @ts-ignore
    this._label.update(frameState)
  }

  private async updateGeometry(frameState?: any) {
    const oldPolygon = this._polygon
    const oldPolygonOutline = this._polygonOutline

    if (this._positions.length <= 1) {
      this._polygonOutline = null
      this._polygon = null
    } else if (this._positions.length === 2) {
      this._polygonOutline = await createPolyline(this.getCreateOptions())
      this._polygon = null
    } else {
      const closedPositions = [
        ...this.cartesianPositions,
        this.cartesianPositions[0],
      ]
      this._polygonOutline = await createPolyline(
        this.getCreateOptions(closedPositions),
      )
      this._polygon = await createPolygon(this.getCreateOptions())

      if (this._polygon) {
        // @ts-ignore
        this._polygon.props = this.props
      }
      if (this._polygonOutline) {
        // @ts-ignore
        this._polygonOutline.props = this.props
      }

      // label值不为空才创建
      this._label.removeAll()
      if (this.styleOptions.label) {
        const center = getCenter(this._positions)
        let cneterCartesian = Cesium.Cartesian3.fromDegrees(
          center[0],
          center[1],
          center?.[2] ?? 0,
        )
        if (this._isGround && frameState) {
          const scene = frameState.camera._scene as Cesium.Scene
          const height = scene?.globe?.getHeight(
            Cesium.Cartographic.fromDegrees(center[0], center[1]),
          )
          // 没有高度或者高度小于-100可能是刚开始地形没加载好，1秒后再次尝试
          if (!height || height < -100) {
            setTimeout(() => {
              this.updateGeometry(frameState)
            }, 1000)
          }
          cneterCartesian = Cesium.Cartesian3.fromDegrees(
            center[0],
            center[1],
            height,
          )
        }
        this._label.add(createLabel(cneterCartesian, this.styleOptions))
        // @ts-ignore
        this._label.get(0)!.props = this.props
      }
    }

    if (oldPolygon && oldPolygon.isDestroyed() === false) {
      oldPolygon.destroy()
    }
    if (oldPolygonOutline && oldPolygonOutline.isDestroyed() === false) {
      oldPolygonOutline.destroy()
    }
  }

  isDestroyed() {
    return false
  }

  destroy() {
    this._positions = []
    if (this._polygon && this._polygon.isDestroyed() === false) {
      this._polygon.destroy()
    }
    if (this._polygonOutline && this._polygonOutline.isDestroyed() === false) {
      this._polygonOutline.destroy()
    }
    this._label.destroy()
  }

  /**获取或设置几何样式 */
  get styleOptions() {
    return this._styleOptions
  }

  set styleOptions(val: StyleOptions) {
    this._styleOptions = val
    this.updateGeometry()
  }

  get cartesianPositions() {
    return this._positions.map((coord) =>
      Cesium.Cartesian3.fromDegrees(coord[0], coord[1], coord?.[2] ?? 0),
    )
  }

  getCreateOptions(
    positions?: Cesium.Cartesian3[],
  ): Parameters<typeof createPolygon>[0] {
    return {
      positions: positions ?? this.cartesianPositions,
      styleOptions: this.styleOptions,
      asynchronous: this.asynchronous,
      isGround: this._isGround,
      primitiveType: this.primitiveType,
      flightAreaHeight: this.flightAreaHeight,
      mode: this._mode,
    }
  }

  setProps(data: any) {
    this.props = data
    this.updateGeometry()
  }
}

/**覆盖物圆形 */
export class OverlayCirclePrimitive {
  private _styleOptions: StyleOptions
  private _center: Coordinate = [0, 0, 0]
  private _radius: number = 0
  private _circle: Cesium.GroundPrimitive | Cesium.Primitive | null = null
  private _circleOutline:
    | Cesium.GroundPolylinePrimitive
    | Cesium.Primitive
    | null = null
  private _label: Cesium.LabelCollection
  private _isGround: boolean = true
  private _mode: Cesium.SceneMode = Cesium.SceneMode.SCENE3D
  /**是否异步创建几何体 */
  asynchronous: boolean
  show: boolean = true
  center: Coordinate = [0, 0]
  radius: number = 0
  props: any
  isGround: boolean = true
  primitiveType: PrimitiveType
  flightAreaHeight: number

  constructor(overlayOptions: OverlayPrimitiveProps) {
    this._styleOptions = overlayOptions.styleOptions
    this.props = overlayOptions.props
    this.asynchronous = overlayOptions.asynchronous ?? true
    this.isGround = overlayOptions.isGround ?? true
    this._label = new Cesium.LabelCollection()
    this.primitiveType = overlayOptions.primitiveType ?? 'OVERLAY'
    this.flightAreaHeight = overlayOptions.flightAreaHeight ?? 0
  }

  update(frameState: any) {
    if (
      this._center !== this.center ||
      this._radius !== this.radius ||
      this._isGround !== this.isGround ||
      this._mode !== frameState.mode
    ) {
      this._center = this.center
      this._radius = this.radius
      this._isGround = this.isGround
      this._mode = frameState.mode
      this.updateGeometry(frameState)
    }

    if (this._circleOutline) {
      this._circleOutline.appearance.material.uniforms.u_pixelSizeInMeters =
        getPixelSizeInMeters(frameState)
    }

    if (this._circle) {
      // @ts-ignore
      this._circle.update(frameState)
    }
    if (this._circleOutline) {
      // @ts-ignore
      this._circleOutline.update(frameState)
    }
    if (this._label.length > 0) {
      // @ts-ignore
      this._label.update(frameState)
    }
  }

  private async updateGeometry(frameState?: any) {
    const oldCircle = this._circle
    const oldCircleOutline = this._circleOutline

    if (this._radius <= 0) {
      this._circle = null
      this._circleOutline = null
      return
    }

    this._circle = await createCircle(this.getCreateOptions())
    this._circleOutline = await createCircleOutline(this.getCreateOptions())

    if (this._circle) {
      // @ts-ignore
      this._circle.props = this.props
    }
    if (this._circleOutline) {
      // @ts-ignore
      this._circleOutline.props = this.props
    }

    this._label.removeAll()
    if (this.styleOptions.label) {
      let cneterCartesian = this.cartesianCenter
      if (this._isGround && frameState) {
        const scene = frameState.camera._scene as Cesium.Scene
        const cartographic = Cesium.Cartographic.fromCartesian(
          this.cartesianCenter,
        )
        const height = scene?.globe?.getHeight(cartographic)
        // 没有高度或者高度小于-100可能是刚开始地形没加载好，1秒后再次尝试
        if (!height || height < -100) {
          setTimeout(() => {
            this.updateGeometry(frameState)
          }, 1000)
        }
        cneterCartesian = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          height,
        )
      }
      this._label.add(createLabel(cneterCartesian, this.styleOptions))
      // @ts-ignore
      this._label.get(0)!.props = this.props
    }

    if (oldCircle && oldCircle.isDestroyed() === false) {
      oldCircle.destroy()
    }
    if (oldCircleOutline && oldCircleOutline.isDestroyed() === false) {
      oldCircleOutline.destroy()
    }
  }

  isDestroyed() {
    return false
  }

  destroy() {
    this._radius = 0
    this._circle?.destroy()
    this._circleOutline?.destroy()
    this._label.destroy()
  }

  /**获取或设置几何样式 */
  get styleOptions() {
    return this._styleOptions
  }

  set styleOptions(val: StyleOptions) {
    this._styleOptions = val
    this.updateGeometry()
  }

  get cartesianCenter() {
    return Cesium.Cartesian3.fromDegrees(
      this._center[0],
      this._center[1],
      this._center?.[2] ?? 0,
    )
  }

  getCreateOptions(): Parameters<typeof createCircle>[0] {
    return {
      center: this.center,
      radius: this._radius || 100000,
      styleOptions: this._styleOptions,
      asynchronous: this.asynchronous,
      isGround: this._isGround,
      primitiveType: this.primitiveType,
      flightAreaHeight: this.flightAreaHeight,
      mode: this._mode,
    }
  }

  setProps(data: any) {
    this.props = data
    this.updateGeometry()
  }

  /**通过圆的中点和半径获取经纬度坐标，整个圆的高度为中心点的高度 */
  static getCoordinates(center: Coordinate, radius: number) {
    const circle = turf.circle(center, radius, {
      steps: CIRCLE_POINT_NUMBER,
      units: 'meters',
    })

    const coords = circle.geometry.coordinates[0].map((coord) => [
      coord[0],
      coord[1],
      center?.[2] ?? 0,
    ])

    return coords
  }
}

/**覆盖物扇形 */
export class OverlayFanPrimitive {
  private _positions: Coordinate[] = []
  private _fan: Cesium.GroundPrimitive | Cesium.Primitive | null = null
  private _fanOutline:
    | Cesium.GroundPolylinePrimitive
    | Cesium.Primitive
    | null = null
  private _label: Cesium.LabelCollection
  private _isGround: boolean = true
  private _styleOptions: StyleOptions
  private _mode: Cesium.SceneMode = Cesium.SceneMode.SCENE3D
  /**是否异步创建几何体 */
  asynchronous: boolean
  /**[pivot, startPoint, endPoint]，[支点，起点、终点] */
  positions: Coordinate[] = []
  show: boolean = true
  isGround: boolean = true
  props: any
  primitiveType: PrimitiveType
  flightAreaHeight: number

  constructor(overlayOptions: OverlayPrimitiveProps) {
    this._styleOptions = overlayOptions.styleOptions
    this._label = new Cesium.LabelCollection()
    this.props = overlayOptions.props
    this.asynchronous = overlayOptions.asynchronous ?? true
    this.isGround = overlayOptions.isGround ?? true
    this.primitiveType = overlayOptions.primitiveType ?? 'OVERLAY'
    this.flightAreaHeight = overlayOptions.flightAreaHeight ?? 0
  }

  update(frameState: any) {
    if (
      this.positions !== this._positions ||
      this._isGround !== this.isGround ||
      this._mode !== frameState.mode
    ) {
      this._positions = this.positions
      this._isGround = this.isGround
      this._mode = frameState.mode
      this.updateGeometry(frameState)
    }

    if (this._fanOutline) {
      this._fanOutline.appearance.material.uniforms.u_pixelSizeInMeters =
        getPixelSizeInMeters(frameState)
    }

    if (this._fan) {
      // @ts-ignore
      this._fan.update(frameState)
    }
    if (this._fanOutline) {
      // @ts-ignore
      this._fanOutline.update(frameState)
    }
    // @ts-ignore
    this._label.update(frameState)
  }

  private async updateGeometry(frameState?: any) {
    const oldFan = this._fan
    const oldFanOutline = this._fanOutline

    if (this._positions.length <= 1) {
      this._fanOutline = null
      this._fan = null
    } else if (this._positions.length === 2) {
      this._fanOutline = await createPolyline(this.getCreateOptions())
      this._fan = null
    } else {
      const fanPositions = this.fanCoordnates.map((point) =>
        Cesium.Cartesian3.fromDegrees(point[0], point[1], point?.[2] ?? 0),
      )
      this._fanOutline = await createPolyline(
        this.getCreateOptions([...fanPositions, fanPositions[0]]),
      )
      this._fan = await createPolygon(this.getCreateOptions(fanPositions))

      if (this._fan) {
        // @ts-ignore
        this._fan.props = this.props
      }
      if (this._fanOutline) {
        // @ts-ignore
        this._fanOutline.props = this.props
      }

      // label值不为空才创建
      this._label.removeAll()
      if (this.styleOptions.label) {
        const center = getCenter(this.fanCoordnates)
        let cneterCartesian = Cesium.Cartesian3.fromDegrees(
          center[0],
          center[1],
          center?.[2] ?? 0,
        )
        if (this._isGround && frameState) {
          const scene = frameState.camera._scene as Cesium.Scene
          const height = scene?.globe?.getHeight(
            Cesium.Cartographic.fromDegrees(center[0], center[1]),
          )
          // 没有高度或者高度小于-100可能是刚开始地形没加载好，1秒后再次尝试
          if (!height || height < -100) {
            setTimeout(() => {
              this.updateGeometry(frameState)
            }, 1000)
          }
          cneterCartesian = Cesium.Cartesian3.fromDegrees(
            center[0],
            center[1],
            height,
          )
        }
        this._label.add(createLabel(cneterCartesian, this.styleOptions))
        // @ts-ignore
        this._label.get(0)!.props = this.props
      }
    }

    if (oldFan && oldFan.isDestroyed() === false) {
      oldFan.destroy()
    }
    if (oldFanOutline && oldFanOutline.isDestroyed() === false) {
      oldFanOutline.destroy()
    }
  }

  isDestroyed() {
    return false
  }

  destroy() {
    this._positions = []
    this._fan?.destroy()
    this._fanOutline?.destroy()
    this._label.destroy()
  }

  /**获取或设置几何样式 */
  get styleOptions() {
    return this._styleOptions
  }

  set styleOptions(val: StyleOptions) {
    this._styleOptions = val
    this.updateGeometry()
  }

  get cartesianPositions() {
    return this._positions.map((coord) =>
      Cesium.Cartesian3.fromDegrees(coord[0], coord[1], coord?.[2] ?? 0),
    )
  }

  getCreateOptions(
    positions?: Cesium.Cartesian3[],
  ): Parameters<typeof createPolygon>[0] {
    return {
      positions: positions || this.cartesianPositions,
      styleOptions: this.styleOptions,
      asynchronous: this.asynchronous,
      isGround: this._isGround,
      primitiveType: this.primitiveType,
      flightAreaHeight: this.flightAreaHeight,
      mode: this._mode,
    }
  }

  /**根据三个支点生成的类扇形多边形点 */
  get fanCoordnates() {
    const [pivot, startPoint, endPoint] = this._positions

    const pp = turf.point(pivot)
    const sp = turf.point(startPoint)
    const ep = turf.point(endPoint)
    const startBearing = (turf.rhumbBearing(pp, sp) + 360) % 360
    let endBearing = (turf.rhumbBearing(pp, ep) + 360) % 360
    if (endBearing < startBearing) {
      endBearing += 360
    }
    const distance = turf.distance(pp, ep)
    const res = [pivot]
    for (let current = startBearing; current < endBearing; current += 2) {
      let bearing = current
      if (bearing >= 360) {
        bearing -= 360
      }
      if (bearing > 180) {
        bearing -= 360
      }
      const newPoint = turf.destination(pp, distance, bearing)
      res.push(newPoint.geometry.coordinates as [number, number])
    }
    res.push(
      turf.destination(pp, distance, endBearing).geometry
        .coordinates as Coordinate,
    )

    res.forEach((coord) => {
      coord[2] = pivot[2] ?? 0
    })
    return res
  }

  setProps(data: any) {
    this.props = data
    this.updateGeometry()
  }

  static getCoordinates(
    pivot: Coordinate,
    startPoint: Coordinate,
    endPoint: Coordinate,
  ) {
    const pp = turf.point(pivot)
    const sp = turf.point(startPoint)
    const ep = turf.point(endPoint)
    const startBearing = (turf.rhumbBearing(pp, sp) + 360) % 360
    let endBearing = (turf.rhumbBearing(pp, ep) + 360) % 360
    if (endBearing < startBearing) {
      endBearing += 360
    }
    const distance = turf.distance(pp, ep)
    const res = [pivot]
    for (let current = startBearing; current < endBearing; current += 2) {
      let bearing = current
      if (bearing >= 360) {
        bearing -= 360
      }
      if (bearing > 180) {
        bearing -= 360
      }
      const newPoint = turf.destination(pp, distance, bearing)
      res.push(newPoint.geometry.coordinates as [number, number])
    }
    res.push(
      turf.destination(pp, distance, endBearing).geometry
        .coordinates as Coordinate,
    )

    res.forEach((coord) => {
      coord[2] = pivot[2] ?? 0
    })

    return res
  }
}

/**拖拽点集合，可以开启贴地 */
export class DragPointCollection {
  private _pointCollection: Cesium.PointPrimitiveCollection
  private _positions: Coordinate[]
  private _viewer: Cesium.Viewer
  private _clampToGround: boolean
  positions: Coordinate[]
  /**点是否开启贴地 */
  clampToGround: boolean

  constructor(
    positions: Coordinate[],
    viewer: Cesium.Viewer,
    clampToGround: boolean = true,
  ) {
    this.positions = positions
    this._positions = [...positions]
    this._pointCollection = new Cesium.PointPrimitiveCollection()
    this._viewer = viewer
    this._clampToGround = clampToGround
    this.clampToGround = clampToGround
  }

  update(frameState: any) {
    if (this._positions !== this.positions) {
      this._positions = this.positions
      this.updateGeometry()
    }

    // @ts-ignore
    this._pointCollection.update(frameState)
  }

  private updateGeometry() {
    this._pointCollection.removeAll()
    this._positions.forEach((coord, index) => {
      const carto = Cesium.Cartographic.fromDegrees(coord[0], coord[1])
      if (this._clampToGround) {
        const height = this._viewer.scene.globe.getHeight(carto)
        carto.height = height || 0
      }
      const position = Cesium.Cartographic.toCartesian(carto)

      this._pointCollection.add(createDragPoint(position))
      this._pointCollection.get(index).id = Math.random()
        .toString(36)
        .slice(2, 12)
    })
  }

  isDestroyed() {
    return false
  }

  destroy() {
    this.positions = []
    this._positions = []
    this._pointCollection.removeAll()
    this._pointCollection.destroy()
  }

  indexOf(pointPrimitive: Cesium.PointPrimitive) {
    for (let i = 0; i < this._pointCollection.length; i++) {
      const point = this._pointCollection.get(i)
      if (point.id === pointPrimitive.id) {
        return i
      }
    }
    return -1
  }
}
