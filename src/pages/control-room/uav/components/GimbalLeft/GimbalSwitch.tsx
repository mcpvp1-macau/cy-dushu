import { useDeviceDetailStore } from '@/pages/right/DeviceDetail/hooks/useDeviceDetail.store'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { Button, Tooltip } from 'antd'
import mitt from 'mitt'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import { setDeviceProp } from '@/service/modules/device'
import { useAppMsg } from '@/hooks/useAppMsg'

type PropsType = unknown

const irStyles = [
  {
    label: '白热',
    value: 0,
  },
  {
    label: '熔岩',
    value: 11,
  },
  {
    label: '热铁',
    value: 12,
  },
  {
    label: '黑热',
    value: 1,
  },
  {
    label: '彩虹 2',
    value: 13,
  },
  {
    label: '描红',
    value: 2,
  },
  {
    label: '医疗',
    value: 3,
  },
  {
    label: '彩虹 1',
    value: 5,
  },
  {
    label: '铁红',
    value: 6,
  },
  {
    label: '北极',
    value: 8,
  },
].sort((a, b) => a.value - b.value)

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
    let idx = gimbalTypes.findIndex((e) => e === lensType)
    idx = (((idx + delta) % n) + n) % n
    let isHave = !!gimbalData?.types?.find(
      (item: any) => item.type === gimbalTypes[idx],
    )
    if (isHave) {
      handleClick(gimbalTypes[idx])
    } else {
      idx = (((idx + delta) % n) + n) % n
      isHave = !!gimbalData?.types?.find(
        (item: any) => item.type === gimbalTypes[idx],
      )
      if (isHave) {
        handleClick(gimbalTypes[idx])
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

  const thermalCurrentPaletteStyle = useUavControlRoomStore(
    (s) => s.state.thermalCurrentPaletteStyle,
  )

  const productKey = useDeviceDetailStore((s) => s.productKey)
  const deviceId = useDeviceDetailStore((s) => s.deviceId)
  const [loading, setLoading] = useState(false)
  const appMsg = useAppMsg()
  const handleChangeThermalStyle = async (value: number) => {
    if (loading) return
    setLoading(true)
    appMsg.open({
      type: 'loading',
      content: '正在切换红外样式',
      key: 'change-thermal-style',
      duration: 0,
    })
    try {
      await setDeviceProp(productKey, deviceId, {
        thermalCurrentPaletteStyle: value,
      })
      appMsg.success(t('api.success.msg'))
    } finally {
      appMsg.destroy('change-thermal-style')
      setLoading(false)
    }
  }

  return (
    <>
      {gimbalTypes.map((type) => {
        const btn = (
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
        )
        if (type === 'ir') {
          return (
            <Tooltip
              placement="right"
              title={
                <ul>
                  {irStyles.map((e) => (
                    <li key={e.value}>
                      <Button
                        type="text"
                        size="small"
                        className="p-3 w-14"
                        onClick={() => handleChangeThermalStyle(e.value)}
                      >
                        <span
                          className={clsx({
                            ['text-primary']:
                              e.value == thermalCurrentPaletteStyle,
                          })}
                        >
                          {e.label}
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              }
            >
              {btn}
            </Tooltip>
          )
        }
        // 其他镜头
        return btn
      })}
    </>
  )
})

GimbalSwitch.displayName = 'GimbalSwitch'

export default GimbalSwitch
