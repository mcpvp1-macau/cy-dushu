import * as Cesium from 'cesium'

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
  private _circle: Cesium.GroundPrimitive | null = null
  private _labelCollection: Cesium.LabelCollection
  private _polyline: Cesium.GroundPolylinePrimitive | null = null
  private _drawingColor: string
  private _completed: boolean = false

  constructor(drawingColor: string) {
    this._labelCollection = new Cesium.LabelCollection({
      blendOption: Cesium.BlendOption.TRANSLUCENT,
    })
    this._drawingColor = drawingColor

    this._labelCollection.add({
      font: '16px system-ui',
      fillColor: Cesium.Color.fromCssColorString('#fff'),
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString('rgba(25, 32, 47, 0.8)'),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
      pixelOffset: new Cesium.Cartesian2(0, -5),
    })

    this._labelCollection.add({
      font: '14px system-ui',
      fillColor: Cesium.Color.fromCssColorString('#fff'),
      showBackground: true,
      backgroundColor: Cesium.Color.fromCssColorString('rgba(25, 32, 47, 0.8)'),
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
    })
  }

  private update(frameState: any) {
    if (this._positions !== this.positions) {
      this._positions = this.positions
      this.updatePolyline()
      this.updateCircle()
      this.updateLabels()
      this.onChange && this.onChange(this.area, this.radius)
      this._completed = false
    }
    // @ts-ignore
    this._circle && this._circle.update(frameState)
    // @ts-ignore
    this._polyline && this._polyline.update(frameState)
    // @ts-ignore
    this._labelCollection.update(frameState)
  }

  private destroy() {
    this._positions = []
    this._circle && this._circle.destroy()
    this._polyline && this._polyline.destroy()
    this._labelCollection.destroy()
  }

  private isDestroyed() {
    return false
  }

  private updateCircle() {
    if (this._positions.length < 2) {
      this._circle = null
      return
    }

    this._circle = new Cesium.GroundPrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.CircleGeometry({
          center: this._positions[0],
          radius: this.radius,
        }),
      }),
      appearance: new Cesium.MaterialAppearance({
        translucent: true,
        material: new Cesium.Material({
          fabric: {
            type: 'colorWithOutline',
            uniforms: {
              color: Cesium.Color.fromCssColorString(
                this._drawingColor,
              ).withAlpha(0.5),
              outlineColor: Cesium.Color.fromCssColorString(this._drawingColor),
              outlineWidthPercent: 0.005,
            },
            source: `
              uniform vec4 color;
              uniform vec4 outlineColor;
              uniform float outlineWidthPercent;

              czm_material czm_getMaterial(czm_materialInput materialInput){
                czm_material material = czm_getDefaultMaterial(materialInput);
                vec2 st = materialInput.st;
                float dis = distance(st, vec2(0.5, 0.5));
                if(dis > 0.5 - outlineWidthPercent && dis < 0.5) {
                  material.diffuse = outlineColor.rgb;
                  material.alpha = outlineColor.a;
                }
                else {
                  material.diffuse = color.rgb;
                  material.alpha = color.a;
                }
                return material;
              }`,
          },
        }),
      }),
      asynchronous: false,
    })
  }

  private updatePolyline() {
    if (this._positions.length < 2) {
      this._polyline = null
      return
    }

    this._polyline = new Cesium.GroundPolylinePrimitive({
      geometryInstances: new Cesium.GeometryInstance({
        geometry: new Cesium.GroundPolylineGeometry({
          positions: this.positions,
          width: 2,
        }),
      }),
      appearance: new Cesium.PolylineMaterialAppearance({
        material: Cesium.Material.fromType(Cesium.Material.ColorType, {
          color: Cesium.Color.fromCssColorString(this._drawingColor),
        }),
      }),
      asynchronous: false,
    })
  }

  private updateLabels() {
    if (this._positions.length < 2) {
      this._labelCollection.get(0).show = false
      this._labelCollection.get(1).show = false
      return
    }

    const areaLabel = this._labelCollection.get(0)
    if (areaLabel) {
      areaLabel.position = this.positions[0]
      areaLabel.text = `${this.area.toFixed(3)}km²`
      areaLabel.show = true
    }

    const radiusLabel = this._labelCollection.get(1)
    if (radiusLabel) {
      radiusLabel.position = Cesium.Cartesian3.multiplyByScalar(
        Cesium.Cartesian3.add(
          this.positions[0],
          this.positions[1],
          new Cesium.Cartesian3(),
        ),
        0.5,
        new Cesium.Cartesian3(),
      )
      radiusLabel.text = `${this.radius.toFixed(2)}m`
      radiusLabel.show = true
    }
  }

  getAreaLabel() {
    return this._labelCollection.get(0)
  }

  /** 调用该方法指示完成绘制，以更改显示状态 */
  complete() {
    if (!this._polyline) return

    this._polyline = null
    this._labelCollection.remove(this._labelCollection.get(1))

    this._completed = true
  }

  /**获取当前绘制的面积，单位：km² */
  get area() {
    if (this.positions.length < 2) return 0

    const dis = Cesium.Cartesian3.distance(this.positions[0], this.positions[1])

    return (Math.PI * dis * dis) / 1000000
  }

  /**获取当前绘制的半径，单位：m */
  get radius() {
    if (this.positions.length < 2) return 100

    return Cesium.Cartesian3.distance(this._positions[0], this._positions[1])
  }

  /** 监听面积变化的回调，返回面积单位为km²，半径单位为m */
  onChange: ((area: number, radius: number) => void) | null = null
}
