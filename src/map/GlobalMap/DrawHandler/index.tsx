import useMapDrawStore, { DrawType } from '@/store/map/useDraw.store'
import { memo, type FC } from 'react'
import { useCesium } from 'resium'
import DrawPoint from './DrawPoint'
import DrawCircle from './DrawCircle'
import { useAppMsg } from '@/hooks/useAppMsg'
import DrawRect from './DrawRect'
import DrawPolygon from './DrawPolygon'
import DrawFan from './DrawFan'
import DrawRangingLine from './DrawRangingLine'
import DrawRangingArea from './DrawRangingArea'
import DrawRangingCircle from './DrawRangingCircle'
import DrawRangingAngle from './DrawRangingAngle'

type PropsType = unknown

/** 绘制相关 (打点, 划线) */
const DrawHandler: FC<PropsType> = memo(() => {
  const drawingType = useMapDrawStore((s) => s.drawing)
  const updateDrawingType = useMapDrawStore((s) => s.updateDrawing)

  const { viewer } = useCesium()
  useEffect(() => {
    if (drawingType === DrawType.None) {
      return
    }
    viewer?.canvas.setAttribute('style', 'cursor: crosshair')
    return () => {
      viewer?.canvas.setAttribute('style', 'cursor: auto')
    }
  }, [drawingType])

  const msgApi = useAppMsg()
  const queryClient = useQueryClient()
  const handleSuccess = useMemoizedFn(async () => {
    updateDrawingType(DrawType.None)
    msgApi.success('新增成功')
    await queryClient.invalidateQueries({
      queryKey: ['overlayList'],
      exact: false,
    })
  })

  if (drawingType === DrawType.Point) {
    return <DrawPoint onSuccess={handleSuccess} />
  }

  if (drawingType === DrawType.Circle) {
    return <DrawCircle onSuccess={handleSuccess} />
  }
  if (drawingType === DrawType.Rect) {
    return <DrawRect onSuccess={handleSuccess} />
  }
  if (drawingType === DrawType.Polygon) {
    return <DrawPolygon onSuccess={handleSuccess} />
  }
  if (drawingType === DrawType.Fan) {
    return <DrawFan onSuccess={handleSuccess} />
  }
  if (drawingType === DrawType.RangingLine) {
    return <DrawRangingLine />
  }
  if (drawingType === DrawType.RangingArea) {
    return <DrawRangingArea />
  }
  if (drawingType === DrawType.RangingCircle) {
    return <DrawRangingCircle />
  }
  if (drawingType === DrawType.RangingAngle) {
    return <DrawRangingAngle />
  }
  return null
})

DrawHandler.displayName = 'DrawHandler'

export default DrawHandler
