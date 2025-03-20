import {
  Viewer as CesiumViewer,
  Cartesian3 as CesiumCartesian3,
  Transforms as CesiumTransforms,
  Matrix4 as CesiumMatrix4,
  Matrix3 as CesiumMatrix3,
  Quaternion as CesiumQuaternion,
  Math as CesiumMath,
  HeadingPitchRoll as CesiumHeadingPitchRoll,
  GroundPrimitive,
  GeometryInstance,
  CircleGeometry,
  Cartesian3,
  MaterialAppearance,
  Material,
  Color,
} from 'cesium'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// @ts-ignore
import {
  Viewer as GSViewer,
  SceneRevealMode as GSSceneRevealMode,
  SplatRenderMode,
} from '@mkkellogg/gaussian-splats-3d'

type LoadOPtions = {
  layerAttr: API_RECONSTRUCTION.Layer
  splatUrl: string
  lat: number
  lon: number
  height: number
  headingPitchRoll: { heading: number; pitch: number; roll: number }
  scale: number | { x: number; y: number; z: number }
  camera:
    | {
        offset: { x: number; y: number; z: number } | undefined
        headingPitchRoll:
          | { heading: number; pitch: number; roll: number }
          | undefined
      }
    | undefined
}

// const SCALE_BASE = 1 / 10000;
const SCALE_BASE = 1 / 1

class CesiumThreeJS3DGS {
  cesiumViewer: CesiumViewer
  threeContainer: HTMLDivElement
  hiddenlayerIds: Set<number> = new Set()
  hiddenGroupIds: Set<number> = new Set()
  readySplatViewer: number = 0

  three: {
    renderer: THREE.WebGLRenderer | null
    camera: THREE.PerspectiveCamera | null
    scene: THREE.Scene | null
    controls: OrbitControls | null
    splatViewers: any[]
  } = {
    renderer: null,
    camera: null,
    scene: null,
    controls: null,
    splatViewers: [],
  }

  constructor(cesiumViewer: CesiumViewer) {
    this.cesiumViewer = cesiumViewer

    const threeContainer = document.createElement('div')
    this.threeContainer = threeContainer
    threeContainer.id = 'threeContainer'
    cesiumViewer.container.insertAdjacentElement('afterend', threeContainer)

    if (threeContainer) {
      threeContainer.style.inset = '0'
      threeContainer.style.width = '100%'
      threeContainer.style.height = '100%'
      threeContainer.style.position = 'absolute'
      threeContainer.style.pointerEvents = 'none'

      var fov = 45
      var width = window.innerWidth
      var height = window.innerHeight
      var aspect = width / height
      var near = 0.1 // * SCALE_BASE;
      var far = 50000 //* SCALE_BASE;  // TODO

      this.three.scene = new THREE.Scene()
      this.three.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
      this.three.renderer = new THREE.WebGLRenderer({
        alpha: true,
      })
      // 手动进行清楚操作
      this.three.renderer.autoClear = false
      this.threeContainer.appendChild(this.three.renderer.domElement)
    }
    this.three.camera!.matrixAutoUpdate = false
  }

  private updateCanvasSize() {
    if (
      this.threeContainer.clientWidth === this.three.renderer.domElement &&
      this.threeContainer.clientHeight === this.three.renderer.domElement
    ) {
      return
    }
    // 获取大小
    this.three.camera!.fov = CesiumMath.toDegrees(
      //@ts-ignore
      this.cesiumViewer.camera.frustum.fovy,
    )

    const width = this.threeContainer!.clientWidth
    const height = this.threeContainer!.clientHeight

    // 调整渲染器大小
    this.three.renderer!.setPixelRatio(window.devicePixelRatio)
    this.three.renderer!.setSize(width, height, true)
    // 矫正照相机的宽高比
    this.three.camera!.aspect = width / height
    this.three.camera!.updateProjectionMatrix()
  }

