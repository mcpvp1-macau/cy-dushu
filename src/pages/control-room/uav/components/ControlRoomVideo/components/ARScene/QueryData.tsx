import useMixARStore from '@/store/control-room/useMixAR.store'
import { useThrottleEffect } from 'ahooks'

type PropsType = unknown

/** 负责从筛选出无人机视角中所需要的物质 */
const QueryData: FC<PropsType> = memo(() => {
  const gimbalPick = useMixARStore((s) => s.gimbalPick)
  const roadsTree = useMixARStore((s) => s.roadsRTree)
  const poisTree = useMixARStore((s) => s.poisRTree)
  const aoisTree = useMixARStore((s) => s.aoisRTree)
  const overlayRTree = useMixARStore((s) => s.overlayRTree)

  useThrottleEffect(
    () => {
      if (
        !gimbalPick ||
        !gimbalPick.leftBottom ||
        !gimbalPick.rightBottom ||
        !gimbalPick.rightTop ||
        !gimbalPick.leftTop
      ) {
        return
      }

      const queryFeature: GeoJSON.Feature = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [gimbalPick.leftBottom[0], gimbalPick.leftBottom[1]],
              [gimbalPick.rightBottom[0], gimbalPick.rightBottom[1]],
              [gimbalPick.rightTop[0], gimbalPick.rightTop[1]],
              [gimbalPick.leftTop[0], gimbalPick.leftTop[1]],
              [gimbalPick.leftBottom[0], gimbalPick.leftBottom[1]],
            ],
          ],
        },
      }

      if (roadsTree) {
        useMixARStore
          .getState()
          .updateRoads(
            roadsTree.search(queryFeature) as API_GEO_SERACH.res.RoadDataRes,
          )
      }

      if (poisTree) {
        useMixARStore
          .getState()
          .updatePOIs(
            poisTree.search(queryFeature) as API_GEO_SERACH.res.POIDataRes,
          )
      }

      if (aoisTree) {
        useMixARStore
          .getState()
          .updateAOIs(
            aoisTree.search(queryFeature) as API_GEO_SERACH.res.AOIDataRes,
          )
      }

      if (overlayRTree) {
        useMixARStore
          .getState()
          .updateOverlaies(overlayRTree.search(queryFeature))
        // console.log(
        //   'overlayRTree.search(queryFeature)',
        //   overlayRTree.search(queryFeature),
        // )
      }
    },
    [gimbalPick],
    { wait: 500, trailing: true },
  )

  return null
})

QueryData.displayName = 'QueryData'

export default QueryData
