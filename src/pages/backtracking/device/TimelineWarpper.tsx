import Timeline from '@/components/Timeline'
import { DayjsInstance } from '@/components/Timeline/utils/fmt'
import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

// 辅助函数：将时间字符串转换为JulianDate
const toJulianDate = (timeStr: DayjsInstance | number) => {
  if (typeof timeStr === 'number') {
    return Cesium.JulianDate.fromDate(new Date(timeStr))
  }
  return Cesium.JulianDate.fromDate(timeStr.toDate())
}

type PropsType = {
  startTime?: string
  endTime?: string
}

const TimelineWarpper: React.FC<PropsType> = memo(({ startTime, endTime }) => {
  const currentTime = useBackTrackingStore((s) => s.currentTime)
  const updateCurrentTime = useBackTrackingStore((s) => s.updateCurrentTime)
  const timeRange = useBackTrackingStore((s) => s.timeRange)
  const updateTimeRange = useBackTrackingStore((s) => s.updateTimeRange)
  const playing = useBackTrackingStore((s) => s.playing)
  const updatePlaying = useBackTrackingStore((s) => s.updatePlaying)
  const multiple = useBackTrackingStore((s) => s.multiple)
  const updateMultiple = useBackTrackingStore((s) => s.updateMultiple)

  const { viewer } = useCesium()

  const handleTimeChange = useMemoizedFn((time: DayjsInstance) => {
    updateCurrentTime(time)
  
  })

  // 处理时间范围变化
  useEffect(() => {
    if (!viewer) return

    const [start, stop] = timeRange.map(toJulianDate)

    viewer.clock.startTime = start.clone()
    viewer.clock.stopTime = stop.clone()
    viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP

    if (viewer.timeline) {
      viewer.timeline.zoomTo(start, stop)
    }
  }, [timeRange]) // 响应完整的时间范围变化

  useEffect(() => {
    if (!viewer) return
    viewer.clock.shouldAnimate = playing
    viewer.clock.multiplier = multiple
  }, [multiple, playing])

  useEffect(() => {
    console.log('====startTime, endTime', startTime, endTime)
    if(startTime && endTime) {
      updateCurrentTime(dayjs(endTime))
      updateTimeRange([dayjs(startTime), dayjs(endTime)])
    }
  }, [startTime, endTime])

  return (
    <>
      <Timeline
        time={currentTime}
        onTimeChange={handleTimeChange}
        timeRange={timeRange}
        playing={playing}
        onPlayingChange={updatePlaying}
        onTimeRangeChange={updateTimeRange}
        multiple={multiple}
        onMultipleChange={updateMultiple}
      />
    </>
  )
})

export default TimelineWarpper
