import IconDrawArea from '@/assets/icons/jsx/right-tools/IconDrawArea'
import { memo, type FC } from 'react'
import CloseableHeader from '../components/CloseableHeader'
import VerticalIconButton from '@/components/ui/button/VerticalButton'
import IconDrawCircle from '@/assets/icons/jsx/IconDrawCircle'
import IconDrawRect from '@/assets/icons/jsx/IconDrawRect'
import IconDrawPolygon from '@/assets/icons/jsx/IconDrawPolygon'
import useMapDrawStore, { DrawType } from '@/store/map/useDraw.store'
import IconDrawFan from '@/assets/icons/jsx/IconDrawFan'
import { useUnmount } from 'ahooks'

type PropsType = unknown

const AddGeometry: FC<PropsType> = memo(() => {
  const drawingType = useMapDrawStore((s) => s.drawing)
  const updateDrawing = useMapDrawStore((s) => s.updateDrawing)
  const updateDrawingColor = useMapDrawStore((s) => s.updateDrawingColor)

  const { t } = useTranslation()

  const items = useMemo(() => {
    return [
      [DrawType.Circle, t('overlay.drawing.circle.title'), <IconDrawCircle />],
      [DrawType.Rect, t('overlay.drawing.rect.title'), <IconDrawRect />],
      [
        DrawType.Polygon,
        t('overlay.drawing.polygon.title'),
        <IconDrawPolygon />,
      ],
      [DrawType.Fan, t('overlay.drawing.sector.title'), <IconDrawFan />],
    ] as const
  }, [t])

  useUnmount(() => {
    updateDrawing(DrawType.None)
  })

  return (
    <div className="w-[350px] backdrop-blur">
      <CloseableHeader>
        <div className="flex gap-2 items-center">
          <IconDrawArea className="device-detail-icon" />
          <h6 className="text-white text-base">{t('overlay.drawing.title')}</h6>
        </div>
      </CloseableHeader>
      <div className="mx-3 mb-3 flex gap-3">
        {items.map(([type, text, icon], index) => (
          <VerticalIconButton
            key={index}
            className={clsx('flex-1 h-11', {
              'text-primary': drawingType === type,
            })}
            iconClassName="h-5 scale-110"
            textClassName="h-6 leading-6 text-xs"
            icon={icon}
            onClick={() => {
              updateDrawing(type)
              updateDrawingColor('#4c90f0')
            }}
          >
            {text}
          </VerticalIconButton>
        ))}
      </div>
    </div>
  )
})

AddGeometry.displayName = 'AddGeometry'

export default AddGeometry