  private addSplatViewer(layerAttr: API_RECONSTRUCTION.Layer) {
    const gsViewer = new GSViewer({
      selfDrivenMode: false,
      renderer: this.three.renderer,
      camera: this.three.camera,
      useBuiltInControls: false,

      // dynamicScene: true,
      threeScene: this.three.scene,
      sceneRevealMode: GSSceneRevealMode.Instant,
      integerBasedSort: true, // false 速度慢，但精度高
      // CORS和SharedArryBuffer的关系正在发展中
      // https://github.com/mkkellogg/GaussianSplats3D?tab=readme-ov-file#cors-issues-and-sharedarraybuffer
      gpuAcceleratedSort: false,
      sharedMemoryForWorkers: false,
      // splatSortDistanceMapPrecision: 20,
      // freeIntermediateSplatData: true,
      // optimizeSplatData: false
    })
    gsViewer.layerAttr = layerAttr
    this.three.splatViewers.push(gsViewer)

    // 为高斯图层添加一个覆盖物，这样点击地图就可以选中这片区域了
    gsViewer.pickCircle = this.createPickCircle(layerAttr)
    this.cesiumViewer.scene.primitives.add(gsViewer.pickCircle)

    return gsViewer
  }

  private createPickCircle(layerAttr: API_RECONSTRUCTION.Layer) {
    const positions = JSON.parse(layerAttr.overlayPositions)[0]

    const circleCenter = Cartesian3.fromDegrees(positions[0], positions[1])
    const radius = positions[3]
    console.log(layerAttr, circleCenter, radius)

    const PickCircle = new GroundPrimitive({
      geometryInstances: new GeometryInstance({
        geometry: new CircleGeometry({
          center: circleCenter,
          radius,
        }),
      }),
      appearance: new MaterialAppearance({
        translucent: true,
        material: Material.fromType(Material.ColorType, {
          color: Color.TRANSPARENT,
        }),
      }),
      asynchronous: false,
    })
    // @ts-ignore
    PickCircle.id = 'reconstruction--' + layerAttr.overlayId
    return PickCircle
  }

  async remove3dgsAll() {
    if (this.three.splatViewers.length === 0) return

    for (const splatViewer of this.three.splatViewers) {
      await splatViewer.removeSplatScene(0)
      splatViewer.update()
      splatViewer.render()
    }

    // 删除一次
    await this.dispose()
    this.three.splatViewers = []
    this.readySplatViewer = 0
  }

  async removeById(id: number) {
    if (this.three.splatViewers.length === 0) return

    let index = -1
    for (const splatViewer of this.three.splatViewers) {
      if (splatViewer.layerAttr.id === id) {
        await splatViewer.removeSplatScene(0)
        splatViewer.update()
        splatViewer.render()
        splatViewer.dispose()
        index = this.three.splatViewers.indexOf(splatViewer)
      }
    }
    if (index !== -1) {
      this.three.splatViewers.splice(index, 1)
      this.readySplatViewer -= 1
    }
  }

  async dispose() {
    if (this.three.splatViewers.length === 0) return
    for (const splatViewer of this.three.splatViewers) {
      await splatViewer.dispose()
    }
  }

