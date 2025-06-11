import * as turf from '@turf/turf';
import * as Cesium from 'cesium';
import customDashedShader from './customDashed.glsl?raw'
import noFlyPolylineShader from './noFlyPolyline.glsl?raw'

export type StyleOptions = {
  /**填充颜色 */
  fill: string;
  /**描边颜色，透明度为1 */
  stroke: string;
  /**中心标注文字 */
  label: string;
  /**填充颜色 */
  fillOpacity: number;
  /**描边类型 */
  strokeStyle: 'solid' | 'dashed' | 'no-fly';
  /**描边宽度, 如果为禁飞区，那么宽度无法设置为一个固定值 */
  strokeWeight: number;
};

type Label = {
  show?: boolean;
  position: Cesium.Cartesian3;
  text: string;
  font?: string;
  fillColor?: Cesium.Color;
  outlineColor?: Cesium.Color;
  outlineWidth?: number;
  showBackground?: false;
  backgroundColor?: Cesium.Color;
  backgroundPadding?: Cesium.Cartesian2;
  style?: Cesium.LabelStyle;
  pixelOffset?: Cesium.Cartesian2;
  eyeOffset?: Cesium.Cartesian3;
  horizontalOrigin?: Cesium.HorizontalOrigin;
  verticalOrigin?: Cesium.VerticalOrigin;
  scale?: number;
  translucencyByDistance?: Cesium.NearFarScalar;
  pixelOffsetScaleByDistance?: Cesium.NearFarScalar;
  scaleByDistance?: Cesium.NearFarScalar;
  heightReference?: Cesium.HeightReference;
  distanceDisplayCondition?: Cesium.DistanceDisplayCondition;
  disableDepthTestDistance?: number;
};
function createLabel(
  position: Cesium.Cartesian3,
  styleOptions: StyleOptions,
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
  };
}

type Point = {
  position: Cesium.Cartesian3;
  show?: boolean;
  pixelSize?: number;
  color?: Cesium.Color;
  outlineColor?: Cesium.Color;
  outlineWidth?: number;
  id?: any;
  disableDepthTestDistance?: number;
  distanceDisplayCondition?: Cesium.DistanceDisplayCondition;
  scaleByDistance?: Cesium.NearFarScalar;
  translucencyByDistance?: Cesium.NearFarScalar;
};
function createDragPoint(position: Cesium.Cartesian3): Point {
  return {
    position,
    color: Cesium.Color.WHITE,
    pixelSize: 8,
    outlineColor: Cesium.Color.BLACK,
    outlineWidth: 1,
    disableDepthTestDistance: 1000000,
  };
}

function createPolyline(
  positions: Cesium.Cartesian3[],
  styleOptions: StyleOptions,
  asynchronous: boolean = true,
) {
  let u_polylineLength = 0;
  for (let i = 1; i < positions.length; i++) {
    u_polylineLength += Cesium.Cartesian3.distance(
      positions[i],
      positions[i - 1],
    );
  }

  let material;
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
    });
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
    });
  }
  else {
    material = Cesium.Material.fromType(Cesium.Material.ColorType, {
      color: Cesium.Color.fromCssColorString(styleOptions.stroke),
    });
  }

  return new Cesium.GroundPolylinePrimitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.GroundPolylineGeometry({
        positions,
        width: styleOptions.strokeStyle === 'no-fly' ? 10 : styleOptions.strokeWeight,
      }),
    }),
    appearance: new Cesium.PolylineMaterialAppearance({
      material: material,
    }),
    asynchronous,
  });
}

function createPolygon(
  positions: Cesium.Cartesian3[],
  styleOptions: StyleOptions,
  asynchronous: boolean = true,
) {
  return new Cesium.GroundPrimitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(positions),
        vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
      }),
    }),
    appearance: new Cesium.PolylineMaterialAppearance({
      material: Cesium.Material.fromType('Color', {
        color: Cesium.Color.fromCssColorString(styleOptions.fill).withAlpha(
          styleOptions.fillOpacity,
        ),
      }),
    }),
    asynchronous,
  });
}

const CIRCLE_POINT_NUMBER = 180;
function createCircle(
  center: [number, number],
  radius: number,
  styleOptions: StyleOptions,
  asynchronous: boolean = true,
) {
  const circle = turf.circle(center, radius, {
    steps: CIRCLE_POINT_NUMBER,
    units: 'meters',
  });

  const positions = circle.geometry.coordinates[0].map((coord) =>
    Cesium.Cartesian3.fromDegrees(coord[0], coord[1]),
  );

  return createPolygon(positions, styleOptions, asynchronous);
}

