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

type PropsType = unknown

const items = [
  [DrawType.RangingLine, '测线', <IconRangingLine />],
  [DrawType.RangingArea, '测面', <IconRangingArea />],
  [DrawType.RangingCircle, '测圆', <IconRangingCircle />],
  [DrawType.RangingAngle, '测角', <IconRangingAngle />],
] as const

const header = (
  <div className="flex gap-2 items-center">
    <IconRangeFinder className="device-detail-icon" />
    <h6 className="text-white text-base">测距</h6>
  </div>
)

/** 测距工具面板 */
const RightRangingPanel: FC<PropsType> = memo(() => {
  const drawingType = useMapDrawStore((s) => s.drawing)
  const updateDrawing = useMapDrawStore((s) => s.updateDrawing)
  const updateDrawingColor = useMapDrawStore((s) => s.updateDrawingColor)

  useUnmount(() => {
    updateDrawing(DrawType.None)
  })

  return (
    <div className="w-[350px] backdrop-blur">
      <CloseableHeader>{header}</CloseableHeader>
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
