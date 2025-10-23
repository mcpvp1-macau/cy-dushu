import RelayDeviceModal from '@/components/device/RelayDeviceModal'
import mitt from 'mitt'

export type DeviceRelayNotifyType = {
  /** 断点 ID */
  breakPointId: number
  /** 行动 ID */
  actionId: number
  /** 被断点的设备 */
  deviceId: string
  deviceName?: string
  /** 接力设备 ID */
  relayDeviceId?: string
  /** 接力设备名称 */
  relayDeviceName?: string
}

type PropsType = unknown

export const deviceRelayEmitter = mitt<{
  notify: DeviceRelayNotifyType
}>()

/** 设备断点续飞 */
const DeviceRelay: FC<PropsType> = memo(() => {
  const [open, setOpen] = useState(false)
  const [relayData, setRelayData] = useState<DeviceRelayNotifyType>()

  useEffect(() => {
    const handleNotify = (data: DeviceRelayNotifyType) => {
      setRelayData(data)
      setOpen(true)
    }

    deviceRelayEmitter.on('notify', handleNotify)

    return () => {
      deviceRelayEmitter.off('notify', handleNotify)
    }
  }, [])

  const handleClose = () => {
    setOpen(false)
    setRelayData(undefined)
  }

  return (
    <RelayDeviceModal
      open={open}
      breakPointId={relayData?.breakPointId}
      deviceName={relayData?.deviceName}
      relayDeviceId={relayData?.relayDeviceId}
      onClose={handleClose}
    />
  )
})

DeviceRelay.displayName = 'DeviceRelay'

export default DeviceRelay