  async load3dgs({
    layerAttr,
    splatUrl,
    lat,
    lon,
    height,
    headingPitchRoll,
    scale,
    camera,
  }: LoadOPtions) {
    const gsViewer = this.addSplatViewer(layerAttr)

    if (typeof scale === 'number') {
      scale = { x: scale, y: scale, z: scale }
    }

    var position = CesiumCartesian3.fromDegrees(lon, lat, height)

    var p = CesiumCartesian3.multiplyByScalar(
      position,
      SCALE_BASE,
      new CesiumCartesian3(),
    )

    // 获取ENU帧的转换矩阵
    var enuTransform = CesiumTransforms.eastNorthUpToFixedFrame(position)
    // 从逆矩阵中提取3x3的旋转矩阵部分
    var rotationMatrix = CesiumMatrix4.getRotation(
      enuTransform,
      new CesiumMatrix3(),
    )
    var quaternion = CesiumQuaternion.fromRotationMatrix(rotationMatrix)

    const q5 = CesiumQuaternion.fromHeadingPitchRoll(
      new CesiumHeadingPitchRoll(
        CesiumMath.toRadians(headingPitchRoll.heading),
        CesiumMath.toRadians(headingPitchRoll.pitch),
        CesiumMath.toRadians(headingPitchRoll.roll),
      ),
    ) // 颠倒
    let q = CesiumQuaternion.multiply(quaternion, q5, new CesiumQuaternion())

    // Cesium的坐标系Z轴朝上，因此为了与THREE匹配，以X轴为中心旋转90度
    let q6 = CesiumQuaternion.fromAxisAngle(
      new CesiumCartesian3(1, 0, 0),
      CesiumMath.toRadians(90),
    )
    q = CesiumQuaternion.multiply(q, q6, new CesiumQuaternion())

    await gsViewer.addSplatScene(splatUrl)

    const splatMesh = gsViewer.getSplatMesh()
    splatMesh.position.set(p.x, p.y, p.z)
    splatMesh.quaternion.set(q.x, q.y, q.z, q.w)
    splatMesh.scale.set(
      SCALE_BASE * scale.x,
      SCALE_BASE * scale.y,
      SCALE_BASE * scale.z,
    )
    this.readySplatViewer += 1
  }

  renderThreeObj() {
    // 如果在没有任何加载完成的数据的时候进行渲染，会导致黑屏，所以定义一个readySplatViewer，当其大于0才会渲染
    if (this.readySplatViewer === 0) return

    if (this.three.splatViewers.length === 0) return

    this.updateCanvasSize()
    this.three.renderer.clear()

    var civm = this.cesiumViewer.camera.inverseViewMatrix

    // 3. 创建缩放矩阵
    var scaleMatrix = CesiumMatrix4.fromScale(
      new CesiumCartesian3(SCALE_BASE, SCALE_BASE, SCALE_BASE),
    )

    // 4. 将视图和缩放矩阵相乘以创建新视图矩阵
    var scaledViewMatrix = CesiumMatrix4.multiply(
      scaleMatrix,
      civm,
      new CesiumMatrix4(),
    )

    this.three.camera.matrixWorld.set(
      scaledViewMatrix[0],
      scaledViewMatrix[4],
      scaledViewMatrix[8],
      scaledViewMatrix[12],
      scaledViewMatrix[1],
      scaledViewMatrix[5],
      scaledViewMatrix[9],
      scaledViewMatrix[13],
      scaledViewMatrix[2],
      scaledViewMatrix[6],
      scaledViewMatrix[10],
      scaledViewMatrix[14],
      scaledViewMatrix[3],
      scaledViewMatrix[7],
      scaledViewMatrix[11],
      scaledViewMatrix[15],
    )

    // // position, quaternion, scale 反映到 (for Debug)
    this.three.camera.matrixWorld.decompose(
      this.three.camera.position,
      this.three.camera.quaternion,
      this.three.camera.scale,
    )

    this.three.splatViewers.forEach((splatViewer) => {
      // 图层和所在图层组没被隐藏再渲染
      const polygon = splatViewer.pickCircle as GroundPrimitive
      if (
        !this.hiddenlayerIds.has(splatViewer.layerAttr.overlayId) &&
        !this.hiddenGroupIds.has(splatViewer.layerAttr.layerId)
      ) {
        splatViewer.update()
        splatViewer.render()
        polygon.show = true
      } else {
        polygon.show = false
      }
    })
  }

  has(id: number) {
    let has = false
    this.three.splatViewers.forEach((splatViewer) => {
      if (splatViewer.layerAttr.overlayId === id) {
        has = true
      }
    })

    return has
  }
}

export default CesiumThreeJS3DGS
