import DeviceOverlayConfig from '../../components/DeviceOverlayConfig'
import AirTransferEnable from './AirTransferEnable'
import LocationCalibration from './LocationCalibration'

type PropsType = {
  state: Record<string, any>
}

/** 机场配置 */
const UavDockConfig: FC<PropsType> = memo((props) => {
  return (
    <div className="px-3 py-3">
      <DeviceOverlayConfig />
      <div className="mt-2">
        <LocationCalibration state={props.state} />
      </div>
      <div>
        <AirTransferEnable state={props.state} />
      </div>
    </div>
  )
})

UavDockConfig.displayName = 'UavDockConfig'

export default UavDockConfig
