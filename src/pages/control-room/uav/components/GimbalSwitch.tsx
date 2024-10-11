import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { Button } from 'antd'
import { memo, type FC } from 'react'

type PropsType = unknown

const gimbalTypes = [
  ['wide', '广角'],
  ['ir', '红外'],
  ['zoom', '变焦'],
]

/** 镜头切换 */
const GimbalSwitch: FC<PropsType> = memo(() => {
  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const firstVideo = useDeviceDetailStore(
    (s) => s.deviceDetail?.properties.videoList?.[0],
  )
  const videoId = firstVideo?.videoId

  const videoSource = useUavControlRoomStore((s) => s.state.videoSource)
  const lensType = useUavControlRoomStore((s) => s.state.lensType)

  const gimbalData = useMemo(
    () => firstVideo?.sources?.find((item: any) => item.id === 'gimbal'),
    [firstVideo],
  )

  const postService = usePostDeviceService(productKey, deviceId)

  const handleClick = useMemoizedFn((lensType: string) => {
    postService('liveLensChange', { videoId, lensType })
  })

  const has = useDeviceDetailStore((s) => s.serviceHave.liveLensChange)

  return (
    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
      {gimbalTypes.map(([type, label]) => (
        <Button
          key={type}
          className={clsx({
            'text-primary': videoSource === 'gimbal' && lensType === type,
          })}
          disabled={
            !has ||
            videoSource !== 'gimbal' ||
            !gimbalData?.types?.find((e: any) => e?.type === type)
          }
          onClick={() => handleClick(type)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
})

GimbalSwitch.displayName = 'GimbalSwitch'

export default GimbalSwitch
