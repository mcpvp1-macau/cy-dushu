import { StatusColorMap, StatusMap } from '@/enum/device'
import { useWangLouControlRoomStore } from '@/store/context-store/useWangLouControlRoom.store'
import { useRealOnlineStatus } from '@/store/useGlobalWebSocket.store'
import { Tooltip } from 'antd'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1 leading-5 text-[12px]">
      <Tooltip title={l}>
        <div className="truncate w-[60px]">{l}</div>
      </Tooltip>
      <div>:</div>
      {v === undefined ? '-' : v}
    </li>
  )
}

type PropsType = {
  data: API_DEVICE.domain.Device
}

const WangLouInfoCard: FC<PropsType> = memo(({ data }) => {
  const modelName =
    data.deviceTags?.find(
      (item: { tagName: string }) => item.tagName === 'MODEL_NUMBER',
    )?.tagValue || '-'
  const status = useRealOnlineStatus(data.deviceId)
  const state = useWangLouControlRoomStore((s) => s.state)
  const { properties = {} } = data || {}
  // const { statusInfo = {} } = properties
  // console.info('data---', data)
  return (
    <div>
      <ul className="py-[10px] text-sm flex flex-wrap">
        <I l="设备型号" v={modelName} />
        <I
          l="在线状态"
          v={
            <p className="flex gap-2">
              <span style={{ color: StatusColorMap[status!] }}>
                {StatusMap[status!] || '-'}
              </span>
            </p>
          }
        />
        <I
          l="经度"
          v={
            (state.longitude ?? properties.longitude)?.toFixed(5) ||
            '-'
          }
        />
        <I
          l="纬度"
          v={
            (state.latitude ?? properties.latitude)?.toFixed(5) ||
            '-'
          }
        />
        {/* <I l="高度" v={`${state.statusInfo?.altitude?.toFixed(2) || 0} m`} />
        <I l="速度" v={`${state.statusInfo?.speed?.toFixed(2) || 0} m/s`} />
        <I l="车体横滚" v={`${state.statusInfo?.roll?.toFixed(2) || 0} m`} />
        <I l="车体俯仰" v={`${state.statusInfo?.pitch?.toFixed(2) || 0} m/s`} /> */}
      </ul>
    </div>
  )
})

WangLouInfoCard.displayName = 'WangLouInfoCard'

export default WangLouInfoCard
