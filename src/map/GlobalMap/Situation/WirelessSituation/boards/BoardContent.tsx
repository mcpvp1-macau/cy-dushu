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

  return (
    <div style={{ width: '240px' }}>
      <XCard
        title={isLoading || !data ? '加载中...' : data.data?.deviceName}
        padding="8px"
        iconMarginRight="4px"
        titleIcon={<DeviceIconUAV />}
        topRight={
          <IconButton onClick={props.onClose}>
            <IconClose style={{ transform: 'scale(1.25)' }} />
          </IconButton>
        }
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: '4px',
            fontSize: '12px',
            color: '#fff',
            gap: '4px',
            lineHeight: '14px',
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <span style={{ color: '#C7D1DC', marginRight: '2px' }}>
                信号强度:
              </span>
              {props.quality}
            </div>
            <div>
              <span style={{ color: '#C7D1DC', marginRight: '2px' }}>
                信噪比:
              </span>
              {props.snr}
            </div>
            <div>
              <span style={{ color: '#C7D1DC', marginRight: '2px' }}>
                高度:
              </span>
              {props.altitude}
            </div>
          </div>
          <div style={{ display: 'flex' }}>
            <span style={{ color: '#C7D1DC', marginRight: '2px' }}>
              信号时间:
            </span>
            {dayjs(props.ts * 1000).format('YYYY-MM-DD HH:mm:ss')}
          </div>
        </div>
      </XCard>
    </div>
  )
})

SignalCellBoardContent.displayName = 'SignalCellBoardContent'

export default SignalCellBoardContent
