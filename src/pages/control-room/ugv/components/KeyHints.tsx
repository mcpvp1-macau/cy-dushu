import { useUGVControlRoomStore } from '@/store/context-store/useUGVControlRoom.store'

const ControlRoomUGVKeyHints: FC = memo(() => {
  const controlInfo = useUGVControlRoomStore((s) => s.controlInfo)

  const hintItems = useMemo(
    () => [
      {
        keyLabel: 'W',
        desc: '前进 (+xSpeed)',
        active: (controlInfo.xSpeed ?? 0) > 0,
        value: controlInfo.xSpeed ?? 0,
      },
      {
        keyLabel: 'S',
        desc: '后退 (-xSpeed)',
        active: (controlInfo.xSpeed ?? 0) < 0,
        value: controlInfo.xSpeed ?? 0,
      },
      {
        keyLabel: 'Q',
        desc: '左转 (+yawSpeed)',
        active: (controlInfo.yawSpeed ?? 0) > 0,
        value: controlInfo.yawSpeed ?? 0,
      },
      {
        keyLabel: 'E',
        desc: '右转 (-yawSpeed)',
        active: (controlInfo.yawSpeed ?? 0) < 0,
        value: controlInfo.yawSpeed ?? 0,
      },
    ],
    [controlInfo.xSpeed, controlInfo.yawSpeed],
  )

  return (
    <div className="rounded-2xl border border-ground-3 bg-ground-1 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold leading-tight">键盘控制</p>
        <span className="text-[11px] text-ground-9">实时响应 WSQE</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {hintItems.map((item) => (
          <div
            key={item.desc}
            className={clsx(
              'flex flex-col gap-1 rounded-xl border px-3 py-2 text-xs transition-all',
              item.active
                ? 'border-green-500 bg-green-500/10 text-green-400 shadow-[0_0_12px_rgba(34,197,94,0.35)]'
                : 'border-ground-4 bg-ground-2',
            )}
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-current text-sm font-semibold">
              {item.keyLabel}
            </span>
            <span className="font-medium">{item.desc}</span>
            <span className="text-[10px] text-ground-10">
              当前值 {item.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
})

ControlRoomUGVKeyHints.displayName = 'ControlRoomUGVKeyHints'

export default ControlRoomUGVKeyHints
