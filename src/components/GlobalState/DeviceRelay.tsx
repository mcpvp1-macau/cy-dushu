import mitt from 'mitt'
import XModal from '../XModal'

export type DeviceRelayNotifyType = {
  breakPointId: number
  actionId: number
  deviceId: string
}

type PropsType = unknown

export const deviceRelayEmitter = mitt<{
  notify: DeviceRelayNotifyType
}>()

/** 设备断点续飞 */
const DeviceRelay: FC<PropsType> = memo(() => {
  useEffect(() => {
    const handleNotify = (data: DeviceRelayNotifyType) => {
      console.log('Received device relay notification:', data)
    }

    deviceRelayEmitter.on('notify', handleNotify)

    return () => {
      deviceRelayEmitter.off('notify', handleNotify)
    }
  }, [])

  const [open, setOpen] = useState(false)

  return (
    <XModal title="设备断点续飞" open={open} onClose={() => setOpen(false)}>
      任务中断，是否派遣 xxxx飞机接力飞行
    </XModal>
  )
})

DeviceRelay.displayName = 'DeviceRelay'

export default DeviceRelay
