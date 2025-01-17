import useAreaWaylineStore from '@/store/uav/uav-area-wayline/useAreaWayline.store'
import { attempt } from 'lodash'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = unknown

/** 起始点 */
const FirstPoint: FC<PropsType> = memo(() => {
  const firstPoint = useAreaWaylineStore((s) => s.firstAirpoint)
  const { viewer } = useCesium()

  useEffect(() => {
    if (!viewer || !firstPoint) {
      return
    }

    const position = Cesium.Cartesian3.fromDegrees(
      firstPoint.pointX,
      firstPoint.pointY,
      firstPoint.pointZ,
    )

    const e = viewer.entities.add({
      position,
      billboard: {
        image: '/images/airline/inverted-triangle-s.png',
        scale: 0.5,
        eyeOffset: new Cesium.Cartesian3(0, 0, -5),
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(e)
      })
    }
  }, [viewer, firstPoint])

  return null
})

FirstPoint.displayName = 'FirstPoint'

export default FirstPoint
