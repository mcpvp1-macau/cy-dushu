import { FC, memo, ReactNode } from 'react'

import InfoItem, { I } from './InfoItem'

type PropsType = {}

const ElectroOpticalStatusInfo: FC<PropsType> = memo(() => {
  return (
    <ul className="flex flex-wrap text-sm card-border p-3">
      <InfoItem name="electroOpticalSystemPresenceStatus" label="光电存在" />
      <InfoItem name="electroOpticalSystemStatu" label="光电状态" />
      <InfoItem name="xxxxx" label="光电模式" defaultValue='-' />
      <InfoItem name="searchModeDataCycle" label="搜索周期" />
    </ul>
  )
})

ElectroOpticalStatusInfo.displayName = 'ElectroOpticalStatusInfo'

export default ElectroOpticalStatusInfo
