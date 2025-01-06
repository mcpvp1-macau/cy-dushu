import { useCesium } from 'resium'
import { Cartesian3, HeadingPitchRoll, Quaternion, Transforms } from 'cesium'
import { useLatest, useMemoizedFn } from 'ahooks'
import * as Cesium from 'cesium'

type PropsType = {
  data: {
    longitude: number
    latitude: number
    altitude?: number
  }
}

const WangLouModel: React.FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium()
  const { longitude, latitude, altitude } = data

  const longitudeRef = useLatest(longitude)
  const latitudeRef = useLatest(latitude)
  const altitudeRef = useLatest(altitude || 0)

  const getPosition = () =>
    Cesium.Cartesian3.fromDegrees(
      longitudeRef.current,
      latitudeRef.current,
      altitudeRef.current,
    )

  useEffect(() => {
    if (!viewer) return
    const positonCallback = new Cesium.CallbackProperty(() => {
      return getPosition()
    }, false) as unknown as Cesium.PositionProperty

    const heading = Cesium.Math.toRadians(Number(0) || 0) //模型头的位置 y轴方向旋转
    const pitching = Cesium.Math.toRadians(Number(0 || 0) || 0) //模型头的位置 x轴方向旋转
    const rolling = Cesium.Math.toRadians(Number(0) || 0) //模型头的位置 x轴方向旋转
    const hpr = new HeadingPitchRoll(heading, pitching, rolling)
    const orientationCallback = new Cesium.CallbackProperty(() => {
      const position = getPosition()
      return Transforms.headingPitchRollQuaternion(position, hpr)
    }, false)
    // 加载模型
    const entity = new Cesium.Entity({
      position: positonCallback,
      orientation: orientationCallback,
      model: {
        uri: `/ja-map/models/wanglou2.glb`,
        scale: 0.2,
        colorBlendAmount: 1,
        color: Cesium.Color.fromCssColorString('#e6e8fa'),
        silhouetteColor: Cesium.Color.fromCssColorString('#35C2A0'),
        silhouetteSize: 1,
      },
    })
    viewer.entities.add(entity)
    return () => {
      try {
        viewer.entities.remove(entity)
      } catch (error) {}
    }
  }, [viewer])
  return null
})

export default WangLouModel
