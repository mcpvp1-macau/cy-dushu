import { useBackTrackingStore } from '@/store/context-store/useBackTracking.store'
import { attempt } from 'lodash'
import { useCesium } from 'resium'
import * as Cesium from 'cesium'
import dayjs from 'dayjs'
import { useEffect, useRef, memo } from 'react'
import UavDirectionImg from '@/assets/marker/UavDirection.png'
import GimbalDirectionImg from '@/assets/marker/gimbalDirection.png'
import { number } from 'mathjs'

type PropsType = {
  value: API_DBAPI.res.GetTrackQueryRes
  showAnimation?: boolean
  showMarker?: boolean
  image?: string
}

const SampledPath: React.FC<PropsType> = memo(
  ({
    value,
    showAnimation = true,
    showMarker = false,
    image = UavDirectionImg,
  }) => {
    const { viewer } = useCesium()
    const entityRef = useRef<Cesium.Entity>()
    const gimbalRef = useRef<Cesium.Entity>()

    // 获取时间相关状态（使用浅比较）
    const { currentTime } = useBackTrackingStore((s) => ({
      currentTime: s.currentTime.valueOf(),
    }))
    const playing = useBackTrackingStore((s) => s.playing)

    const multiple = useBackTrackingStore((s) => s.multiple)


    // 处理轨迹数据变化
    useEffect(() => {
      if (!viewer || !value.length) return

      // 创建或更新位置属性
      const positionProperty = new Cesium.SampledPositionProperty()

      // 创建方向属性
      const orientationProperty = new Cesium.SampledProperty(Number)
      const gimbalOrientationProperty = new Cesium.SampledProperty(Number)

      // 获取轨迹的起止时间
      const startTime = dayjs(value[0].acquisitionTime).toDate()
      const stopTime = dayjs(value[value.length - 1].acquisitionTime).toDate()

      // 添加位置采样点
      value.forEach((item) => {
        positionProperty.addSample(
          Cesium.JulianDate.fromDate(dayjs(item.acquisitionTime).toDate()),
          Cesium.Cartesian3.fromDegrees(item.lng, item.lat, item.altitude || 0),
        )


        orientationProperty.addSample(
          Cesium.JulianDate.fromDate(dayjs(item.acquisitionTime).toDate()),
          Cesium.Math.toRadians(-item.attitudeHead || 0),
        )
        gimbalOrientationProperty.addSample(
          Cesium.JulianDate.fromDate(dayjs(item.acquisitionTime).toDate()),
          Cesium.Math.toRadians(-item.gimbalHead || 0),
        )
      })

      // 设置插值选项，使路径更平滑
      positionProperty.setInterpolationOptions({
        interpolationDegree: 30,
        interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
      })

      // 设置方向插值
      orientationProperty.setInterpolationOptions({
        interpolationDegree: 2,
        interpolationAlgorithm: Cesium.LinearApproximation,
      })

      // 创建或更新实体
      if (!entityRef.current) {
        entityRef.current = viewer.entities.add({
          position: positionProperty,
          // orientation: orientationProperty,
          ...(showMarker
            ? {
                billboard: {
                  image,
                  width: 50,
                  height: 50,
                  scale: 0.5,
                  // 关键属性：使billboard与方向对齐
                  alignedAxis: Cesium.Cartesian3.UNIT_Z,
                  // 可选：如果需要额外旋转调整
                  rotation: orientationProperty,
                },
              }
            : {}),
          path: {
            resolution: 1,
            material: Cesium.Color.fromCssColorString('#ef4444'),
            width: 5,
            leadTime: 0,
            trailTime: Infinity,
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
              0,
              9999999,
            ),
          },
          availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
              start: Cesium.JulianDate.fromDate(startTime),
              stop: Cesium.JulianDate.fromDate(stopTime),
            }),
          ]),
        })

        gimbalRef.current = viewer.entities.add({
          position: positionProperty,
          billboard: {
            image: GimbalDirectionImg,
            width: 100,
            height: 100,
            scale: 0.6,
            // 关键属性：使billboard与方向对齐
            alignedAxis: Cesium.Cartesian3.UNIT_Z,
            rotation: gimbalOrientationProperty,
          },
          availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
              start: Cesium.JulianDate.fromDate(startTime),
              stop: Cesium.JulianDate.fromDate(stopTime),
            }),
          ]),
        })
      }

      // 设置时钟
      if (showAnimation) {
        viewer.clock.startTime = Cesium.JulianDate.fromDate(startTime)
        viewer.clock.stopTime = Cesium.JulianDate.fromDate(stopTime)
        viewer.clock.currentTime = Cesium.JulianDate.fromDate(startTime)
        viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP
        viewer.clock.multiplier = 1 // 播放速度
        viewer.clock.shouldAnimate = true
      }

      return () => {
        if (entityRef.current) {
          attempt(() => viewer.entities.remove(entityRef.current!))
          attempt(() => viewer.entities.remove(gimbalRef.current!))
          entityRef.current = undefined
          gimbalRef.current = undefined
        }
      }
    }, [value, showAnimation])

    // 响应当前时间变化
    useEffect(() => {
      if (!viewer || !entityRef.current || !showAnimation) return
      
      // 获取当前的 viewer 时钟时间
      const clockTime = Cesium.JulianDate.toDate(viewer.clock.currentTime).getTime()
      // 计算时间差（毫秒）
      const timeDiff = Math.abs(clockTime - currentTime)

      // console.log('timeDiff', timeDiff)
      
      // 如果时间差超过3秒（3000毫秒），才更新时钟时间
      if (timeDiff > 3000) {
        viewer.clock.currentTime = Cesium.JulianDate.fromDate(
          dayjs(currentTime).toDate(),
        )
      }
    }, [currentTime, showAnimation])

    useEffect(() => {
      if (!viewer || !entityRef.current) return
      viewer.clock.shouldAnimate = playing
    }, [playing])

    useEffect(() => {
      if (!viewer || !entityRef.current) return
      viewer.clock.multiplier = multiple
    }, [multiple])

    return null
  },
)

export default SampledPath
