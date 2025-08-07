import DeviceOverlayConfig from '../../components/DeviceOverlayConfig'

type PropsType = unknown

/** 机场配置 */
const UavDockConfig: FC<PropsType> = memo(() => {
  return (
    <div className="px-3 py-3">
      <DeviceOverlayConfig />
    </div>
  )
})

UavDockConfig.displayName = 'UavDockConfig'

export default UavDockConfig
