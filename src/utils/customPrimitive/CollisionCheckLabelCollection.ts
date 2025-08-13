import * as Cesium from 'cesium'
import EventEmitter from './EventEmitter'

export type LabelOption = Parameters<Cesium.LabelCollection['add']>[0] & {
  id: any
  level: number
  /** 以左下角为起点扩展的碰撞检测范围，用于绑定标牌等其他图元一同参与检测 */
  extendBounds?: Cesium.Cartesian2
  data?: any
}

export interface ExtendLabel extends Cesium.Label {
  level: number
  extendBounds?: Cesium.Cartesian2
  data?: any
}

interface CesiumRectangleCollisionChecker {
  insert: (id: any, rectangle: Cesium.Rectangle) => void
  remove: (id: any, rectangle: Cesium.Rectangle) => void
  collides: (rectangle: Cesium.Rectangle) => boolean
  _tree: { clear: () => void }
}

// TODO 尝试实现淡入淡出动画成功但是非常卡顿，每帧都更新label样式会导致颜色等buffer不断重新生成与传递到gpu。
// 猜测只能尝试重写LabelCollection并为其添加uniform整体控制透明度的变化，暂时无法实现

/** 通过level作为权重进行文字避让的标注集合图元，用法与LabelCollection基本完全一致 */
class CollisionCheckLabelCollection extends EventEmitter<{
  collisionCheck: (labels: ExtendLabel[]) => void
}> {
  private _checkInterval: number
  private _labelCollection: Cesium.LabelCollection
  private _debugLabelRectangles: Cesium.PrimitiveCollection
  private _rectangleCollisionCheck: CesiumRectangleCollisionChecker
  /** 距离上一次检测过去了多少帧 */
  private _checkIntervalLatest: number = Infinity
  /** 渲染了多少帧。第一次渲染会立刻进行检测，之后才按照checkInterval进行检测。重新设置此值可以理解为立刻检测一次 */
  renderCount: number = 0
  /**当前viewer设置的resolution，用于调试时外界矩形正确的获取 */
  resolutionScale: number

  constructor(
    checkInterval: number = 1,
    debugShowRectangle: boolean = false,
    resolutionScale: number = 1,
  ) {
    super()
    this._labelCollection = new Cesium.LabelCollection()
    this._debugLabelRectangles = new Cesium.PrimitiveCollection()
    this._debugLabelRectangles.show = debugShowRectangle
    // @ts-ignore
    this._rectangleCollisionCheck = new Cesium.RectangleCollisionChecker()

    this._checkInterval = checkInterval
    this.resolutionScale = resolutionScale
  }

  update(frameState: any) {
    const scene = frameState.camera._scene as Cesium.Scene

    // 等第一帧渲染到屏幕后才能检测出正确结果，所以renderCount为1再进行检测
    if (
      this._checkIntervalLatest < this._checkInterval - 1 &&
      this.renderCount > 1
    ) {
      this._checkIntervalLatest++
    } else {
      this.useCollisionCheck(scene)
      this._checkIntervalLatest = 0
    }
    // @ts-ignore
    this._labelCollection.update(frameState)
    // @ts-ignore
    this._debugLabelRectangles.update(frameState)
    this.renderCount++
  }

  useCollisionCheck(scene: Cesium.Scene) {
    this._rectangleCollisionCheck._tree.clear()

    const sortLabels: ExtendLabel[] = []
    for (let i = 0; i < this.length; i++) {
      sortLabels.push(this.get(i))
    }
    sortLabels.sort((preLabel, nextLabel) => nextLabel.level - preLabel.level)

    const labelRectangles: Cesium.BoundingRectangle[] = []
    for (let i = 0; i < sortLabels.length; i++) {
      const label = sortLabels[i]
      const windowCoord = label.computeScreenSpacePosition(scene)
      if (!windowCoord) {
        label.show = false
        continue
      }
      const boundingRectangle: Cesium.BoundingRectangle = (
        Cesium.Label as any
      ).getScreenSpaceBoundingBox(label, windowCoord)
      const extendBounds = label.extendBounds || new Cesium.Cartesian2(0, 0)
      boundingRectangle.x *= this.resolutionScale
      boundingRectangle.y =
        scene.drawingBufferHeight -
        (boundingRectangle.y + boundingRectangle.height) * this.resolutionScale
      boundingRectangle.width *= this.resolutionScale
      boundingRectangle.height *= this.resolutionScale

      boundingRectangle.width += extendBounds.x * this.resolutionScale
      boundingRectangle.height += extendBounds.y * this.resolutionScale

      const { x, y, width, height } = boundingRectangle
      const west = x
      const south = y
      const east = x + width
      const north = y + height
      const rectangle = new Cesium.Rectangle(west, south, east, north)

      if (x === Infinity || y === Infinity) {
        continue
      }

      const isCollide = this._rectangleCollisionCheck.collides(rectangle)

      if (isCollide) {
        label.show = false
      } else {
        label.show = true
        this._rectangleCollisionCheck.insert(label.id, rectangle)

        if (this.debugShowRectangle) {
          if (
            boundingRectangle.width < 1000 &&
            boundingRectangle.height < 1000
          ) {
            labelRectangles.push(boundingRectangle)
          }
        }
      }
    }

    if (this._debugLabelRectangles.show) {
      this._debugLabelRectangles.removeAll()
      for (const rectangle of labelRectangles) {
        const viewportQuad = this._debugLabelRectangles.add(
          new Cesium.ViewportQuad(rectangle),
        )
        viewportQuad.material.uniforms.color = new Cesium.Color(
          1.0,
          1.0,
          1.0,
          0.6,
        )
      }
    }

    this.emit('collisionCheck', sortLabels)
  }

  get checkInterval() {
    return this._checkInterval
  }

  set checkInterval(interval) {
    if (interval <= 0 || parseInt('' + interval)! == interval) {
      throw Error('检测时间间隔必须为正整数')
    }
    this._checkInterval = interval
  }

  get length() {
    return this._labelCollection.length
  }

  get debugShowRectangle() {
    return this._debugLabelRectangles.show
  }

  set debugShowRectangle(show) {
    this._debugLabelRectangles.show = show
  }

  add(option: LabelOption) {
    const label = this._labelCollection.add(option) as ExtendLabel
    label.level = option.level
    label.data = option.data
    label.extendBounds = option.extendBounds

    return label
  }

  removeAll() {
    this._labelCollection.removeAll()
  }

  remove(labelOrIndex: ExtendLabel | Cesium.Label | number) {
    let res: boolean
    if (typeof labelOrIndex === 'number') {
      res = this._labelCollection.remove(this.get(labelOrIndex))
    } else {
      res = this._labelCollection.remove(labelOrIndex)
    }

    return res
  }

  get(index: number) {
    return this._labelCollection.get(index) as ExtendLabel
  }

  indexOf(label: Cesium.Label | ExtendLabel) {
    for (let i = 0; i < this.length; i++) {
      if (this.get(i) === label) {
        return i
      }
    }
    return -1
  }

  isDestroyed() {
    return false
  }

  destroy() {
    if (!this._labelCollection.isDestroyed()) {
      this._labelCollection.destroy()
    }
  }
}

export default CollisionCheckLabelCollection
