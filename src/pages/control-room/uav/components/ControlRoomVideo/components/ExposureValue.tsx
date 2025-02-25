import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { Popover, Slider } from 'antd'
import { isNil } from 'lodash'
import usePostDeviceService from '../../../hooks/usePostDeviceService'
import IconButton from '@/components/ui/button/IconButton'

type PropsType = unknown

const exposureMap = new Map<number, string>([
  [1, '-5.0EV'],
  [2, '-4.7EV'],
  [3, '-4.3EV'],
  [4, '-4.0EV'],
  [5, '-3.7EV'],
  [6, '-3.3EV'],
  [7, '-3.0EV'],
  [8, '-2.7EV'],
  [9, '-2.3EV'],
  [10, '-2.0EV'],
  [11, '-1.7EV'],
  [12, '-1.3EV'],
  [13, '-1.0EV'],
  [14, '-0.7EV'],
  [15, '-0.3EV'],
  [16, '0EV'],
  [17, '0.3EV'],
  [18, '0.7EV'],
  [19, '1.0EV'],
  [20, '1.3EV'],
  [21, '1.7EV'],
  [22, '2.0EV'],
  [23, '2.3EV'],
  [24, '2.7EV'],
  [25, '3.0EV'],
  [26, '3.3EV'],
  [27, '3.7EV'],
  [28, '4.0EV'],
  [29, '4.3EV'],
  [30, '4.7EV'],
  [31, '5.0EV'],
  [32, 'FIXED'],
])

const revMap = new Map<string, number>(
  Array.from(exposureMap.entries()).map(([k, v]) => [v, k]),
)

/** 曝光值 显示 和 设置 */
const ExposureValue: FC<PropsType> = memo(() => {
  /** 广角镜头曝光值 */
  const wideExposureValue = useUavControlRoomStore(
    (s) => s.state.wideExposureValue,
  )

  /** 变焦镜头曝光值 */
  const zoomExposureValue = useUavControlRoomStore(
    (s) => s.state.zoomExposureValue,
  )

  const lensType = useUavControlRoomStore((s) => s.state.lensType)

  const display = useMemo(() => {
    if (lensType === 'wide') {
      return wideExposureValue
    } else if (lensType === 'zoom') {
      return zoomExposureValue
    }
  }, [lensType, wideExposureValue, zoomExposureValue])

  const [value, setValue] = useState(revMap.get(display) ?? 16)

  // state 更新时，更新 value
  useEffect(() => {
    const v = revMap.get(display) ?? 16
    if (v !== value) {
      setValue(v)
    }
  }, [display])

  const postService = usePostDeviceService()
  const { t } = useTranslation()

  if (isNil(display)) {
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
          max={32}
          value={value}
          onChange={setValue}
          tooltip={{
            formatter: (v) => (v ? exposureMap.get(v) : ''),
          }}
          onChangeComplete={(v) => {
            postService(
              'cameraExposureValueSet',
              {
                lens: lensType,
                exposureValue: v === 32 ? 255 : v,
              },
              '设置曝光值',
            )
          }}
        />
      }
    >
      <IconButton
        className="text-xs"
        toolTipProps={{ title: t('controlRoom.uav.exposure.title') }}
      >
        {display}
      </IconButton>
    </Popover>
  )
})

ExposureValue.displayName = 'ExposureValue'

export default ExposureValue
