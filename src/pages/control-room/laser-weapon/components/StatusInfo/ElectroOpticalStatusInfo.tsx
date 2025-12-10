import { FC, memo } from 'react'
import InfoItem from './InfoItem'

type PropsType = Record<string, never>

const ElectroOpticalStatusInfo: FC<PropsType> = memo(() => {
  return (
    <ul className="flex flex-wrap text-sm card-border px-1 p-1 bg-ground-3 m-2">
      <InfoItem name="electroOpticalSystemPresenceStatus" label="光电存在" />
      <InfoItem name="electroOpticalSystemStatu" label="光电状态" />
      <InfoItem name="xxxxx" label="光电模式" defaultValue="-" />
      <InfoItem name="searchModeDataCycle" label="搜索周期" />
    </ul>
  )
})

ElectroOpticalStatusInfo.displayName = 'ElectroOpticalStatusInfo'

export default ElectroOpticalStatusInfo
