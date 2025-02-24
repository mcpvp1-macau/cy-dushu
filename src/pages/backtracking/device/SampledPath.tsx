import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { attempt } from 'lodash'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'

type PropsType = {
  value: API_DBAPI.res.GetTrackQueryRes
}

// 辅助函数：将时间字符串转换为JulianDate
const toJulianDate = (timeStr: number) =>
  Cesium.JulianDate.fromDate(new Date(timeStr))

const SampledPath: React.FC<PropsType> = memo(({ value }) => {
  const { viewer } = useCesium()
  const entityRef = useRef<Cesium.Entity>()

  // 获取时间相关状态（使用浅比较）
  const { timeRange, currentTime } = useBackTrackingStore((s) => ({
    timeRange: s.timeRange.map((item) => item.valueOf()),
    currentTime: s.currentTime.valueOf(),
  }))

  // 处理轨迹数据变化
  useEffect(() => {
    if (!viewer || !value.length) return

    // 创建或更新位置属性
    const positionProperty = new Cesium.SampledPositionProperty()
    value.forEach((item) => {
      positionProperty.addSample(
        toJulianDate(item.acquisitionTime),
        Cesium.Cartesian3.fromDegrees(item.lng, item.lat, item.altitude || 0),
      )
    })

    // 创建或更新实体
    if (!entityRef.current) {
      entityRef.current = viewer.entities.add({
        position: positionProperty,
        path: {
          resolution: 1,
          material: Cesium.Color.fromCssColorString('#ef4444'),
          width: 5,
        },
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({
            start: toJulianDate(timeRange[0]),
            stop: toJulianDate(timeRange[1]),
          }),
        ]),
      })
    } else {
      entityRef.current.position = positionProperty
      entityRef.current.availability = new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: toJulianDate(timeRange[0]),
          stop: toJulianDate(timeRange[1]),
        }),
      ])
    }
    viewer.clock.currentTime = toJulianDate(timeRange[1] - 1)
    return () => {
      if (entityRef.current) {
        attempt(() => viewer.entities.remove(entityRef.current!))
        entityRef.current = undefined
      }
    }
  }, [timeRange[0]])

  useEffect(() => {
    if (!viewer || !entityRef.current) return
    entityRef.current.availability = new Cesium.TimeIntervalCollection([
      new Cesium.TimeInterval({
        start: toJulianDate(timeRange[0]),
        stop: toJulianDate(currentTime),
      }),
    ])
  }, [currentTime])

  return null
})

export default SampledPath
