import LayerAndOverlay from './LayerAndOverlay'
import GlobalWebSocket from './GlobalWebSocket'
import MapDevices from './MapDevices'

type PropsType = unknown

/** 全局状态管理 (全局 WebSocket 等) */
const GlobalState: FC<PropsType> = memo(() => {
  return (
    <>
      <GlobalWebSocket />
      <MapDevices />
      <LayerAndOverlay />
    </>
  )
})

GlobalState.displayName = 'GlobalState'

export default GlobalState
