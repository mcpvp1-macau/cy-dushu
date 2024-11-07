import { memo, useEffect, useRef, useState, type FC } from 'react'
import { useCesium } from 'resium'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import PositionTooltip from '@/components/map/PostionTooltip'
import { getSpaceDistance } from '@/utils/geo-math'

type PropsType = {
  positions: { pointX: number; pointY: number; pointZ: number }[]
}

/** 预报下一个航点的时间和距离 */
const Forecats: FC<PropsType> = memo(({ positions }) => {
  const waypointIndex = useUavControlRoomStore((s) => s.state.waypointIndex)
  const { viewer } = useCesium()

  const horizontalSpeed =
    useUavControlRoomStore((s) => s.state.horizontalSpeed) ?? 1
  const {
    uavLng = 0,
    uavLlat = 0,
    uavHeight = 0,
  } = useUavControlRoomStore((s) => ({
    uavLng: s.state.longitude,
    uavLlat: s.state.latitude,
    uavHeight: s.state.altitude,
  }))

  const [boardInfo, setBoardInfo] = useState({
    lng: 0,
    lat: 0,
    alt: 0,
    remainDistance: 0,
    remainTime: 0,
  })
  const lastRemainTime = useRef(Number.MAX_VALUE)

  useEffect(() => {
    if (
      !viewer?.scene ||
      waypointIndex === undefined ||
      waypointIndex >= positions.length
    ) {
      return
    }
    const targetPoint = positions[waypointIndex]

    const remainDistance = getSpaceDistance([
      [uavLng, uavLlat, uavHeight],
      [targetPoint.pointX, targetPoint.pointY, targetPoint.pointZ],
    ])

    const remainTime = Math.min(
      lastRemainTime.current,
      remainDistance / horizontalSpeed,
    )
    lastRemainTime.current = remainTime

    setBoardInfo({
      lng: targetPoint.pointX,
      lat: targetPoint.pointY,
      alt: targetPoint.pointZ,
      remainDistance,
      remainTime,
    })

    return () => {}
  }, [waypointIndex, positions, uavLng, uavLlat, uavHeight, horizontalSpeed])

  useEffect(() => {
    lastRemainTime.current = Number.MAX_VALUE
  }, [waypointIndex])

  /** 获取剩余时间 */
  const getRemainTime = () => {
    if (boardInfo.remainDistance < 30) {
      return '即将到达'
    }
    return `${boardInfo.remainTime.toFixed(0)}s`
  }

  return (
    <>
      {viewer &&
        boardInfo.remainDistance >= 1 &&
        (waypointIndex || 0) < positions.length && (
          <PositionTooltip
            position={[boardInfo.lng, boardInfo.lat]}
            alwayInViewport
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                wordWrap: 'normal',
                whiteSpace: 'nowrap',
                textAlign: 'left',
              }}
            >
              <div>剩余时间：{getRemainTime()}</div>
              <div>剩余距离：{boardInfo.remainDistance.toFixed(0)}m</div>
            </div>
          </PositionTooltip>
        )}
    </>
  )
})

Forecats.displayName = 'Forecats'

export default Forecats