function createCircleOutline(
  center: [number, number],
  radius: number,
  styleOptions: StyleOptions,
  asynchronous: boolean = true,
) {
  const circle = turf.circle(center, radius, {
    steps: CIRCLE_POINT_NUMBER,
    units: 'meters',
  });

  const positions = circle.geometry.coordinates[0].map((coord) =>
    Cesium.Cartesian3.fromDegrees(coord[0], coord[1]),
  );

  return createPolyline(positions, styleOptions, asynchronous);
}

function getCenter(points: number[][]) {
  const features = turf.points(points);
  const center = turf.center(features);
  return center.geometry.coordinates;
};

// 所有的几何图形如果想要更新需要改变position的地址，而不能通过push这些方法

/**覆盖物多边形 */
export class OverlayPolygonPrimitive {
  private _positions: [number, number][] = [];
  private _polygon: Cesium.GroundPrimitive | null = null;
  private _polygonOutline: Cesium.GroundPolylinePrimitive | null = null;
  private _label: Cesium.LabelCollection;
  private _styleOptions: StyleOptions;
  /**是否异步创建几何体 */
  asynchronous: boolean;
  positions: [number, number][] = [];
  show: boolean = true;
  props: any;

  constructor(styleOptions: StyleOptions, asynchronous?: boolean, props?: any) {
    this._styleOptions = styleOptions;
    this._label = new Cesium.LabelCollection();
    this.props = props;
    this.asynchronous = asynchronous ?? true;
  }

  update(frameState: any) {
    if (this.positions !== this._positions) {
      this._positions = this.positions;
      this.updateGeometry();
    }

    // 计算并更新每个像素的大小，为了自定义折线效果
    const camera = frameState.camera as Cesium.Camera;
    const canvas = frameState.context._canvas;

    const cneterPosition = camera.pickEllipsoid(
      new Cesium.Cartesian2(canvas.width / 2, canvas.height / 2),
    );
    const pixelSizeInMeters = camera.getPixelSize(
      new Cesium.BoundingSphere(cneterPosition, 0.1),
      canvas.width,
      canvas.height,
    );
    if (this._polygonOutline) {
      this._polygonOutline.appearance.material.uniforms.u_pixelSizeInMeters =
        pixelSizeInMeters;
    }

    // @ts-ignore
    this._polygon && this._polygon.update(frameState);
    // @ts-ignore
    this._polygonOutline && this._polygonOutline.update(frameState);
    // @ts-ignore
    this._label.update(frameState);
  }

  private updateGeometry() {
    if (this._positions.length <= 1) {
      this._polygonOutline = null;
      this._polygon = null;
    } else if (this._positions.length === 2) {
      this._polygonOutline = createPolyline(
        this.cartesianPositions,
        this.styleOptions,
        this.asynchronous,
      );
      this._polygon = null;
    } else {
      const closedPositions = [
        ...this.cartesianPositions,
        this.cartesianPositions[0],
      ];
      this._polygonOutline = createPolyline(
        closedPositions,
        this.styleOptions,
        this.asynchronous,
      );
      this._polygon = createPolygon(
        this.cartesianPositions,
        this.styleOptions,
        this.asynchronous,
      );

      if (this._polygon) {
        // @ts-ignore
        this._polygon.props = this.props;
      }
      if (this._polygonOutline) {
        // @ts-ignore
        this._polygonOutline.props = this.props;
      }

      // label值不为空才创建
      this._label.removeAll();
      if (this.styleOptions.label) {
        const center = getCenter(this._positions);
        this._label.add(
          createLabel(
            Cesium.Cartesian3.fromDegrees(center[0], center[1]),
            this.styleOptions,
          ),
        );
        // @ts-ignore
        this._label.get(0)!.props = this.props;
      }
    }
  }

  isDestroyed() {
    return false;
  }

  destroy() {
    this._positions = [];
    this._polygon?.destroy();
    this._polygonOutline?.destroy();
    this._label.destroy();
  }

  /**获取或设置几何样式 */
  get styleOptions() {
    return this._styleOptions;
  }

  set styleOptions(val: StyleOptions) {
    this._styleOptions = val;
    this.updateGeometry();
  }

