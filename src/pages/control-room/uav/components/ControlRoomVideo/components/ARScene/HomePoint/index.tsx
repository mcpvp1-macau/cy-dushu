import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { attempt, isNil } from 'lodash'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = unknown

const ARSceneHomePoint: FC<PropsType> = memo(() => {
  const goHomeLongitude = useUavControlRoomStore((s) => s.state.gohomeLongitude)
  const goHomeLatitude = useUavControlRoomStore((s) => s.state.gohomeLatitude)
  const goHomeHeight = useUavControlRoomStore((s) => s.state.gohomeHeight)

  const { viewer } = useCesium()
  useEffect(() => {
    console.log(goHomeLongitude, goHomeLatitude, goHomeHeight)
    if (!viewer || isNil(goHomeLongitude) || isNil(goHomeLatitude)) {
      return
    }

    const entity = viewer.entities.add({
      billboard: {
        image: '/images/airline/H.svg',
        width: 32,
        height: 32,
        scaleByDistance: new Cesium.NearFarScalar(1, 1, 1000, 0.1),
      },
      position: Cesium.Cartesian3.fromDegrees(
        goHomeLongitude,
        goHomeLatitude,
        goHomeHeight,
      ),
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(entity)
      })
    }
  }, [goHomeLongitude, goHomeLatitude, goHomeHeight, viewer])

  return null
})

ARSceneHomePoint.displayName = 'ARSceneHomePoint'

export default ARSceneHomePoint
