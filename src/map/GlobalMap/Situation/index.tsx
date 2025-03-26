import useWirelessSituationStore from '@/store/map/useSignalLayer.store'
import WirelessSituation from './WirelessSituation'
import ScanAreas from './ScanAreas'

type PropsType = unknown

const MapSituation: FC<PropsType> = () => {
  const openWireless = useWirelessSituationStore((s) => s.enableSignalLayer)
  return (
    <>
      {openWireless && <WirelessSituation />}
      <ScanAreas />
    </>
  )
}

MapSituation.displayName = 'MapSituation'

export default MapSituation
