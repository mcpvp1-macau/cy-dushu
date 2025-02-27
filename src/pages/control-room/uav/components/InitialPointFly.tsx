import XModal from '@/components/XModal'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useSearchParams } from 'react-router-dom'
import { robControlPowerEmitter } from './AsideButtons/ControlPower'
import { useAppMsg } from '@/hooks/useAppMsg'

const InnerInitialPointFly: FC<{
  targetLng: number
  targetLat: number
}> = memo(({ targetLng, targetLat }) => {
  const hasControlPower = useUavControlRoomStore((s) => s.hasControlPower)

  const updatePointFly = useUavControlRoomStore((s) => s.updatePointFly)

  const [searchParams, setSearchParams] = useSearchParams()

  const msgApi = useAppMsg()

  useEffect(() => {
    if (!hasControlPower) {
      robControlPowerEmitter.emit('rob')
    } else {
      updatePointFly({
        targetPosition: [targetLng, targetLat],
        open: true,
      })
      // Remove targetLng and targetLat from URL params after processing
      const newSearchParams = new URLSearchParams(searchParams)
      newSearchParams.delete('targetLng')
      newSearchParams.delete('targetLat')
      setSearchParams(newSearchParams, { replace: true })
      msgApi.info('请在地图上参考目标点和相关信息，并点击确认后开始指点飞行')
    }
  }, [hasControlPower])

  return null
})

InnerInitialPointFly.displayName = 'InnerInitialPointFly'

type PropsType = unknown

const InitialPointFly: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const [go, setGo] = useState(0)

  const [searchParams, setSearchParams] = useSearchParams()

  if (go === 2) {
    return null
  }

  const targetLng = searchParams.get('targetLng')
  const targetLat = searchParams.get('targetLat')

  if (go === 0) {
    if (!targetLng || !targetLat) {
      return null
    }

    return (
      <XModal
        width={300}
        noPadding
        centered
        open={true}
        title={t('controlRoom.uav.service.tapToFly.title')}
        onClose={() => {
          setGo(2)
          // Remove targetLng and targetLat from URL params after processing
          const newSearchParams = new URLSearchParams(searchParams)
          newSearchParams.delete('targetLng')
          newSearchParams.delete('targetLat')
          setSearchParams(newSearchParams, { replace: true })
        }}
        onConfirm={() => {
          setGo(1)
        }}
      >
        <div className="p-3">是否创建指点飞行任务？</div>
      </XModal>
    )
  }

  return (
    <InnerInitialPointFly
      targetLng={Number(targetLng)}
      targetLat={Number(targetLat)}
    />
  )
})

InitialPointFly.displayName = 'InitialPointFly'

export default InitialPointFly
