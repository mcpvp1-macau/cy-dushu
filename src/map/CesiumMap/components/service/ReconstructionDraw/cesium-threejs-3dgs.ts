import {
  Viewer as CesiumViewer,
  Cartesian3 as CesiumCartesian3,
  Transforms as CesiumTransforms,
  Matrix4 as CesiumMatrix4,
  Matrix3 as CesiumMatrix3,
  Quaternion as CesiumQuaternion,
  Math as CesiumMath,
  HeadingPitchRoll as CesiumHeadingPitchRoll,
} from 'cesium'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// @ts-ignore
import {
  Viewer as GSViewer,
  SceneRevealMode as GSSceneRevealMode,
  SplatRenderMode,
} from '@mkkellogg/gaussian-splats-3d'

// const SCALE_BASE = 1 / 10000;
const SCALE_BASE = 1 / 1

class CesiumThreeJS3DGS {
  cesiumViewer: CesiumViewer | null = null
  threeContainer: HTMLElement | null = null

  three: {
    renderer: THREE.WebGLRenderer | null
    camera: THREE.PerspectiveCamera | null
    scene: THREE.Scene | null
    controls: OrbitControls | null
    splatViewer: any
  } = {
    renderer: null,
    camera: null,
    scene: null,
    controls: null,
    splatViewer: null,
  }

  tc: HTMLElement | null = null

  constructor(
    cesiumViewer: CesiumViewer | null = null,
    threeContainer: HTMLElement | string | null = null,
  ) {
    let tc: HTMLElement | null
    if (cesiumViewer) {
      this.initCesium(cesiumViewer)

      if (!threeContainer) {
        tc = document.createElement('div')
        tc.id = 'threeContainer'
        cesiumViewer.container.insertAdjacentElement('afterend', tc)
      } else if (typeof threeContainer === 'string') {
        tc = document.getElementById(threeContainer)
      } else {
        tc = threeContainer
      }

      if (tc) {
        this.threeContainer = tc
        tc.style.inset = '0'
        tc.style.width = '100%'
        tc.style.height = '100%'
        tc.style.position = 'absolute'
        tc.style.pointerEvents = 'none'

        var fov = 45
        var width = window.innerWidth
        var height = window.innerHeight
        var aspect = width / height
        var near = 0.1 // * SCALE_BASE;
        var far = 5000 //* SCALE_BASE;  // TODO

        this.three.scene = new THREE.Scene()
        this.three.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.three.renderer = new THREE.WebGLRenderer({ alpha: true })
        this.threeContainer.appendChild(this.three.renderer.domElement)

        const onResize = () => {
          // console.log("fovy", this.cesiumViewer.camera.frustum.fovy)
          // 获取大小
          this.three.camera!.fov = CesiumMath.toDegrees(
            //@ts-ignore
            this.cesiumViewer.camera.frustum.fovy,
          ) // ThreeJS FOV is vertical
          this.three.camera!.updateProjectionMatrix()

          var width = this.threeContainer!.clientWidth
          var height = this.threeContainer!.clientHeight

          // 调整渲染器大小
          this.three.renderer!.setPixelRatio(window.devicePixelRatio)
          this.three.renderer!.setSize(width, height)

          // 矫正照相机的宽高比
          this.three.camera!.aspect = width / height
          this.three.camera!.updateProjectionMatrix()
        }

        // 用于初始化运行
        onResize()
        // 调整事件发生时运行
        window.addEventListener('resize', onResize)
      }
      this.three.camera!.matrixAutoUpdate = false
    }
  }

  initCesium(viewer: CesiumViewer) {
    this.cesiumViewer = viewer
  }

