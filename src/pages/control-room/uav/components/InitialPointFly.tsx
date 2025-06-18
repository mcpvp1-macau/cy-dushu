import XModal from '@/components/XModal'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { useSearchParams } from 'react-router-dom'
import { useAppMsg } from '@/hooks/useAppMsg'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'

const ZHONGSUNPRODUCTKEY = 'GKg8wk3eeRC'

const InnerInitialPointFly: FC<{
  targetLng: number
  targetLat: number
}> = memo(({ targetLng, targetLat }) => {
  const updatePointFly = useUavControlRoomStore((s) => s.updatePointFly)

  const [searchParams, setSearchParams] = useSearchParams()

  const msgApi = useAppMsg()

  useEffect(() => {
    updatePointFly({
      targetPosition: [targetLng, targetLat, 0],
      open: true,
    })
    // Remove targetLng and targetLat from URL params after processing
    const newSearchParams = new URLSearchParams(searchParams)
    newSearchParams.delete('targetLng')
    newSearchParams.delete('targetLat')
    setSearchParams(newSearchParams, { replace: true })
    msgApi.info('请在地图上参考目标点和相关信息，并点击确认后开始指点飞行')
  }, [])

  return null
})

InnerInitialPointFly.displayName = 'InnerInitialPointFly'

type PropsType = unknown

const InitialPointFly: FC<PropsType> = memo(() => {
  const { t } = useTranslation()

  const [go, setGo] = useState(0)

  const [searchParams, setSearchParams] = useSearchParams()

  const productKey = useDeviceDetailStore((s) => s.productKey)

  const postService = usePostDeviceService()

  if (go === 2) {
    return null
  }

  const targetLng = searchParams.get('targetLng')
  const targetLat = searchParams.get('targetLat')
  const targetId = searchParams.get('targetId')

  if (!targetLng || !targetLat) {
    return null
  }

  if (productKey === ZHONGSUNPRODUCTKEY && targetId) {
    return (
      <XModal
        noPadding
        open={true}
        title="追踪目标"
        onClose={() => {
          setGo(2)
          // Remove targetLng and targetLat from URL params after processing
          const newSearchParams = new URLSearchParams(searchParams)
          newSearchParams.delete('targetLng')
          newSearchParams.delete('targetLat')
          newSearchParams.delete('targetId')
          setSearchParams(newSearchParams, { replace: true })
        }}
        onConfirm={async () => {
          await postService('TrackTarget', {
            targetId,
          })
          setGo(2)
          const newSearchParams = new URLSearchParams(searchParams)
          newSearchParams.delete('targetLng')
          newSearchParams.delete('targetLat')
          newSearchParams.delete('targetId')
          setSearchParams(newSearchParams, { replace: true })
        }}
      >
        <div className="p-3">是否要追踪该目标?</div>
      </XModal>
    )
  }

  if (go === 0) {
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
