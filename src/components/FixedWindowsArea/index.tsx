import useFixedWindowsStore from '@/store/useFixedWindows.store'
import { memo, type FC } from 'react'
import FixedWindowLiveVideo from './components/LiveVideo'
import FixedWindowDeviceDetail from './components/DeviceDetail'

type PropsType = unknown

const FixedWindowArea: FC<PropsType> = memo(() => {
  const windows = useFixedWindowsStore((s) => s.windows)

  return (
    <div className="absolute z-[100] inset-0 pointer-events-none">
      {windows.map((w) =>
        w.params.type === 'live-video' ? (
          <FixedWindowLiveVideo key={w.id} data={w as any} />
        ) : w.params.type === 'device-detail' ? (
          <FixedWindowDeviceDetail key={w.id} data={w as any} />
        ) : null,
      )}
    </div>
  )
})

FixedWindowArea.displayName = 'FixedWindowArea'

export default FixedWindowArea
