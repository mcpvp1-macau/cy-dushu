import useRightMode from '@/store/layout/useRightMode.store'
import CloseableHeader from '../components/CloseableHeader'
import IconTanQi from '@/assets/icons/jsx/IconTanQi'
import TanqiDemo from '@/components/Tanqi/demo/TanqiDemo'
import {
  TANQI_FLOAT_DEFAULT_HEIGHT,
  TANQI_FLOAT_DEFAULT_WIDTH,
  useTanqiDialogStore,
} from '@/components/Tanqi/demo/TanqiFloatDialog'
import ActionTanqi from './ActionTanqi'
import { RIGHT_OUTER_PANEL_WIDTH } from '../constants'
import { useFullFlowDemoStore } from '@/demo/situation/full-flow-demo.store'
import SeatTanqiDemo from '@/components/Tanqi/demo/SeatTanqiDemo'

type PropsType = unknown

const DRAG_OUT_THRESHOLD = 56
const FLOAT_MIN_WIDTH = 380
const FLOAT_MIN_HEIGHT = 420
const FLOAT_DRAG_OUT_HEIGHT = TANQI_FLOAT_DEFAULT_HEIGHT

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

const RightActionTanqiWrapper: FC<PropsType> = memo(() => {
  const demoPageMode = useFullFlowDemoStore((s) => s.mode)
  const handleDragOutStart = useMemoizedFn(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.button !== 0) {
        return
      }
      if ((e.target as HTMLElement).closest('button')) {
        return
      }

      const startX = e.clientX
      const startY = e.clientY
      let draggedOut = false
      let cleanup = () => {}

      const handleMove = (ev: PointerEvent) => {
        const dx = ev.clientX - startX
        const dy = Math.abs(ev.clientY - startY)
        if (draggedOut || dx > -DRAG_OUT_THRESHOLD || Math.abs(dx) <= dy) {
          return
        }

        draggedOut = true
        const dialogState = useTanqiDialogStore.getState()
        const preferredWidth =
          dialogState.width === RIGHT_OUTER_PANEL_WIDTH
            ? TANQI_FLOAT_DEFAULT_WIDTH
            : dialogState.width
        const width = clamp(
          preferredWidth,
          FLOAT_MIN_WIDTH,
          window.innerWidth - 32,
        )
        const height = clamp(
          Math.min(dialogState.height, FLOAT_DRAG_OUT_HEIGHT),
          FLOAT_MIN_HEIGHT,
          window.innerHeight - 32,
        )

        useRightMode.getState().updateRightOuterMode(null)
        useRightMode.getState().updateRightOuterDetailId(null)
        useTanqiDialogStore.getState().updateRect({
          x: clamp(ev.clientX - 24, 16, window.innerWidth - width - 16),
          y: clamp(ev.clientY - 24, 16, window.innerHeight - height - 16),
          width,
          height,
        })
        useTanqiDialogStore.getState().updateOpen(true)
        cleanup()
      }

      const handleUp = () => {
        cleanup()
      }

      cleanup = () => {
        window.removeEventListener('pointermove', handleMove)
        window.removeEventListener('pointerup', handleUp)
        window.document.body.style.userSelect = ''
      }

      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
      window.document.body.style.userSelect = 'none'
    },
  )

  return (
    <div
      className="h-full overflow-hidden flex flex-col"
      style={{ width: RIGHT_OUTER_PANEL_WIDTH }}
    >
      <CloseableHeader
        className="cursor-grab select-none touch-none active:cursor-grabbing"
        onPointerDown={handleDragOutStart}
        onClose={() => {
          useRightMode.getState().updateRightOuterMode(null)
          useRightMode.getState().updateRightOuterDetailId(null)
        }}
      >
        <div className="flex gap-2 items-center">
          <IconTanQi className="device-detail-icon" />
          <h6 className="text-hightlight text-base">檀棋</h6>
        </div>
      </CloseableHeader>
      <div className="flex-1 overflow-hidden">
        {demoPageMode === 'seat-demo' ? (
          <SeatTanqiDemo />
        ) : globalConfig.useFixedWingDemo ? (
          <TanqiDemo />
        ) : (
          <ActionTanqi />
        )}
      </div>
    </div>
  )
})

RightActionTanqiWrapper.displayName = 'RightActionTanqiWrapper'

export default RightActionTanqiWrapper
