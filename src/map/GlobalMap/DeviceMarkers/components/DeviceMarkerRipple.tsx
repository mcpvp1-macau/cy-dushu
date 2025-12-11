import { BillboardGraphics, Entity } from 'resium'
import * as Cesium from 'cesium'
import { memo, useMemo, useRef } from 'react'

type PropsType = {
  position: Cesium.Cartesian3 | [number, number, number?]
  /** 一个周期的时长，ms */
  durationMs?: number
  /** 最大尺寸（像素），屏幕空间大小，与远近无关 */
  maxRadius?: number
  /** 波纹图片路径，可选 */
  imageUrl?: string
}

const DeviceMarkerRipple: FC<PropsType> = memo(
  ({
    position,
    durationMs = 1000,
    maxRadius = 100,
    imageUrl = '/images/ripple.svg', // 自己换成实际波纹图片路径
  }) => {
    const startTimeRef = useRef(Date.now())

    const center = useMemo(() => {
      if (Array.isArray(position)) {
        const [lng, lat, alt] = position
        if (lng == null || lat == null) {
          return null
        }
        return Cesium.Cartesian3.fromDegrees(lng, lat, alt ?? 0)
      }
      return position
    }, [position])

    const durationSeconds = useMemo(() => durationMs / 1000, [durationMs])

    // 进度计算封装一下，0 ~ 1
    const getProgress = (time?: number) => {
      const startTime = startTimeRef.current
      const currentTime = time ?? Date.now()

      const diff = (currentTime - startTime) / 1000 // 秒
      // 处理负数，始终映射到 [0, durationSeconds)
      const wrapped =
        ((diff % durationSeconds) + durationSeconds) % durationSeconds
      return wrapped / durationSeconds // 0~1
    }

    // 像素尺寸（宽高）属性：从 0.3 * maxRadius 放大到 maxRadius
    const sizeProperty = useMemo(() => {
      return new Cesium.CallbackProperty(() => {
        const progress = getProgress(Date.now())
        const size = maxRadius * (0.4 + progress * 0.6)
        return size
      }, false)
    }, [maxRadius, durationSeconds])

    if (!center) {
      return null
    }

    return (
      <Entity position={center}>
        <BillboardGraphics
          image={imageUrl}
          width={sizeProperty}
          height={sizeProperty}
          // 永远在最上层，不被遮挡
          disableDepthTestDistance={Number.POSITIVE_INFINITY}
          // 禁用按距离缩放，保持“屏幕像素”感觉
          scaleByDistance={undefined}
          pixelOffsetScaleByDistance={undefined}
          // 居中对齐
          verticalOrigin={Cesium.VerticalOrigin.CENTER}
          horizontalOrigin={Cesium.HorizontalOrigin.CENTER}
        />
      </Entity>
    )
  },
)

DeviceMarkerRipple.displayName = 'DeviceMarkerRipple'

export default DeviceMarkerRipple
