import useMixARStore, { ArFeature } from '@/store/control-room/useMixAR.store'
import useSettingStore from '@/store/useSetting.store'
import { polygonCentroid } from '@/utils/geometry'
import { useEffect, useRef } from 'react'

type PropsType = unknown

/** 绘制闭合元素 (建筑) */
const drawClosedPolygon = (
  ctx: CanvasRenderingContext2D,
  vertices: number[][],
  bgColor = '#ffffff33',
  lineColor = '#000000',
  lineWidth = 2,
) => {
  ctx.beginPath()
  vertices.forEach((point, i) => {
    if (i === vertices.length - 1) {
      return
    }
    ctx.lineTo(point[0], point[1])
  })
  ctx.closePath()
  ctx.lineWidth = lineWidth
  ctx.strokeStyle = lineColor
  ctx.stroke()

  ctx.fillStyle = bgColor
  ctx.fill()
}

/** 绘制线条元素 (路) */
const drawLine = (
  ctx: CanvasRenderingContext2D,
  vertices: number[][],
  color = '#fbbf24',
  lineWidth = 3,
) => {
  ctx.lineWidth = 3 // 描边的宽度
  ctx.beginPath()
  vertices.forEach((point) => {
    ctx.lineTo(point[0], point[1])
  })
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.stroke()
}

/** 虚实融合 Canvas */
const MixARCanvas: FC<PropsType> = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const arData = useMixARStore((s) => s.arData)
  const frameWidth = useMixARStore((s) => s.source_frame_width)
  const frameHeight = useMixARStore((s) => s.source_frame_height)
  const vrSetting = useSettingStore((s) => s.virtualReal)

  useEffect(() => {
    if (!canvasRef.current) {
      return
    }
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')

    if (!ctx) {
      return
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = 'red'

    const w = 32,
      h = 32 / (frameWidth / frameHeight)
    const deltaW = frameWidth / w,
      deltaH = frameHeight / h
    const textBox = Array.from({
      length: w,
    }).map(() => {
      return Array.from({
        length: h,
      }).map(() => ({
        text: '',
        position: [0, 0],
      }))
    })

    const mainRoads: ArFeature[] = []
    const subRoads: ArFeature[] = []
    const building: ArFeature[] = []

    for (const data of arData) {
      if (!Array.isArray(data.coodinates) || data.coodinates.length < 2) {
        continue
      }
      if (data.isClosed) {
        // 建筑
        if (vrSetting.building.enable) {
          building.push(data)
        }
      } else {
        const name = data.properties.name ?? data.properties.RoadName
        // 路
        if (name && name !== ' ') {
          // 主路
          if (vrSetting.mainRoad.enable) {
            mainRoads.push(data)
          }
        } else {
          if (vrSetting.subRoad.enable) {
            subRoads.push(data)
          }
        }
      }
    }

    for (const data of building) {
      drawClosedPolygon(
        ctx,
        data.coodinates,
        vrSetting.building.color,
        vrSetting.building.borderColor,
        vrSetting.building.borderSize,
      )
      const name = data.properties.name ?? data.properties.building ?? ''
      if (name) {
        const textPosition = polygonCentroid(
          data.coodinates.map((e) => [e[0], e[1]]),
        )
        const i = Math.floor(textPosition[0] / deltaW)
        const j = Math.floor(textPosition[1] / deltaH)
        if (0 <= i && i < w && 0 <= j && j < h) {
          textBox[i][j] = {
            text: name,
            position: textPosition,
          }
        }
      }
    }

    for (const data of mainRoads) {
      drawLine(
        ctx,
        data.coodinates,
        vrSetting.mainRoad.borderColor,
        vrSetting.mainRoad.size + vrSetting.mainRoad.borderSize * 2,
      )
    }

    for (const data of mainRoads) {
      drawLine(
        ctx,
        data.coodinates,
        vrSetting.mainRoad.color,
        vrSetting.mainRoad.size,
      )
      const name = data.properties.name ?? data.properties.RoadName ?? ''
      if (name) {
        const textPosition = polygonCentroid(
          data.coodinates.map((e) => [e[0], e[1]]),
        )
        const i = Math.floor(textPosition[0] / deltaW)
        const j = Math.floor(textPosition[1] / deltaH)
        if (0 <= i && i < w && 0 <= j && j < h) {
          textBox[i][j] = {
            text: name,
            position: textPosition,
          }
        }
      }
    }

    for (const data of subRoads) {
      drawLine(
        ctx,
        data.coodinates,
        vrSetting.subRoad.borderColor,
        vrSetting.subRoad.size + vrSetting.subRoad.borderSize * 2,
      )
    }
    for (const data of subRoads) {
      drawLine(
        ctx,
        data.coodinates,
        vrSetting.subRoad.color,
        vrSetting.subRoad.size,
      )
    }

    if (vrSetting.text.enable) {
      // 绘制文字
      for (const row of textBox) {
        for (const cell of row) {
          if (cell.text) {
            ctx.fillStyle = vrSetting.text.color
            ctx.strokeStyle = vrSetting.text.borderColor
            ctx.lineWidth = vrSetting.text.borderSize // 描边的宽度
            ctx.font = `${vrSetting.text.size}px sans-serif`
            ctx.strokeText(cell.text, cell.position[0], cell.position[1])
            ctx.fillText(cell.text, cell.position[0], cell.position[1])
          }
        }
      }
    }
  }, [arData, vrSetting])

  if (!frameWidth || !frameHeight) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      width={frameWidth}
      height={frameHeight}
      style={{
        position: 'absolute',
        left: '0',
        top: '0',
        width: '100%',
        height: '100%',
        zIndex: 50,
      }}
    />
  )
})

MixARCanvas.displayName = 'MixARCanvas'

export default MixARCanvas
