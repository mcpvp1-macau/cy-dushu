import IconAreaScan from '@/assets/icons/jsx/IconAreaScan'
import IconButton from '@/components/ui/button/IconButton'
import useMapDevicesStore from '@/store/map/useMapDevices.store'

type PropsType = { deviceId: string }

/** 区域扫描开关 */
const AreaScanSwitch: FC<PropsType> = memo((props) => {
  const enable = useMapDevicesStore((s) => s.scanAreasEnable[props.deviceId])

  const { t } = useTranslation()

  return (
    <IconButton
      toolTipProps={{ title: t('common.scan') }}
      active={enable}
      onClick={() => {
        const next = { ...useMapDevicesStore.getState().scanAreasEnable }
        next[props.deviceId] = !enable
        useMapDevicesStore.setState({ scanAreasEnable: next })
      }}
    >
      <IconAreaScan />
    </IconButton>
  )
})

AreaScanSwitch.displayName = 'AreaScanSwitch'

export default AreaScanSwitch
