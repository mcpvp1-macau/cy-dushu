import CesiumMap from '@/map/CesiumMap'

const RebotDogMap: FC<unknown> = memo(() => {
  return <CesiumMap id="rebot-dog-control-room-map"></CesiumMap>
})

RebotDogMap.displayName = 'RebotDogMap'

export default RebotDogMap
