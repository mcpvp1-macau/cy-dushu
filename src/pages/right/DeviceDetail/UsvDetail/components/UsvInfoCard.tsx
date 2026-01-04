import IconButton from '@/components/ui/button/IconButton'
import { StatusColorMap } from '@/enum/device'
import { useAppMsg } from '@/hooks/useAppMsg'
import TaskStatusQuickCreate from '@/pages/right/DeviceDetail/components/TaskStatusQuickCreate'
import { CopyOutlined } from '@ant-design/icons'

const I: FC<{ l: ReactNode; v: ReactNode }> = ({ l, v }) => {
  return (
    <li className="w-1/2 flex gap-1 leading-5 text-sm">
      <div className="whitespace-nowrap">{l}:</div>
      <div className="text-hightlight flex-1 min-w-0">{v}</div>
    </li>
  )
}

type PropsType = Partial<{
  modelNumber: string
  onlineStatus: string
  electricity: number
  longitude: number
  latitude: number
  heading: number
  speed: number
  deviceId: string
}>

const UsvInfoCard: FC<PropsType> = memo(
  ({
    modelNumber,
    onlineStatus,
    electricity,
    longitude,
    latitude,
    heading,
    speed,
    deviceId,
  }) => {
    const { t } = useTranslation()
    const headingLabel = t('device.heading', { defaultValue: '艏向' })
    const msgApi = useAppMsg()

    const formatNumber = (value: number | undefined, fractionDigits = 2) => {
      if (value === undefined || value === null || Number.isNaN(value)) return '-'
      return Number(value).toFixed(fractionDigits)
    }

    // 复制经纬度，空值显示为占位符
    const handleCopy = useMemoizedFn(async () => {
      const text = `${formatNumber(longitude, 5)}, ${formatNumber(latitude, 5)}`
      await navigator.clipboard.writeText(text)
      msgApi.success(t('common.copySuccess'))
    })

    return (
      <ul className="p-2 mx-3 mr-[9px] card-border text-sm flex flex-wrap">
        <I l={t('common.modelNumber')} v={modelNumber || '-'} />
        <I
          l={t('common.onlineStatus')}
          v={
            <span style={{ color: onlineStatus ? StatusColorMap[onlineStatus] : undefined }}>
              {onlineStatus ? t(`device.status.online.${onlineStatus}`) : '-'}
            </span>
          }
        />
        <I l={t('common.task')} v={<TaskStatusQuickCreate deviceId={deviceId} />} />
        <I l={t('common.electricity')} v={`${electricity ?? '-'} %`} />
        <I l={t('common.longitude')} v={formatNumber(longitude, 5)} />
        <I
          l={t('common.latitude')}
          v={
            <div className="flex items-center gap-1">
              <span>{formatNumber(latitude, 5)}</span>
              <IconButton
                tippyProps={{
                  content: t('common.copyCoordinates', { defaultValue: '复制坐标' }),
                }}
                onClick={handleCopy}
              >
                <CopyOutlined />
              </IconButton>
            </div>
          }
        />
        <I l={t('common.speed')} v={`${formatNumber(speed)} m/s`} />
        <I l={headingLabel} v={`${formatNumber(heading, 1)} °`} />
      </ul>
    )
  },
)

UsvInfoCard.displayName = 'UsvInfoCard'

export default UsvInfoCard
