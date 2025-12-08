import {FC, memo} from 'react'

type PropsType = Record<string, never>

const TrackingRadarStatusInfo: FC<PropsType> = memo(() => {
  return (
    <ul className="flex flex-wrap text-sm card-border px-1 p-1 bg-ground-2 m-2">
      <InfoItem name="trackingRadarStatus" label="雷达状态" />
      <InfoItem name="trackingRadarEmissionStatus" label="雷达辐射" />
      <InfoItem name="trackingRadarWorkingMode" label="工作模式" />
      <InfoItem name="trackingRadarFrequencyPoint" label="雷达频点" />
    </ul>
  )
})

TrackingRadarStatusInfo.displayName = 'TrackingRadarStatusInfo'

export default TrackingRadarStatusInfo
