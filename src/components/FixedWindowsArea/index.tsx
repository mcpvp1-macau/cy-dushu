import useFixedWindowsStore from '@/store/useFixedWindows.store'
import { memo, type FC } from 'react'
import FixedWindowLiveVideo from './components/LiveVideo'

type PropsType = unknown

const FixedWindowArea: FC<PropsType> = memo(() => {
  const windows = useFixedWindowsStore((s) => s.windows)

  return (
    <div className="absolute z-[100] inset-0 pointer-events-none">
      {windows.map((w) => (
        <FixedWindowLiveVideo key={w.id} data={w} />
      ))}
    </div>
  )
})

FixedWindowArea.displayName = 'FixedWindowArea'

export default FixedWindowArea
