import * as Cesium from 'cesium'

function computeCircle(radius: number) {
  const positions: Cesium.Cartesian2[] = []
  for (let i = 0; i < 360; i++) {
    const radians = Cesium.Math.toRadians(i)
    positions.push(
      new Cesium.Cartesian2(
        radius * Math.cos(radians),
        radius * Math.sin(radians),
      ),
    )
  }
  return positions
}

const Cartesian3 = Cesium.Cartesian3
const add = Cartesian3.add
const subtract = Cartesian3.subtract
const multiply = Cartesian3.multiplyByScalar
const normalize = Cartesian3.normalize
const distance = Cartesian3.distance
const dot = Cartesian3.dot

type WalylinePrimitiveOptions = {
  positions: [number, number, number][]
  /**航线体的半径。默认值：3 */
  radius: number
  /**指示器的长度。单位：米。默认值：20 */
  indicatorLength: number
  /**指示器前进的速率。单位：米/秒，默认值：200 */
  indicatorSpeed: number
  /**指示器之间的间隔。单位：米，默认值：indicatorSpeed * 2 = 400 */
  indicatorSpace: number
}

type IndicatorStateType = {
  front: Cesium.Cartesian3
  rear: Cesium.Cartesian3
  dis: number
  show: boolean
}

// 航线在地图上从左向右，也就是从西向北，那么航线左边为startPosition，右边为endPosition
// 而其中的所有指示器的第一个在最右边，
// 因为移动方向是从左向右的，所以在指示器内左边为尾部，右边为头部
 
export default class WalylinePrimitive {
  private _positions: [number, number, number][] = []
  private _radius: number = 0
  /**上一次更新指示器的时间 */
  private _preUpdateTime: number = 0
  /**当前所有指示器的头部的位置 */
  private _indictorStates: IndicatorStateType[] = []
  private _indicatorPrimitive: Cesium.Primitive | null = null
  private _waylineVolumePrimitive: Cesium.Primitive | null = null
  positions: [number, number, number][]
  /**当前正在第几段段航线上移动 */
  activeFragment: number = 0
  radius: number
  indicatorLength: number
  indicatorSpeed: number
  indicatorSpace: number
  _waylineLength: number = 0

  constructor(options?: Partial<WalylinePrimitiveOptions>) {
    const newOptions: WalylinePrimitiveOptions = {
      radius: 3,
      positions: [],
      indicatorLength: 10,
      indicatorSpeed: 100,
      indicatorSpace: 300,
      ...options,
    }
    this.radius = newOptions.radius
    this.positions = newOptions.positions
    this.indicatorLength = newOptions.indicatorLength
    this.indicatorSpeed = newOptions.indicatorSpeed
    this.indicatorSpace = newOptions.indicatorSpace
  }

  private update(frameState: any) {
    if (this._positions !== this.positions || this._radius !== this.radius) {
      this._positions = this.positions
      this._radius = this.radius
      this._waylineLength = this.calcWaylineLength()
      this.updateWayline()
    }
    this.updateIndicator()

    // @ts-ignore
    this._waylineVolumePrimitive?.update(frameState)
    // @ts-ignore
    this._indicatorPrimitive?.update(frameState)
  }

