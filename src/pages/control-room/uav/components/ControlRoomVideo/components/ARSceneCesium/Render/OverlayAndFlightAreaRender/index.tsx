import useARSettingStore from '@/store/setting/useARSetting.store'
import OrderCesiumRenderController from '@/utils/cesium/OrderCesiumRenderController'
import { LayerEnum } from '../Enum'
import { useEffect } from 'react'
import RenderOverlays from './RenderOverlays'
import RenderFlightArea from './RenderFlightArea'
import RenderPoints from './RenderPoints'
import useMixARStore from '@/store/control-room/useMixAR.store'

type PropsType = {
  ocrc: OrderCesiumRenderController
}

const OverlayAndFlightAreaRender: FC<PropsType> = ({ ocrc }) => {
  const arSetting = useARSettingStore((s) => s)
  const overlaies = useMixARStore((s) => s.overlaies)

  const [showingAreas, setShowingAreas] = useState<
    API_LAYER_OVERLAY.domain.Overlay[]
  >([])
  const [showingFlightAreas, setShowingFlightAreas] = useState<
    API_LAYER_OVERLAY.domain.Overlay[]
  >([])
  const [points, setPoints] = useState<API_LAYER_OVERLAY.domain.Overlay[]>([])

  useEffect(() => {
    if (!arSetting.overlay.enable || !overlaies) {
      setShowingAreas([])
      setPoints([])
      return
    }

    const features = overlaies.features.filter((feature) =>
      (feature.id as string).startsWith('overlay-'),
    )

    const filterPoints: GeoJSON.Feature[] = []
    const filterAreas: GeoJSON.Feature[] = []
    features.forEach((feature) => {
      if (arSetting.overlay.point && feature.geometry.type === 'Point') {
        filterPoints.push(feature)
      }
      if (arSetting.overlay.area && feature.geometry.type === 'Polygon') {
        filterAreas.push(feature)
      }
      return true
    })

    const areas = filterAreas.map(
      (feature) => feature.properties as API_LAYER_OVERLAY.domain.Overlay,
    )
    const points = filterPoints.map(
      (feature) => feature.properties as API_LAYER_OVERLAY.domain.Overlay,
    )

    setShowingAreas(areas)
    setPoints(points)
  }, [overlaies, arSetting.overlay])

  useEffect(() => {
    if (!arSetting.flightArea.enable || !overlaies) {
      setShowingFlightAreas([])
      return
    }

    const features = overlaies.features.filter((feature) =>
      (feature.id as string).startsWith('flightArea-'),
    )

    const flightAreaList = features.map(
      (feature) => feature.properties as API_LAYER_OVERLAY.domain.Overlay,
    )

    const filter = new Set(arSetting.flightArea.filter)
    const filterFlightAreas = flightAreaList.filter((item) => {
      if (filter.size && !filter.has(item.overlayExtType)) {
        return false
      }
      return true
    })

    setShowingFlightAreas(filterFlightAreas)
  }, [overlaies, arSetting.flightArea])

  return (
    <>
      <RenderOverlays
        overlays={showingAreas}
        primitives={ocrc.orderPrimitives[LayerEnum.overlay]}
      />
      <RenderFlightArea
        overlays={showingFlightAreas}
        primitives={ocrc.orderPrimitives[LayerEnum.flightArea]}
      />
      <RenderPoints points={points} ocrc={ocrc} />
    </>
  )
}

export default OverlayAndFlightAreaRender
