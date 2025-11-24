import { usePostDeviceService } from '@/hooks/device/usePostDeviceService'
import { useUavControlRoomStore } from '@/store/context-store/useUavControlRoom.store'
import { isNil } from 'lodash'
import IconButtonWithDropDown from '@/components/ui/button/IconButtonWithDropDown'

type PropsType = {
  postSerivce: ReturnType<typeof usePostDeviceService>
}

const exposureModeMap = new Map<number, string>([
  [1, '曝光优先'],
  [2, '快门优先曝光'],
  [3, '光圈优先曝光'],
  [4, '快门曝光'],
])

/** 镜头曝光模式 */
const ExposureMode: FC<PropsType> = memo(({ postSerivce }) => {
  const { t } = useTranslation()

  const zoomExposureMode = useUavControlRoomStore(
    (s) => s.state.zoomExposureMode,
  )
  const wideExposureMode = useUavControlRoomStore(
    (s) => s.state.wideExposureMode,
  )

  const lensType = useUavControlRoomStore((s) => s.state.lensType)
  const exposureMode = lensType === 'wide' ? wideExposureMode : zoomExposureMode

  const handleClick = ({ key }: { key: string }) => {
    postSerivce('cameraExposureModeSet', {
      mode: String(key),
      lens: lensType,
    })
  }

  if (isNil(zoomExposureMode) && isNil(wideExposureMode)) {
    return null
  }

  return (
    <IconButtonWithDropDown
      className="text-xs"
      tippyProps={{ content: t('controlRoom.uav.service.exposureMode.title') }}
      menu={{
        items: [
          {
            key: 1,
            label: '曝光优先',
          },
          {
            key: 4,
            label: '快门优先',
          },
        ],
        onClick: handleClick,
      }}
      disabled={!(lensType === 'wide' || lensType === 'zoom')}
      placement="top"
      trigger={['click']}
    >
      {exposureModeMap.get(exposureMode)}
    </IconButtonWithDropDown>
  )
})

ExposureMode.displayName = 'ZoomFocusMode'

export default ExposureMode
