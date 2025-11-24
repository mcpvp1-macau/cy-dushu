import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { Popover, Slider } from 'antd'
import { isNil } from 'lodash'
import usePostDeviceService from '@/pages/right/DeviceDetail/hooks/usePostDeviceService'
import IconButton from '@/components/ui/button/IconButton'

type PropsType = unknown

const shutterMap = new Map<number, string>([
  [0, '1/8000 s'],
  [1, '1/6400 s'],
  [2, '1/6000 s'],
  [3, '1/5000 s'],
  [4, '1/4000 s'],
  [5, '1/3200 s'],
  [6, '1/3000 s'],
  [7, '1/2500 s'],
  [8, '1/2000 s'],
  [9, '1/1600 s'],
  [10, '1/1500 s'],
  [11, '1/1250 s'],
  [12, '1/1000 s'],
  [13, '1/800 s'],
  [14, '1/725 s'],
  [15, '1/640 s'],
  [16, '1/500 s'],
  [17, '1/400 s'],
  [18, '1/350 s'],
  [19, '1/320 s'],
  [20, '1/250 s'],
  [21, '1/240 s'],
  [22, '1/200 s'],
  [23, '1/180 s'],
  [24, '1/160 s'],
  [25, '1/125 s'],
  [26, '1/120 s'],
  [27, '1/100 s'],
  [28, '1/90 s'],
  [29, '1/80 s'],
  [30, '1/60 s'],
  [31, '1/50 s'],
  [32, '1/40 s'],
  [33, '1/30 s'],
  [34, '1/25 s'],
  [35, '1/20 s'],
  [36, '1/15 s'],
  [37, '1/12.5 s'],
  [38, '1/10 s'],
  [39, '1/8 s'],
  [40, '1/6.25 s'],
  [41, '1/5 s'],
  [42, '1/4 s'],
  [43, '1/3 s'],
  [44, '1/2.5 s'],
  [45, '1/2 s'],
  [46, '1/1.67 s'],
  [47, '1/1.25 s'],
  [48, '1.0 s'],
  [49, '1.3 s'],
  [50, '1.6 s'],
  [51, '2.0 s'],
  [52, '2.5 s'],
  [53, '3.0 s'],
  [54, '3.2 s'],
  [55, '4.0 s'],
  [56, '5.0 s'],
  [57, '6.0 s'],
  [58, '7.0 s'],
  [59, '8.0 s'],
  [60, 'Auto'],
])

/** 快门速度 显示 和 设置 */
const ShutterValue: FC<PropsType> = memo(() => {
  /** 广角镜头曝光值 */
  const wideShutterSpeed = useUavControlRoomStore(
    (s) => s.state.wideShutterSpeed,
  )

  /** 变焦镜头曝光值 */
  const zoomShutterSpeed = useUavControlRoomStore(
    (s) => s.state.zoomShutterSpeed,
  )

  const lensType = useUavControlRoomStore((s) => s.state.lensType)

  const truthValue = useMemo<number | undefined>(() => {
    if (lensType === 'wide') {
      return wideShutterSpeed
    } else if (lensType === 'zoom') {
      return zoomShutterSpeed
    }
  }, [lensType, wideShutterSpeed, zoomShutterSpeed])

  const [value, setValue] = useState(truthValue ?? 60)

  // state 更新时，更新 value
  useEffect(() => {
    if (!isNil(truthValue) && truthValue !== value) {
      setValue(truthValue)
    }
  }, [truthValue])

  const postService = usePostDeviceService()
  const { t } = useTranslation()

  if (isNil(truthValue)) {
    return null
  }

  return (
    <Popover
      trigger={['click']}
      placement="top"
      content={
        <Slider
          className="w-28"
          min={1}
          max={60}
          value={value}
          onChange={setValue}
          tooltip={{
            formatter: (v) => (v ? shutterMap.get(v) : ''),
          }}
          onChangeComplete={(v) => {
            postService(
              'shutterSet',
              {
                shutterValue: v,
                cameraType: lensType,
              },
              '设置快门速度',
            )
          }}
        />
      }
    >
      <IconButton
        className="text-xs"
        tippyProps={{ content: t('controlRoom.uav.shutter.title') }}
      >
        {shutterMap.get(truthValue)}
      </IconButton>
    </Popover>
  )
})

ShutterValue.displayName = 'ShutterValue'

export default ShutterValue
