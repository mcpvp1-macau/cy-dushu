import IconTanQi from '@/assets/icons/jsx/IconTanQi'
import {
  CloseOutlined,
  FolderAddOutlined,
  LayoutOutlined,
  PushpinFilled,
  PushpinOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import clsx from 'clsx'
import { createPortal } from 'react-dom'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import TanqiDemo from './TanqiDemo'

type PropsType = unknown

type DialogStateType = {
  open: boolean
  /** 钉住后不可拖动 */
  pinned: boolean
  x: number
  y: number
  width: number
  height: number
}

type DialogActionsType = {
  toggleOpen: () => void
  updateOpen: (open: boolean) => void
  togglePinned: () => void
  updateRect: (rect: Partial<Pick<DialogStateType, 'x' | 'y' | 'width' | 'height'>>) => void
}

export const TANQI_FLOAT_DEFAULT_WIDTH = 520
export const TANQI_FLOAT_DEFAULT_HEIGHT = 600

/** 檀棋浮窗状态（位置与尺寸本地持久化） */
export const useTanqiDialogStore = create<DialogStateType & DialogActionsType>()(
  persist(
    (set, get) => ({
      open: false,
      pinned: false,
      x: -1,
      y: -1,
      width: TANQI_FLOAT_DEFAULT_WIDTH,
      height: TANQI_FLOAT_DEFAULT_HEIGHT,
      toggleOpen: () => set({ open: !get().open }),
      updateOpen: (open) => set({ open }),
      togglePinned: () => set({ pinned: !get().pinned }),
      updateRect: (rect) => set(rect),
    }),
    {
      name: 'tanqi-float-dialog',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

const MIN_WIDTH = 380
const MIN_HEIGHT = 420

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/** 檀棋浮窗（支持钉住 / 拖拽 / 改变大小, 对齐原型 dialog-float） */
const TanqiFloatDialog: FC<PropsType> = memo(() => {
  const open = useTanqiDialogStore((s) => s.open)
  const pinned = useTanqiDialogStore((s) => s.pinned)
  const x = useTanqiDialogStore((s) => s.x)
  const y = useTanqiDialogStore((s) => s.y)
  const width = useTanqiDialogStore((s) => s.width)
  const height = useTanqiDialogStore((s) => s.height)

  /** 默认位置: 右上角（与原型一致, 避开右侧工具栏） */
  const left = x >= 0 ? x : Math.max(window.innerWidth - width - 64, 16)
  const top = y >= 0 ? y : 88

  /** 头部拖拽 */
  const handleDragStart = useMemoizedFn((e: React.PointerEvent) => {
    if (pinned) {
      return
    }
    e.preventDefault()
    const startX = e.clientX
    const startY = e.clientY
    const originLeft = left
    const originTop = top

    const onMove = (ev: PointerEvent) => {
      useTanqiDialogStore.getState().updateRect({
        x: clamp(originLeft + ev.clientX - startX, 0, window.innerWidth - 120),
        y: clamp(originTop + ev.clientY - startY, 0, window.innerHeight - 80),
      })
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  })

  /** 右下角缩放 */
  const handleResizeStart = useMemoizedFn((e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const originWidth = width
    const originHeight = height

    const onMove = (ev: PointerEvent) => {
      useTanqiDialogStore.getState().updateRect({
        width: clamp(
          originWidth + ev.clientX - startX,
          MIN_WIDTH,
          window.innerWidth - 32,
        ),
        height: clamp(
          originHeight + ev.clientY - startY,
          MIN_HEIGHT,
          window.innerHeight - 32,
        ),
      })
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  })

  if (!open) {
    return null
  }

  return createPortal(
    <div
      className="fixed z-[60] flex flex-col rounded-lg overflow-hidden bg-ground-1/95 backdrop-blur border border-solid border-ground-3 shadow-[0_8px_32px_#00000099]"
      style={{ left, top, width, height }}
    >
      {/* 头部 (拖拽区) */}
      <div
        className={clsx(
          'h-10 shrink-0 px-3 flex items-center gap-2 bg-ground-2 border-b border-solid border-ground-3 select-none touch-none',
          pinned ? 'cursor-default' : 'cursor-move',
        )}
        onPointerDown={handleDragStart}
      >
        <IconTanQi className="device-detail-icon" />
        <h6 className="text-hightlight text-base">檀棋</h6>
        <div
          className="ml-auto flex items-center gap-1"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            className={clsx(
              'size-7 flex items-center justify-center rounded bg-transparent border-0 cursor-pointer',
              pinned ? 'text-primary' : 'text-fore hover:text-hightlight',
            )}
            title={pinned ? '取消固定' : '固定'}
            onClick={() => useTanqiDialogStore.getState().togglePinned()}
          >
            {pinned ? <PushpinFilled /> : <PushpinOutlined />}
          </button>
          <button
            className="size-7 flex items-center justify-center rounded bg-transparent border-0 text-fore opacity-60 cursor-not-allowed"
            title="搜索（未接入）"
            disabled
          >
            <SearchOutlined />
          </button>
          <button
            className="size-7 flex items-center justify-center rounded bg-transparent border-0 text-fore opacity-60 cursor-not-allowed"
            title="新建（未接入）"
            disabled
          >
            <FolderAddOutlined />
          </button>
          <button
            className="size-7 flex items-center justify-center rounded bg-transparent border-0 text-fore opacity-60 cursor-not-allowed"
            title="历史（未接入）"
            disabled
          >
            <LayoutOutlined />
          </button>
          <button
            className="size-7 flex items-center justify-center rounded bg-transparent border-0 text-fore hover:text-hightlight cursor-pointer"
            title="关闭"
            onClick={() => useTanqiDialogStore.getState().updateOpen(false)}
          >
            <CloseOutlined />
          </button>
        </div>
      </div>
      {/* 会话内容 */}
      <div className="grow overflow-hidden">
        <TanqiDemo />
      </div>
      {/* 右下角缩放手柄 */}
      <div
        className="absolute right-0 bottom-0 size-4 cursor-nwse-resize touch-none"
        role="separator"
        aria-label="调整檀棋窗口尺寸"
        onPointerDown={handleResizeStart}
      >
        <svg viewBox="0 0 16 16" className="size-full text-fore opacity-50">
          <path
            d="M14 6 L6 14 M14 10 L10 14"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      </div>
    </div>,
    document.body,
  )
})

TanqiFloatDialog.displayName = 'TanqiFloatDialog'

export default TanqiFloatDialog
