import useWirelessSituationStore from '@/store/map/useSignalLayer.store'
import WirelessSituation from './WirelessSituation'

type PropsType = unknown

const MapSituation: FC<PropsType> = () => {
  const openWireless = useWirelessSituationStore((s) => s.enableSignalLayer)
  return <>{openWireless && <WirelessSituation />}</>
}

MapSituation.displayName = 'MapSituation'

export default MapSituation
