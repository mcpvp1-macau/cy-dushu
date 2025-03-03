import { PointPrimitive, PointPrimitiveCollection } from 'resium'
import useBackTrackingTarget from '../hooks/useBackTrackingTarget'
import React from 'react'
import { sourceTypeColorMap } from '@/map/GlobalMap/TargetPoints'
import * as Cesium from 'cesium'
import HoverDetail from '@/map/GlobalMap/BoardCesium/HoverDetail'

type PropsType = {
  deviceId: string
}

const TargetBacktracking: React.FC<PropsType> = memo(({ deviceId }) => {
  const { targets, boardObj } = useBackTrackingTarget(deviceId)

  const [boardCloseMap, setBoardCloseMap] = useState<Record<string, boolean>>(
    {},
  )

  const onClick = (target) => {
    setBoardCloseMap((prev) => ({ ...prev, [target.targetId]: false }))
  }

  return (
    <>
      <PointPrimitiveCollection>
        {targets?.map((target) => {
          const tid = target.tid
          const last = target.last
          const lng = Number(target.targetLongitude)
          const lat = Number(target.targetLatitude)
          const alt = Number(target.targetAltitude)
          let color = last
            ? sourceTypeColorMap[target.sourceType] || '#3855AE'
            : '#3855AE'
          /** 天朗独有的记忆 */
          if (target.targetState === 2) {
            color = 'red'
          }
          return (
            <React.Fragment key={tid}>
              <PointPrimitive
                id={tid}
                color={Cesium.Color.fromCssColorString(color)}
                position={Cesium.Cartesian3.fromDegrees(lng, lat, alt)}
                pixelSize={last ? 14 : 5}
                disableDepthTestDistance={50000}
                outlineColor={Cesium.Color.fromCssColorString('#fff')}
                outlineWidth={last ? 1.5 : 0}
                onClick={() => onClick(target)}
              />
            </React.Fragment>
          )
        })}
      </PointPrimitiveCollection>
      {Object.keys(boardObj).map((targetId) => {
        return !boardCloseMap[targetId] ? (
          <HoverDetail
            key={targetId}
            item={boardObj[targetId]}
            option={{
              autoPosition: true,
            }}
            onClose={() => {
              setBoardCloseMap((prev) => ({ ...prev, [targetId]: true }))
            }}
          />
        ) : null
      })}
    </>
  )
})

export default TargetBacktracking
