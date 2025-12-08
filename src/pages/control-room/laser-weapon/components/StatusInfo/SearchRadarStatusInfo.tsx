import {FC, memo} from 'react'

type PropsType = {}

const SearchRadarStatusInfo: FC<PropsType> = memo(() => {
  return (
    <ul className="flex flex-wrap text-sm card-border px-1 p-1 bg-[#28323C] m-2">
      <InfoItem name="searchRadarStatus" label="雷达状态" />
      <InfoItem name="searchRadarEmissionStatus" label="雷达辐射" />
      <InfoItem name="searchRadarRotationSpeed" label="雷达转速" />
      <InfoItem name="searchRadarFrequencyPoint" label="雷达频点" />
    </ul>
  )
})

SearchRadarStatusInfo.displayName = 'SearchRadarStatusInfo'

export default SearchRadarStatusInfo