  get cartesianPositions() {
    return this._positions.map((coord) =>
      Cesium.Cartesian3.fromDegrees(coord[0], coord[1]),
    );
  }

  setProps(data: any) {
    this.props = data;
    this.updateGeometry();
  }
}

/**覆盖物圆形 */
export class OverlayCirclePrimitive {
  private _styleOptions: StyleOptions;
  private _center: [number, number] = [0, 0];
  private _radius: number = 0;
  private _circle: Cesium.GroundPrimitive | null = null;
  private _circleOutline: Cesium.GroundPolylinePrimitive | null = null;
  private _label: Cesium.LabelCollection;
  /**是否异步创建几何体 */
  asynchronous: boolean;
  show: boolean = true;
  center: [number, number] = [0, 0];
  radius: number = 0;
  props: any;

  constructor(styleOptions: StyleOptions, asynchronous: boolean, props: any) {
    this._styleOptions = styleOptions;
    this.props = props;
    this.asynchronous = asynchronous ?? true;
    this._label = new Cesium.LabelCollection();
  }

  update(frameState: any) {
    if (this._center !== this.center || this._radius !== this.radius) {
      this._center = this.center;
      this._radius = this.radius;
      this.updateGeometry();
    }

    // 计算并更新每个像素的大小，为了自定义折线效果
    const camera = frameState.camera as Cesium.Camera;
    const canvas = frameState.context._canvas;

    const cneterPosition = camera.pickEllipsoid(
      new Cesium.Cartesian2(canvas.width / 2, canvas.height / 2),
    );
    const pixelSizeInMeters = camera.getPixelSize(
      new Cesium.BoundingSphere(cneterPosition, 0.1),
      canvas.width,
      canvas.height,
    );
    if (this._circleOutline) {
      this._circleOutline.appearance.material.uniforms.u_pixelSizeInMeters =
        pixelSizeInMeters;
    }

    // @ts-ignore
    this._circle && this._circle.update(frameState);
    // @ts-ignore
    this._circleOutline && this._circleOutline.update(frameState);
    if (this._label.length > 0) {
      // @ts-ignore
      this._label.update(frameState);
    }
  }

  private updateGeometry() {
    if (this._radius <= 0) {
      this._circle = null;
      this._circleOutline = null;
      return;
    }

    this._circle = createCircle(
      this._center,
      this._radius || 100000,
      this._styleOptions,
      this.asynchronous,
    );
    this._circleOutline = createCircleOutline(
      this._center,
      this._radius || 100000,
      this._styleOptions,
      this.asynchronous,
    );

    if (this._circle) {
      // @ts-ignore
      this._circle.props = this.props;
    }
    if (this._circleOutline) {
      // @ts-ignore
      this._circleOutline.props = this.props;
    }

    this._label.removeAll();
    if (this.styleOptions.label) {
      this._label.add(createLabel(this.cartesianCenter, this.styleOptions));
      // @ts-ignore
      this._label.get(0)!.props = this.props;
    }
  }

  isDestroyed() {
    return false;
  }

  destroy() {
    this._radius = 0;
    this._circle?.destroy();
    this._circleOutline?.destroy();
    this._label.destroy();
  }

  /**获取或设置几何样式 */
  get styleOptions() {
    return this._styleOptions;
  }

  set styleOptions(val: StyleOptions) {
    this._styleOptions = val;
    this.updateGeometry();
  }

  get cartesianCenter() {
    return Cesium.Cartesian3.fromDegrees(this._center[0], this._center[1]);
  }

  setProps(data: any) {
    this.props = data;
    this.updateGeometry();
  }
}

/**覆盖物扇形 */
export class OverlayFanPrimitive {
  private _positions: [number, number][] = [];
  private _fan: Cesium.GroundPrimitive | null = null;
  private _fanOutline: Cesium.GroundPolylinePrimitive | null = null;
  private _label: Cesium.LabelCollection;
  private _styleOptions: StyleOptions;
  /**是否异步创建几何体 */
  asynchronous: boolean;
  /**[pivot, startPoint, endPoint]，[支点，起点、终点] */
  positions: [number, number][] = [];
  show: boolean = true;
  props: any;

  constructor(styleOptions: StyleOptions, asynchronous?: boolean, props?: any) {
    this._styleOptions = styleOptions;
    this._label = new Cesium.LabelCollection();
    this.props = props;
    this.asynchronous = asynchronous ?? true;
  }

