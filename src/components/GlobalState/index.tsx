import LayerAndOverlay from './LayerAndOverlay'
import GlobalWebSocket from './GlobalWebSocket'
import MapDevices from './MapDevices'
import GlobalMessage from './GlobalMessage'
import ReconstructionMap from './ReconstructionMap'
import FlightArea from './FlightArea'
import DeviceOverlays from './DeviceOverlays'
import DeviceRelay from './DeviceRelay'

type PropsType = unknown

/** 全局状态于交互管理 (全局 WebSocket 等) */
const GlobalState: FC<PropsType> = memo(() => {
  return (
    <>
      <GlobalWebSocket />
      <MapDevices />
      <LayerAndOverlay />
      <GlobalMessage />
      <DeviceRelay />
      {!globalConfig.useShanghaiBanRoutes && (
        <>
          <ReconstructionMap />
          <FlightArea />
          <DeviceOverlays />
        </>
      )}
    </>
  )
})

GlobalState.displayName = 'GlobalState'

export default GlobalState
