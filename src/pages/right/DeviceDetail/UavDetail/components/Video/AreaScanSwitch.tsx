import IconAreaScan from '@/assets/icons/jsx/IconAreaScan'
import IconButton from '@/components/ui/button/IconButton'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import useMapSettingStore from '@/store/setting/useMapSetting.store'

type PropsType = { deviceId: string }

/** 区域扫描开关 */
const AreaScanSwitch: FC<PropsType> = memo((props) => {
  const enable = useMapDevicesStore((s) => s.scanAreasEnable[props.deviceId])

  const { t } = useTranslation()

  return (
    <IconButton
      tippyProps={{ content: t('common.scan') }}
      active={enable}
      onClick={() => {
        const next = { ...useMapDevicesStore.getState().scanAreasEnable }
        next[props.deviceId] = !enable
        if (!enable) {
          // 确保打开无人机视椎体
          if (!useMapSettingStore.getState().uavDetailFrustum) {
            useMapSettingStore.getState().updateUavDetailFrustum(true)
          }
        }
        useMapDevicesStore.setState({ scanAreasEnable: next })
      }}
    >
      <IconAreaScan />
    </IconButton>
  )
})

AreaScanSwitch.displayName = 'AreaScanSwitch'

export default AreaScanSwitch
