import { StatusColorMap } from '@/enum/device'
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
      <span className="text-white text-[14px]">
        {v === undefined ? '-' : v}
      </span>
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
  const { t } = useTranslation()
  const { properties = {} } = data || {}
  // const { statusInfo = {} } = properties
  return (
    <div>
      <ul className="py-[10px] text-sm flex flex-wrap">
        <I l={t('resource.table.deviceModel.title')} v={modelName} />
        <I
          l={t('common.onlineStatus')}
          v={
            <p className="flex gap-2">
              <span style={{ color: StatusColorMap[status!] }}>
                {t(`device.status.online.${status}`) || '-'}
              </span>
            </p>
          }
        />
        <I
          l={t('common.longitude')}
          v={(state.longitude ?? properties.longitude)?.toFixed(5) || '-'}
        />
        <I
          l={t('common.latitude')}
          v={(state.latitude ?? properties.latitude)?.toFixed(5) || '-'}
        />
      </ul>
    </div>
  )
})

WangLouInfoCard.displayName = 'WangLouInfoCard'

export default WangLouInfoCard
