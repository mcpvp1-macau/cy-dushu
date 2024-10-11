import AppEmpty from '@/components/AppEmpty'
import { DatePicker } from 'antd'
import { memo, type FC } from 'react'

const { RangePicker } = DatePicker

type PropsType = unknown

const HistoryTrack: FC<PropsType> = memo(() => {
  return (
    <div>
      <div className="py-3">
        <RangePicker />
      </div>
      <AppEmpty className="my-10" />
    </div>
  )
})

HistoryTrack.displayName = 'HistoryTrack'

export default HistoryTrack
