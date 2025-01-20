import dayjs from 'dayjs'
import { getDeviceDetail } from '@/service/modules/device'
import XCard from '@/components/ui/XCard'
import DeviceIconUAV from '@/assets/icons/jsx/device/DeviceIconUAV'
import IconButton from '@/components/ui/button/IconButton'
import IconClose from '@/assets/icons/jsx/IconClose'

type PropsType = {
  h3code: string
  /** 设备id */
  deviceId: string
  /** 信号强度 */
  quality: number
  /** 信噪比 */
  snr: number
  /** 信号时间 */
  ts: number
  /** 经度 */
  lng: number
  /** 纬度 */
  lat: number
  altitude: number
  onClose?: () => unknown
}

const SignalCellBoardContent: FC<PropsType> = memo((props) => {
  const queryClient = useQueryClient()
  const { data, isLoading } = useQuery(
    {
      queryKey: ['deviceDetail', props.deviceId],
      queryFn: () => getDeviceDetail(props.deviceId),
    },
    queryClient,
  )

  const { t } = useTranslation()

  return (
    <div>
      <XCard
        title={
          isLoading || !data
            ? t('common.loading') + '...'
            : data.data?.deviceName
        }
        padding="8px"
        iconMarginRight="4px"
        titleIcon={<DeviceIconUAV />}
        topRight={
          <IconButton onClick={props.onClose}>
            <IconClose style={{ transform: 'scale(1.25)' }} />
          </IconButton>
        }
      >
        <div className="flex flex-col mt-1 text-xs text-white gap-1">
          <div className="flex gap-1 whitespace-nowrap">
            <div>
              <span className="text-fore mr-0.5">
                {t('signalSituation.detail.signalStrength.title')}:
              </span>
              {props.quality}
            </div>
            <div>
              <span className="text-fore mr-0.5">
                {t('signalSituation.detail.sn.title')}:
              </span>
              {props.snr}
            </div>
            <div>
              <span className="text-fore mr-0.5">
                {t('signalSituation.detail.altitude.title')}:
              </span>
              {props.altitude}
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <span className="text-fore mr-0.5">{t('common.time')}:</span>
            {dayjs(props.ts * 1000).format('YYYY-MM-DD HH:mm:ss')}
          </div>
        </div>
      </XCard>
    </div>
  )
})

SignalCellBoardContent.displayName = 'SignalCellBoardContent'

export default SignalCellBoardContent
