import { useLatest } from 'ahooks'
import * as Cesium from 'cesium'
import { attempt } from 'lodash'
import { useCesium } from 'resium'

type PropsType = {
  id?: string
  modelUrl: string
  position: Cesium.Cartesian3
  heading?: number
  pitch?: number
  roll?: number
  scale?: number
}

const GLBModel: FC<PropsType> = memo((props) => {
  const { viewer } = useCesium()

  const latestProps = useLatest(props)

  useEffect(() => {
    if (!viewer) {
      return
    }

    const hpr = new Cesium.HeadingPitchRoll(
      latestProps.current.heading,
      latestProps.current.pitch,
      latestProps.current.roll,
    )

    const position = new Cesium.CallbackProperty(() => {
      return latestProps.current.position
    }, false)

    const orientation = new Cesium.CallbackProperty(() => {
      return Cesium.Transforms.headingPitchRollQuaternion(
        latestProps.current.position,
        hpr,
      )
    }, false)

    const e = viewer.entities.add({
      id: props.id,
      position: position as unknown as Cesium.PositionProperty,
      orientation: orientation,
      model: {
        uri: props.modelUrl,
        minimumPixelSize: 64,
        maximumScale: 200,
        scale: props.scale ?? 1.0,
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(e)
      })
    }
  }, [props.id, props.modelUrl])

  return null
})

GLBModel.displayName = 'GLBModel'

export default GLBModel