  private updateWayline() {
    const oldWaylineVolume = this._waylineVolumePrimitive
    if (this._positions.length < 2) {
      this._waylineVolumePrimitive = null
    } else {
      this._waylineVolumePrimitive = new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry: new Cesium.PolylineVolumeGeometry({
            polylinePositions: this._positions.map((item) =>
              Cartesian3.fromDegrees(item[0], item[1], item[2]),
            ),
            shapePositions: computeCircle(this._radius),
          }),
        }),
        appearance: new Cesium.MaterialAppearance({
          material: new Cesium.Material({
            fabric: {
              type: 'gradientVolume',
              uniforms: {
                color: new Cesium.Color(0.3, 0.8, 0.4, 1),
                minMaxOpacity: new Cesium.Cartesian2(0.05, 0.6), // 透明变化，从中心向两边变化，x代表中心、y代表两侧的透明度
              },
              source: `
							uniform vec4 color;
							uniform vec2 minMaxOpacity;

							czm_material czm_getMaterial(czm_materialInput materialInput)
							{
								vec4 outColor = color;
								czm_material material = czm_getDefaultMaterial(materialInput);
								vec2 st = materialInput.st;

								// 中心透明，两侧不透明
								float alpha = 1.0 - (abs(st.t - 0.5) * 2.0);
								alpha = mix(minMaxOpacity.x, minMaxOpacity.y, alpha);

								material.diffuse = outColor.rgb;
								material.alpha = alpha;

								return material;
							}`,
            },
          }),
          flat: true,
        }),
        asynchronous: false,
      })
    }

    if (oldWaylineVolume && !oldWaylineVolume.isDestroyed()) {
      oldWaylineVolume.destroy()
    }
  }

  private updateIndicator() {
    const shouleUpdate = this.updateIndicatorPosition2()
    const oldIndicator = this._indicatorPrimitive

    if (!shouleUpdate) {
      this._indicatorPrimitive = null
    } else {
      const instances: Cesium.GeometryInstance[] = []
      for (let i = 0; i < this._indictorStates.length; i++) {
        if (!this._indictorStates[i].show) continue

        instances.push(
          new Cesium.GeometryInstance({
            geometry: new Cesium.PolylineVolumeGeometry({
              polylinePositions: [
                this._indictorStates[i].front.clone(),
                this._indictorStates[i].rear.clone(),
              ],
              shapePositions: computeCircle(this._radius),
            }),
          }),
        )
      }

      this._indicatorPrimitive = new Cesium.Primitive({
        geometryInstances: instances,
        appearance: new Cesium.MaterialAppearance({
          material: new Cesium.Material({
            fabric: {
              type: 'indicator',
              uniforms: {
                color: this.waylineColor,
                minMaxOpacity: this.waylineMinMaxOpacity,
              },
              source: `
							uniform vec4 color;
							uniform vec2 minMaxOpacity;

							czm_material czm_getMaterial(czm_materialInput materialInput)
							{
								vec4 outColor = color;
								czm_material material = czm_getDefaultMaterial(materialInput);
								vec2 st = materialInput.st;

								float alpha = 1.0;
								// float alpha = pow(abs(st.t - 0.5) * 2.0, 3.0);
								alpha *= 1.0 - pow(abs(st.s - 0.5) * 2.0, 1.5);

								// if(st.t < 0.5){
								// 	alpha = 0.0;
								// }
								alpha = mix(0.0, 0.8, alpha);

								material.diffuse = outColor.rgb;
								material.alpha = alpha;

								return material;
							}`,
            },
          }),
        }),
        asynchronous: false,
      })
    }

    if (oldIndicator && !oldIndicator.isDestroyed()) {
      oldIndicator.destroy()
    }
  }

  private updateIndicatorPosition(): boolean {
    if (this.activeFragment < 1) {
      console.log('this.activeFragment < 1')
      this._indictorStates = []
      return false
    }

    const startPosition = Cartesian3.fromDegrees(
      ...this._positions[this.activeFragment - 1],
    )
    const endPosition = Cartesian3.fromDegrees(
      ...this._positions[this.activeFragment],
    )
    const startToEndVector = subtract(
      endPosition,
      startPosition,
      new Cartesian3(),
    )
    normalize(startToEndVector, startToEndVector)
    const indicatorLengthVector = multiply(
      startToEndVector,
      this.indicatorLength,
      new Cartesian3(),
    )
    const fragmentLength = distance(startPosition, endPosition)

    if (fragmentLength < this.indicatorLength) {
      this._indictorStates = []
      console.log('fragmentLenght < this.indicatorLength')
      return false
    }

    // 该有的数量和位置数对不上则初始化
    const indicatorNumber = Math.max(
      Math.ceil(fragmentLength / (this.indicatorSpace + this.indicatorLength)),
      1,
    )
    if (this._indictorStates.length !== indicatorNumber) {
      this._indictorStates = []
      for (let i = 0; i < indicatorNumber; i++) {
        const subLength = (this.indicatorLength + this.indicatorSpace) * i
        const subPosition = multiply(
          startToEndVector,
          subLength,
          new Cartesian3(),
        )
        const indicatorFrontPosition = subtract(
          startPosition,
          subPosition,
          new Cartesian3(),
        )
        const indicatorRearPosition = subtract(
          indicatorFrontPosition,
          indicatorLengthVector,
          new Cartesian3(),
        )

        this._indictorStates.push({
          front: indicatorFrontPosition,
          rear: indicatorRearPosition,
          dis: 0,
          show: false,
        })
      }
      this._preUpdateTime = Date.now()
      console.log('this._curIndictorPosition === 0')
      return true
    }

    // 根据时间移动指示器位置
    const subTime = Date.now() - this._preUpdateTime
    const moveDistance = (subTime / 1000) * this.indicatorSpeed
    const moveVector = multiply(
      startToEndVector,
      moveDistance,
      new Cartesian3(),
    )
    for (const state of this._indictorStates) {
      const fronPosition = state.front
      const rearPosition = state.rear

      const nextFrontPosition = add(fronPosition, moveVector, new Cartesian3())
      const nextRearPosition = add(rearPosition, moveVector, new Cartesian3())

      const frontToEndVector = subtract(
        endPosition,
        nextFrontPosition,
        new Cartesian3(),
      )
      normalize(frontToEndVector, frontToEndVector)

      state.front = nextFrontPosition
      state.rear = nextRearPosition
    }

    const inside: IndicatorStateType[] = []
    const outside: IndicatorStateType[] = []
    // 当前某个指示器头部超出终点后，将其重置为最后的指示器
    for (const state of this._indictorStates) {
      const frontToEndVector = subtract(
        endPosition,
        state.front,
        new Cartesian3(),
      )

      if (dot(frontToEndVector, startToEndVector) < 0) {
        const latestIndicator =
          outside[outside.length - 1] ||
          this._indictorStates[this._indictorStates.length - 1]
        const latestIndicatroFront = latestIndicator.front
        const latestIndicatroRear = latestIndicator.rear

        const indicatorSpace = this.indicatorSpace + this.indicatorLength
        const spaceVector = multiply(
          startToEndVector,
          indicatorSpace,
          new Cartesian3(),
        )

        state.front = subtract(
          latestIndicatroFront,
          spaceVector,
          new Cartesian3(),
        )
        state.rear = subtract(
          latestIndicatroRear,
          spaceVector,
          new Cartesian3(),
        )

        outside.push(state)
      } else {
        inside.push(state)
      }
    }
    this._indictorStates = [...inside, ...outside]

    // 如果指示器完全在航线内则显示，否则隐藏
    for (const state of this._indictorStates) {
      const frontToEndVector = subtract(
        endPosition,
        state.front,
        new Cartesian3(),
      )
      const rearToStartVector = subtract(
        startPosition,
        state.rear,
        new Cartesian3(),
      )

      if (
        dot(rearToStartVector, startToEndVector) > 0 ||
        dot(frontToEndVector, startToEndVector) < 0
      ) {
        state.show = false
      } else {
        state.show = true
      }
    }

    this._preUpdateTime = Date.now()
    return true
  }

  private updateIndicatorPosition2(indicatorNumber = 6) {
    const positions = this._positions.map((item) =>
      Cartesian3.fromDegrees(item[0], item[1], item[2]),
    )
    const disSpace = this._waylineLength / indicatorNumber

    // 初始化
    if (this._indictorStates.length === 0) {
      for (let i = 0; i < indicatorNumber; i++) {
        const subDis = disSpace * i

        const fragmentNumber = this.getFragmentNumberByDistance(subDis)
        const limitWaylineLength = this.calcWaylineLength(fragmentNumber)
        const startPosition = positions[fragmentNumber - 1]
        const endPosition = positions[fragmentNumber]
        const startToEndVector = subtract(
          endPosition,
          startPosition,
          new Cartesian3(),
        )
        normalize(startToEndVector, startToEndVector)
        const indicatorLengthVector = multiply(
          startToEndVector,
          this.indicatorLength,
          new Cartesian3(),
        )

        const disVector = multiply(
          startToEndVector,
          subDis - limitWaylineLength,
          new Cesium.Cartesian3(),
        )

        const front = add(startPosition, disVector, new Cesium.Cartesian3())
        this._indictorStates.push({
          front: front,
          rear: subtract(front, indicatorLengthVector, new Cesium.Cartesian3()),
          dis: subDis,
          show: true,
        })
      }

      this._preUpdateTime = Date.now()

      return true
    }

    const subTime = Date.now() - this._preUpdateTime
    const moveDistance = (subTime / 1000) * this.indicatorSpeed
    this._preUpdateTime = Date.now()

    for (let i = 0; i < this._indictorStates.length; i++) {
      const state = this._indictorStates[i]
      state.dis += moveDistance
      if (state.dis > this._waylineLength) {
        state.dis = state.dis - this._waylineLength
      }

      const fragmentNumber = this.getFragmentNumberByDistance(state.dis)

      const limitWaylineLength = this.calcWaylineLength(fragmentNumber)
      const startPosition = positions[fragmentNumber - 1]
      const endPosition = positions[fragmentNumber]
      const startToEndVector = subtract(
        endPosition,
        startPosition,
        new Cartesian3(),
      )
      normalize(startToEndVector, startToEndVector)
      const indicatorLengthVector = multiply(
        startToEndVector,
        this.indicatorLength,
        new Cartesian3(),
      )

      const disVector = multiply(
        startToEndVector,
        state.dis - limitWaylineLength,
        new Cesium.Cartesian3(),
      )

      this._indictorStates[i].front = add(
        startPosition,
        disVector,
        new Cesium.Cartesian3(),
      )
      this._indictorStates[i].rear = subtract(
        this._indictorStates[i].front,
        indicatorLengthVector,
        new Cesium.Cartesian3(),
      )

      // 如果指示器完全在航线内则显示，否则隐藏
      const frontToEndVector = subtract(
        endPosition,
        state.front,
        new Cartesian3(),
      )
      const rearToStartVector = subtract(
        startPosition,
        state.rear,
        new Cartesian3(),
      )

      if (
        dot(rearToStartVector, startToEndVector) > 0 ||
        dot(frontToEndVector, startToEndVector) < 0
      ) {
        state.show = false
      } else {
        state.show = true
      }
    }

    return true
  }

  /**通过离第一个点的距离计算在第几个线段上 */
  getFragmentNumberByDistance(dis: number) {
    const positions = this._positions.map((item) =>
      Cartesian3.fromDegrees(item[0], item[1], item[2]),
    )

    let totalLength = 0
    for (let i = 1; i < positions.length; i++) {
      const left = positions[i - 1]
      const right = positions[i]
      const length = distance(left, right)

      const startLength = totalLength
      totalLength += length
      const endLength = totalLength

      if (dis >= startLength && dis < endLength) {
        return i
      }
    }

    return positions.length - 1
  }

  /**计算索引为 [0-positionNumber) 的航点组成的航线的长度
   * @param positionNumber 计算到第几个航点，也可以理解为有几个航点组成。
   */
  calcWaylineLength(positionNumber = Infinity) {
    if (positionNumber < 2) {
      return 0
    }

    const positions = this._positions
      .slice(0, positionNumber)
      .map((item) => Cartesian3.fromDegrees(item[0], item[1], item[2]))

    let totalLength = 0
    for (let i = 1; i < positions.length; i++) {
      const left = positions[i - 1]
      const right = positions[i]
      const length = distance(left, right)
      totalLength += length
    }

    return totalLength
  }

  get waylineColor() {
    return this._waylineVolumePrimitive?.appearance.material.uniforms.color
  }

  set waylineColor(newVal: Cesium.Color) {
    if (!this._waylineVolumePrimitive) return

    this._waylineVolumePrimitive.appearance.material.uniforms.color = newVal
  }

  get waylineMinMaxOpacity() {
    return this._waylineVolumePrimitive?.appearance.material.uniforms
      .minMaxOpacity
  }

  set waylineMinMaxOpacity(newVal: Cesium.Cartesian2) {
    if (!this._waylineVolumePrimitive) return

    this._waylineVolumePrimitive.appearance.material.uniforms.minMaxOpacity =
      newVal
  }

  destroy() {
    if (this._indicatorPrimitive && !this._indicatorPrimitive.isDestroyed()) {
      this._indicatorPrimitive.destroy()
    }
    if (
      this._waylineVolumePrimitive &&
      !this._waylineVolumePrimitive.isDestroyed()
    ) {
      this._waylineVolumePrimitive.destroy()
    }
  }

  isDestroyed() {
    return false
  }
}
