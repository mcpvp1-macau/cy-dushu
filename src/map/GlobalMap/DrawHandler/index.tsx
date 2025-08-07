import useMapDrawStore, { DrawType } from '@/store/map/useDraw.store'
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
import useCesiumMouseCrosshair from '@/map/CesiumMap/hooks/useCesiumMouseCrosshair'

type PropsType = unknown

/** 绘制相关 (打点, 划线) */
const DrawHandler: FC<PropsType> = memo(() => {
  const drawingType = useMapDrawStore((s) => s.drawing)
  const isFlightArea = useMapDrawStore((s) => s.isFlightArea)
  const isDrawingDeviceArea = useMapDrawStore((s) => s.isDrawingDeviceArea)

  const { t } = useTranslation()

  useCesiumMouseCrosshair(drawingType !== DrawType.None)

  const msgApi = useAppMsg()
  const queryClient = useQueryClient()

  const handleSuccess = useMemoizedFn(async () => {
    if (isFlightArea) {
      await queryClient.invalidateQueries({
        queryKey: ['getFlightAreaList'],
      })
    } else if (isDrawingDeviceArea) {
      await queryClient.invalidateQueries({
        queryKey: ['getDeviceOverlayList'],
      })
      const sto = useMapDrawStore.getState()
      sto.updateIsDrawingDeviceArea(false)
      sto.updateBindingDeviceId('')
      sto.updateDrawing(DrawType.None)
    } else {
      await queryClient.invalidateQueries({
        queryKey: ['overlayList'],
        exact: false,
      })
    }
    msgApi.success(t('common.success'))
    useMapDrawStore.getState().updateDrawing(DrawType.None)
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
