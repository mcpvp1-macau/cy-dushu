import { FC, memo, ReactNode } from 'react'

import InfoItem, { I } from './InfoItem'

type PropsType = {}

const SearchRadarStatusInfo: FC<PropsType> = memo(() => {
  return (
    <ul className="flex flex-wrap text-sm card-border p-3">
      <InfoItem name="searchRadarStatus" label="雷达状态" />
      <InfoItem name="searchRadarEmissionStatus" label="雷达辐射" />
      <InfoItem name="searchRadarRotationSpeed" label="雷达转速" />
      <InfoItem name="searchRadarFrequencyPoint" label="雷达频点" />
    </ul>
  )
})

SearchRadarStatusInfo.displayName = 'SearchRadarStatusInfo'

export default SearchRadarStatusInfo
