import { attempt } from 'lodash'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  data: number[][]
}

/** 禁飞区 */
const ARSenceBanFlyArea: FC<PropsType> = memo(({ data }) => {
  const { viewer } = useCesium()
  useEffect(() => {
    if (!viewer || data.length < 3) {
      return
    }

    const wall = viewer.entities.add({
      wall: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights(data.flat()),
        material: new Cesium.ImageMaterialProperty({
          image: '/images/ban-area-liner.png',
          color: Cesium.Color.fromCssColorString('#ef4444').withAlpha(0.7),
        }),
      },
    })

    return () => {
      attempt(() => {
        viewer.entities.remove(wall)
      })
    }
  }, [data])

  return null
})

ARSenceBanFlyArea.displayName = 'ARSenceBanFlyArea'

export default ARSenceBanFlyArea