  update(frameState: any) {
    if (this.positions !== this._positions) {
      this._positions = this.positions;
      this.updateGeometry();
    }

    // 计算并更新每个像素的大小，为了自定义折线效果
    const camera = frameState.camera as Cesium.Camera;
    const canvas = frameState.context._canvas;

    const cneterPosition = camera.pickEllipsoid(
      new Cesium.Cartesian2(canvas.width / 2, canvas.height / 2),
    );
    const pixelSizeInMeters = camera.getPixelSize(
      new Cesium.BoundingSphere(cneterPosition, 0.1),
      canvas.width,
      canvas.height,
    );
    if (this._fanOutline) {
      this._fanOutline.appearance.material.uniforms.u_pixelSizeInMeters =
        pixelSizeInMeters;
    }

    // @ts-ignore
    this._fan && this._fan.update(frameState);
    // @ts-ignore
    this._fanOutline && this._fanOutline.update(frameState);
    // @ts-ignore
    this._label.update(frameState);
  }

  private updateGeometry() {
    if (this._positions.length <= 1) {
      this._fanOutline = null;
      this._fan = null;
    } else if (this._positions.length === 2) {
      this._fanOutline = createPolyline(
        this.cartesianPositions,
        this.styleOptions,
        this.asynchronous,
      );
      this._fan = null;
    } else {
      this._fanOutline = createPolyline(
        [...this.fanPositions, this.fanPositions[0]],
        this.styleOptions,
        this.asynchronous,
      );
      this._fan = createPolygon(
        this.fanPositions,
        this.styleOptions,
        this.asynchronous,
      );

      if (this._fan) {
        // @ts-ignore
        this._fan.props = this.props;
      }
      if (this._fanOutline) {
        // @ts-ignore
        this._fanOutline.props = this.props;
      }

      // label值不为空才创建
      this._label.removeAll();
      if (this.styleOptions.label) {
        const center = getCenter(this._positions);
        this._label.add(
          createLabel(
            Cesium.Cartesian3.fromDegrees(center[0], center[1]),
            this.styleOptions,
          ),
        );
        // @ts-ignore
        this._label.get(0)!.props = this.props;
      }
    }
  }

  isDestroyed() {
    return false;
  }

  destroy() {
    this._positions = [];
    this._fan?.destroy();
    this._fanOutline?.destroy();
    this._label.destroy();
  }

  /**获取或设置几何样式 */
  get styleOptions() {
    return this._styleOptions;
  }

  set styleOptions(val: StyleOptions) {
    this._styleOptions = val;
    this.updateGeometry();
  }

  get cartesianPositions() {
    return this._positions.map((coord) =>
      Cesium.Cartesian3.fromDegrees(coord[0], coord[1]),
    );
  }

  /**根据三个支点生成的类扇形多边形点 */
  get fanPositions() {
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
    res.push(turf.destination(pp, distance, endBearing).geometry.coordinates as [number, number])

    return res.map(point => Cesium.Cartesian3.fromDegrees(point[0], point[1]))
  }

  setProps(data: any) {
    this.props = data;
    this.updateGeometry();
  }
}

/**拖拽点集合 */
export class DragPointCollection {
  private _pointCollection: Cesium.PointPrimitiveCollection;
  private _positions: [number, number][];
  positions: [number, number][];

  constructor(positions: [number, number][]) {
    this.positions = positions;
    this._positions = [...positions];
    this._pointCollection = new Cesium.PointPrimitiveCollection();
  }

  update(frameState: any) {
    if (this._positions !== this.positions) {
      this._positions = this.positions;
      this.updateGeometry();
    }

    // @ts-ignore
    this._pointCollection.update(frameState);
  }

  private updateGeometry() {
    this._pointCollection.removeAll();
    this._positions.forEach((coord, index) => {
      const position = Cesium.Cartesian3.fromDegrees(coord[0], coord[1]);
      this._pointCollection.add(createDragPoint(position));
      this._pointCollection.get(index).id = Math.random()
        .toString(36)
        .slice(2, 12);
    });
  }

  isDestroyed() {
    return false;
  }

  destroy() {
    this.positions = [];
    this._positions = [];
    this._pointCollection.removeAll();
    this._pointCollection.destroy();
  }

  indexOf(pointPrimitive: Cesium.PointPrimitive) {
    for (let i = 0; i < this._pointCollection.length; i++) {
      const point = this._pointCollection.get(i);
      if (point.id === pointPrimitive.id) {
        return i;
      }
    }
    return -1;
  }
}