  async initThree() {
    this.three.splatViewer = new GSViewer({
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

    // Debug info (根据需要显示坐标等)
    // this.three.splatViewer.showInfo = true;
    // this.three.splatViewer.infoPanel.show();
  }

  async remove3dgsAll(showloadingUI = true) {
    if (!this.three.splatViewer) return
    const indexesToRemove: any[] = []
    for (let i = 0; i < this.three.splatViewer.getSceneCount(); i++) {
      indexesToRemove.push(i)
    }
    if (indexesToRemove.length > 0) {
      await this.three.splatViewer.removeSplatScenes(
        indexesToRemove,
        showloadingUI,
      )
    } else {
      if (this.three.splatViewer.isLoadingOrUnloading()) {
        // 如果正在加载第一个，removeSplatScenes不会运行，所以不会出错。
        throw new Error(
          'Cannot add splat scene while another load or unload is already in progress.',
        )
      }
    }

    // 以防万一原点也要重置
    // const splatMesh = this.three.splatViewer.getSplatMesh();
    // splatMesh.position.set(0, 0, 0)
    // splatMesh.quaternion.set(0, 0, 0, 0)
    // splatMesh.scale.set(1, 1, 1)

    // 这也需要隐藏
    this.three.splatViewer.update()
    this.three.splatViewer.render()

    // 删除一次
    await this.dispose()
    delete this.three.splatViewer
  }

  async dispose() {
    if (this.three.splatViewer) {
      await this.three.splatViewer.dispose()
    }
  }

  async load3dgs({
    splatUrl,
    lat,
    lon,
    height,
    headingPitchRoll,
    scale,
    camera,
  }: {
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
  }) {
    await this.initThree()

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

    if (!(camera && camera.offset && camera.headingPitchRoll)) {
      // 通过稍微移动镜头，可以使画面变得更美，所以先拉10m左右
      this.cesiumViewer?.camera.moveBackward(10)
    }

    await this.three.splatViewer.addSplatScene(splatUrl, {
      // 如果您要配置多个模型，请考虑此配置方法。
      // position: [p.x, p.y, p.z],
      // rotation: [q.x, q.y, q.z, q.w],
      // scale: [SCALE_BASE * scale.x, SCALE_BASE * scale.y, SCALE_BASE * scale.z],
    })

    // v0.4.4, v0.4.5 摄像机移动得摇摇晃晃。此设定可同时显示多个画面（需要记忆体）
    // v0.4.3 也可以设置相同的设置，但也可以设置相同的设置
    // const splatMesh = this.three.splatViewer.getSplatScene(
    //   this.three.splatViewer.getSceneCount() - 1
    // );
    // console.log(splatMesh);
    // 在这里可以设定，相机移动也很流畅。但是只能对应一个模型
    const splatMesh = this.three.splatViewer.getSplatMesh()

    splatMesh.position.set(p.x, p.y, p.z)
    splatMesh.quaternion.set(q.x, q.y, q.z, q.w)
    splatMesh.scale.set(
      SCALE_BASE * scale.x,
      SCALE_BASE * scale.y,
      SCALE_BASE * scale.z,
    )

    // 摄像头位置
    if (camera && camera.offset && camera.headingPitchRoll) {
      var nloc = [lon, lat]
      var targetCartesian = CesiumCartesian3.fromDegrees(
        nloc[0],
        nloc[1],
        height,
      )
      // ENU（East-North-Up） 获取转换矩阵
      var enuMatrix = CesiumTransforms.eastNorthUpToFixedFrame(targetCartesian)

      // 转换相机坐标
      // 局部坐标（以目标对象为原点））
      var localPosition = new CesiumCartesian3(
        camera.offset.x, // * manualScale,
        camera.offset.y, // * manualScale,
        camera.offset.z, // * manualScale
      ) // 本地坐标中的位置
      // 将本地坐标转换为世界坐标
      var worldPosition = CesiumMatrix4.multiplyByPoint(
        enuMatrix,
        localPosition,
        new CesiumCartesian3(),
      )

      this.cesiumViewer?.camera.flyTo({
        destination: worldPosition,
        orientation: {
          heading: CesiumMath.toRadians(
            camera.headingPitchRoll?.heading - headingPitchRoll.heading,
          ),
          pitch: CesiumMath.toRadians(camera.headingPitchRoll?.pitch),
          roll: CesiumMath.toRadians(camera.headingPitchRoll?.roll),
        },
        duration: 3,
      })
    } else {
      // 通过稍微移动镜头，可以使画面变得更美，所以先拉10m左右
      this.cesiumViewer?.camera.moveForward(10)
    }

    // v0.4.4 以后 this.three.splatViewer.getSceneCount
    // return this.three.splatViewer.getSplatScene(this.three.splatViewer.getSplatMesh().getSplatCount() - 1)
    return 0
  }

  renderThreeObj() {
    if (
      !this.three.camera ||
      !this.cesiumViewer ||
      !this.threeContainer ||
      !this.three.renderer
    ) {
      return
    }

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

    if (this.three.splatViewer) {
      this.three.splatViewer.update()
      this.three.splatViewer.render()
    }
  }
}

export default CesiumThreeJS3DGS
