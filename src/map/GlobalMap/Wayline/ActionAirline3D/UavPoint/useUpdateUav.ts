import useAirlineConfigStore from '@/store/uav/uav-airline/useAirlineConfig.store'
import { useRef } from 'react'

export const useUpdateUav = () => {
  const currentIndex = useAirlineConfigStore((s) => s.currentIndex)
  const waypointHeadingMode = useAirlineConfigStore(
    (s) => s.airlineConfig.waypointHeadingMode,
  )
  const airPointSize = useAirlineConfigStore((s) => s.airpointsConfig.length)
  const takeOffRefPoint = useAirlineConfigStore(
    (s) => s.airlineConfig.takeOffRefPoint,
  )
  const cpUav = useAirlineConfigStore((s) => s.calcUavByCurrentAirpoint)

  // 起飞点发生改变时
  const takeOffRefPointRef = useRef(takeOffRefPoint)
  if (takeOffRefPointRef.current !== takeOffRefPoint) {
    takeOffRefPointRef.current = takeOffRefPoint
    if (airPointSize === 0 || currentIndex === 0) {
      queueMicrotask(() => {
        cpUav()
      })
    }
  }

  // 激活航点发生改变时
  const lastCurrentIndex = useRef(-1)
  const airPointSizeRef = useRef(airPointSize)
  if (
    lastCurrentIndex.current !== currentIndex ||
    airPointSizeRef.current !== airPointSize
  ) {
    lastCurrentIndex.current = currentIndex
    airPointSizeRef.current = airPointSize
    queueMicrotask(() => {
      cpUav()
    })
  }

  // 飞行器偏航模式发送改变时
  const waypointHeadingModeRef = useRef(waypointHeadingMode)
  if (waypointHeadingModeRef.current !== waypointHeadingMode) {
    waypointHeadingModeRef.current = waypointHeadingMode
    queueMicrotask(() => {
      cpUav()
    })
  }
}
