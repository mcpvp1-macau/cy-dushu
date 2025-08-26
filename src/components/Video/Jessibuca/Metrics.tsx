import { heartbeat } from '@/constant/websocket'
import useUserStore from '@/store/useUser.store'
import JessibucaPro from '@/types/jessibuca-pro/jessibuca-pro'
import { MutableRefObject } from 'react'
import useWebSocket from 'react-use-websocket'
import useDeviceStats from './hooks/useDeviceStats'

type PropsType = {
  src: string
  openTime: MutableRefObject<number>
  jessibuca: JessibucaPro
}

const Metrics: FC<PropsType> = memo(({ src, openTime, jessibuca }) => {
  const deviceStatus = useDeviceStats()

  const metricsURL = useMemo(() => {
    const index = src.indexOf('/rtp')
    const flvIndex = src.indexOf('.flv')

    if (index === -1 || flvIndex === -1) {
      return null
    }

    const metricsURL = `${src.slice(0, index)}/metrics?stream_id=${src.slice(
      index + '/rtp/'.length,
      flvIndex,
    )}&client_id=${useUserStore.getState().user?.username ?? ''}_${dayjs(
      openTime.current,
    ).format('YYMMDD_HHmm_ssSSS')}`
    return metricsURL
  }, [src])

  const { sendJsonMessage, sendMessage } = useWebSocket(
    metricsURL,
    {
      heartbeat,
      reconnectAttempts: 0x3f3f3f3f,
      retryOnError: true,
      reconnectInterval: 5_000,
      shouldReconnect: () => true,
      onOpen: () => {
        sendMessage('ping')
      },
    },
    true,
  )

  const handleStats = (stats) => {
    sendJsonMessage(Object.assign(stats, deviceStatus))
  }

  jessibuca.on('stats' as JessibucaPro.EVENTS.stats, handleStats)

  return null
})

Metrics.displayName = 'Metrics'

export default Metrics
