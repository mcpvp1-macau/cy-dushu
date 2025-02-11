import IconRangeFinder from '@/assets/icons/jsx/right-tools/IconRangeFinder'
import { memo, type FC } from 'react'
import CloseableHeader from '../components/CloseableHeader'
import useMapDrawStore, { DrawType } from '@/store/map/useDraw.store'
import IconRangingAngle from '@/assets/icons/jsx/IconRangingAngle'
import IconRangingCircle from '@/assets/icons/jsx/IconRangingCircle'
import IconRangingArea from '@/assets/icons/jsx/IconRangingArea'
import IconRangingLine from '@/assets/icons/jsx/IconRangingLine'
import VerticalIconButton from '@/components/ui/button/VerticalButton'
import { useUnmount } from 'ahooks'

type PropsType = {
  onClose?: () => void
}

/** 测距工具面板 */
const RightRangingPanel: FC<PropsType> = memo(({ onClose }) => {
  const drawingType = useMapDrawStore((s) => s.drawing)
  const updateDrawing = useMapDrawStore((s) => s.updateDrawing)
  const updateDrawingColor = useMapDrawStore((s) => s.updateDrawingColor)

  const { t } = useTranslation()

  const items = useMemo(
    () =>
      [
        [
          DrawType.RangingLine,
          t('overlay.measure.polyline.title'),
          <IconRangingLine />,
        ],
        [
          DrawType.RangingArea,
          t('overlay.measure.polygon.title'),
          <IconRangingArea />,
        ],
        [
          DrawType.RangingCircle,
          t('overlay.measure.circle.title'),
          <IconRangingCircle />,
        ],
        [
          DrawType.RangingAngle,
          t('overlay.measure.angle.title'),
          <IconRangingAngle />,
        ],
      ] as const,
    [t],
  )

  useUnmount(() => {
    updateDrawing(DrawType.None)
  })

  return (
    <div className="w-[350px] backdrop-blur">
      <CloseableHeader onClose={onClose}>
        <div className="flex gap-2 items-center">
          <IconRangeFinder className="device-detail-icon" />
          <h6 className="text-white text-base">{t('overlay.measure.title')}</h6>
        </div>
      </CloseableHeader>
      <div className="mx-3 mb-3 flex justify-between gap-3">
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

RightRangingPanel.displayName = 'RightRangingPanel'

export default RightRangingPanel
