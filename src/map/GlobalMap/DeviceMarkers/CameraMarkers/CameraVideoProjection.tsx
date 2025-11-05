import CameraFrustum from '@/components/map/device/CameraFrustum'
import { emtpyObject } from '@/constant/data'
import useCameraSettingStore from '@/store/setting/useCameraSetting.store'
import { useDebounceEffect, useLatest } from 'ahooks'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { useCesium } from 'resium'

type PropsType = {
  deviceId: string
  video: HTMLVideoElement
}

const CameraVideoProjection: FC<PropsType> = memo(({ deviceId, video }) => {
  const { viewer } = useCesium()
  const setting = useCameraSettingStore(
    (s) => s.deviceCameraConfig[deviceId] ?? emtpyObject,
  )

  const [cornors, setCornors] = useState<Cesium.Cartesian3[]>([])

  const getCornors = (
    geometry: Cesium.FrustumOutlineGeometry,
    modelMatrix: Cesium.Matrix4,
  ) => {
    // 获取几何体实例的几何体对象, 关键！
    const geometry2 = Cesium.FrustumOutlineGeometry.createGeometry(geometry)!

    // 获取几何体的顶点属性
    const attributes = geometry2.attributes

    const positions = attributes.position.values
    // const modelMatrix = primitive.modelMatrix

    const resultArr: Cesium.Cartesian3[] = []
    for (let i = 3 * 4; resultArr.length < 4; i += 3) {
      // 创建顶点坐标的 Cartesian4 对象
      const x = positions[i]
      const y = positions[i + 1]
      const z = positions[i + 2]
      const vertex = new Cesium.Cartesian4(x, y, z, 1.0)
      // 应用模型矩阵到顶点坐标
      Cesium.Matrix4.multiplyByPoint(modelMatrix, vertex, vertex)
      // 将顶点坐标转换为地理坐标
      const cartesian3 = Cesium.Cartesian3.fromCartesian4(vertex)

      resultArr.push(cartesian3)
    }
    return resultArr
  }

  useEffect(() => {
    if (!viewer) {
      return
    }
    const {
      lng,
      lat,
      height,
      heading,
      pitch,
      roll = 0,
      fov,
      far,
      aspectRatio = 1.7777,
    } = setting
    if (
      [lng, lat, height, heading, pitch, fov, far, aspectRatio].some(
        (v) => typeof v !== 'number',
      )
    ) {
      return
    }

    if (far <= 0.01) {
      return
    }

    // 轴心位置
    const position = Cesium.Cartesian3.fromDegrees(lng, lat, height)

    // 朝向姿态
    const hpr = new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(180 - heading),
      Cesium.Math.toRadians(pitch),
      Cesium.Math.toRadians(roll),
    )

    // 透视的视锥体类型
    const frustum = new Cesium.PerspectiveFrustum({
      fov: Cesium.Math.toRadians(fov),
      aspectRatio: 1 / aspectRatio,
      near: 0.001,
      far,
    })

    // 将相对于局部坐标系的位置和方向转换为相对于固定坐标系的位置和方向
    const fixedFrameTransform =
      Cesium.Transforms.localFrameToFixedFrameGenerator('north', 'east')
    // 获得相对于大地图的转置矩阵
    const modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
      position,
      hpr,
      Cesium.Ellipsoid.WGS84,
      fixedFrameTransform,
    )

    // 视锥体轮廓
    const geometry = new Cesium.FrustumOutlineGeometry({
      frustum,
      origin: Cesium.Cartesian3.ZERO, // 默认值
      orientation: Cesium.Quaternion.IDENTITY, // 默认值
      /** @ts-ignore */
      vertexFormat: Cesium.VertexFormat.POSITION_ONLY,
    })

    setCornors(getCornors(geometry, modelMatrix))
  }, [setting])

  return (
    <>
      {cornors.length === 4 && (
        <ProjectionScreen
          cornors={cornors}
          video={video}
          position={[setting.lng, setting.lat, setting.height]}
        />
      )}
    </>
  )
})

const ProjectionScreen: FC<{
  position: number[]
  cornors: Cesium.Cartesian3[]
  video: HTMLVideoElement
}> = ({ position, cornors, video }) => {
  const { viewer } = useCesium()

  const latestCornors = useLatest(cornors)

  useDebounceEffect(
    () => {
      if (!viewer) {
        return
      }

      const positions = new Cesium.CallbackProperty(() => {
        return new Cesium.PolygonHierarchy(latestCornors.current)
      }, false)

      // 创建Polygon
      const mesh = viewer.entities.add({
        polygon: {
          hierarchy: positions,
          material: video as unknown as Cesium.MaterialProperty,
          // stRotation: Cesium.Math.toRadians(0),
          perPositionHeight: true, // 启用每个位置的高度
          textureCoordinates: new Cesium.PolygonHierarchy(
            [
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ].map((item) => Cesium.Cartesian3.fromArray(item)),
          ),
        },
      })

      return () => {
        attempt(() => {
          viewer.entities.remove(mesh)
        })
      }
    },
    [viewer, video],
    { wait: 10 },
  )

  const cornorsArray = useMemo(() => {
    return cornors.map((c) => {
      const cartographic = Cesium.Cartographic.fromCartesian(c)
      const longitude = Cesium.Math.toDegrees(cartographic.longitude)
      const latitude = Cesium.Math.toDegrees(cartographic.latitude)
      const altitude = cartographic.height
      return [longitude, latitude, altitude]
    })
  }, [cornors])

  return (
    <>
      <CameraFrustum corners={cornorsArray} position={position} />
      {/* <LabelCollection>
        {cornors.map((corner, index) => (
          <Label
            key={index}
            position={corner}
            text={`${index + 1}`}
            font="14px sans-serif"
            fillColor={Cesium.Color.YELLOW}
            outlineColor={Cesium.Color.BLACK}
            outlineWidth={2}
            style={Cesium.LabelStyle.FILL_AND_OUTLINE}
            verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
            pixelOffset={new Cesium.Cartesian2(0, -10)}
          />
        ))}
      </LabelCollection> */}
    </>
  )
}

CameraVideoProjection.displayName = 'CameraVideoProjection'

export default CameraVideoProjection
