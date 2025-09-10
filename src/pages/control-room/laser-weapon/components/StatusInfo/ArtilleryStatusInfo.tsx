import { FC, memo, ReactNode } from 'react'
import InfoItem, { I } from './InfoItem'
import { useOthersControlRoomStore } from '@/store/context-store/useOthersControlRoom.store'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'

type PropsType = {}

const StatusInfo: FC<PropsType> = memo(() => {
  const deviceDetail = useDeviceDetailStore((s) => s.deviceDetail)!
  const { properties, deviceModel } = deviceDetail
  const artilleryDeviceList = useOthersControlRoomStore(
    (s) => s.state['artilleryDeviceList'],
  )

  const specsMap = useMemo(() => {
    const list = deviceModel.properties.find(
      (item) => item.identifier === 'artilleryDeviceList',
    )
    // @ts-ignore
    return list?.dataType?.specs?.item?.specs.reduce((acc, item) => {
      acc[item.identifier] = item
      return acc
    }, {})
  }, [deviceModel])

  console.info(specsMap)

  const devicelist = artilleryDeviceList ?? properties['artilleryDeviceList']

  return (
    <ul className="flex flex-wrap text-sm card-border p-3">
      <InfoItem name="artilleryRange" label="火炮射程" />
      <InfoItem name="xxxxx" label="导弹射程" defaultValue="未配备" />
      <InfoItem name="maximumControlledArtilleryCapability" label="最大火控" />
      <InfoItem name="maximumLauncher" label="最大发射架" />
      <InfoItem name="numberOfControlledArtillery" label="当前火炮" />
      <InfoItem name="numberOfControlledLaunchers" label="当前发射架" />
      {/** TODO mock */}
      {(devicelist || [{}, {}])?.map((item, i) => {
        return (
          <div key={i} className="mt-2">
            <div className="flex items-center gap-1">
              <div className="w-[2px] h-[8px] bg-[#15B371]"></div>
              火炮 {i + 1}
            </div>
            <div className="flex text-xs text-fore pl-[6px] flex-wrap pt-1">
              <InfoItem
                name="workStatus"
                label="工作状态"
                value={item.workStatus}
                specs={specsMap['workStatus']}
              />
              <InfoItem
                name="trackingStatus"
                label="随动状态"
                value={item.trackingStatus}
                specs={specsMap['trackingStatus']}
              />
              <InfoItem
                name="firingCondition"
                label="击发条件"
                value={item.firingCondition}
                specs={specsMap['firingCondition']}
              />
              <InfoItem
                name="firingStatus"
                label="击发状态"
                value={item.firingStatus}
                specs={specsMap['firingStatus']}
              />
              <InfoItem
                name="communicationStatus"
                label="通信状态"
                value={item.communicationStatus}
                specs={specsMap['communicationStatus']}
              />
              <InfoItem
                name="ammunitionInfo"
                label="弹种信息"
                value={item.ammunitionInfo}
                specs={specsMap['ammunitionInfo']}
              />
            </div>
          </div>
        )
      })}
    </ul>
  )
})

StatusInfo.displayName = 'StatusInfo'

export default StatusInfo
