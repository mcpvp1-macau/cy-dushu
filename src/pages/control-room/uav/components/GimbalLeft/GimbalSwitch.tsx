import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { Button } from 'antd'
import mitt from 'mitt'
import usePostDeviceService from '../../hooks/usePostDeviceService'

type PropsType = unknown

export const gimbalSwitchEmitter = mitt<{
  switch: number
}>()

const gimbalTypes = ['wide', 'ir', 'zoom']

/** 镜头切换 */
const GimbalSwitch: FC<PropsType> = memo(() => {
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

  const postService = usePostDeviceService()

  const handleClick = useMemoizedFn((lensType: string) => {
    postService('liveLensChange', { videoId, lensType })
  })

  const has = useDeviceDetailStore((s) => s.serviceHave.liveLensChange)

  const handleLiveLensSwitch = useMemoizedFn((delta: number) => {
    if (videoSource !== 'gimbal') {
      return
    }
    const n = gimbalTypes.length
    let idx = gimbalTypes.findIndex((e) => e[0] === lensType)
    idx = (((idx + delta) % n) + n) % n
    let isHave = !!gimbalData?.types?.find(
      (item: any) => item.type === gimbalTypes[idx][0],
    )
    if (isHave) {
      handleClick(gimbalTypes[idx][0])
    } else {
      idx = (((idx + delta) % n) + n) % n
      isHave = !!gimbalData?.types?.find(
        (item: any) => item.type === gimbalTypes[idx][0],
      )
      if (isHave) {
        handleClick(gimbalTypes[idx][0])
      }
    }
  })

  useEffect(() => {
    gimbalSwitchEmitter.on('switch', handleLiveLensSwitch)
    return () => {
      gimbalSwitchEmitter.off('switch', handleLiveLensSwitch)
    }
  }, [])

  const { t } = useTranslation()

  console.log(has, videoSource, gimbalData)

  return (
    <>
      {gimbalTypes.map((type) => (
        <Button
          key={type}
          className={clsx(
            {
              'text-primary': videoSource === 'gimbal' && lensType === type,
            },
            'w-14 h-7',
          )}
          disabled={
            !has ||
            videoSource !== 'gimbal' ||
            !gimbalData?.types?.find((e: any) => e?.type === type)
          }
          onClick={() => handleClick(type)}
        >
          {t(`device.lens.${type}.title`)}
        </Button>
      ))}
    </>
  )
})

GimbalSwitch.displayName = 'GimbalSwitch'

export default GimbalSwitch
