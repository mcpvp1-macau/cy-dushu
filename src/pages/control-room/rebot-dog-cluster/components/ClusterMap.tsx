import { memo, type FC } from 'react'
import CesiumMap from '@/map/CesiumMap'
import * as Cesium from 'cesium'
import { Entity } from 'resium'
import { useRebotDogClusterStore } from '@/store/control-room/useRebotDogCluster.store'
import HistoryTrack from '@/components/map/HistoryTrack'
import useRealTrack3D from '@/hooks/device/useRealTrack3D'
import useDeviceTrackColorStore from '@/store/setting/useDeviceTrackColor.store'

const RobotDogMarkers: FC = memo(() => {
  const dogs = useRebotDogClusterStore((s) => s.dogs)
  const dogStates = useRebotDogClusterStore((s) => s.dogStates)
  const selectedIds = useRebotDogClusterStore((s) => s.selectedIds)
  const toggleSelect = useRebotDogClusterStore((s) => s.toggleSelect)

  return (
    <>
      {dogs.map((dog) => {
        const state = dogStates[dog.deviceId]
        if (!state?.longitude || !state?.latitude) {
          return null
        }
        const heading = (state.headingAngle ?? 0) * -1
        const position = Cesium.Cartesian3.fromDegrees(
          state.longitude,
          state.latitude,
        )
        const selected = selectedIds.includes(dog.deviceId)
        return (
          <Entity
            key={dog.deviceId}
            position={position}
            onClick={() => toggleSelect(dog.deviceId)}
            billboard={{
              image: '/images/marker/icon/rebot_dog.svg',
              width: selected ? 28 : 22,
              height: selected ? 28 : 22,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
              rotation: Cesium.Math.toRadians(-heading || 0),
            }}
            label={{
              text: dog.deviceName,
              pixelOffset: new Cesium.Cartesian2(0, -20),
              showBackground: true,
              backgroundColor: new Cesium.Color(0, 0, 0, 0.5),
              scale: 0.6,
              horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.TOP,
            }}
          />
        )
      })}
    </>
  )
})

const RobotDogTrack: FC<{ deviceId: string }> = memo(({ deviceId }) => {
  const state = useRebotDogClusterStore((s) => s.dogStates[deviceId])
  const { longitude, latitude } = state || {}
  const altitude = state?.altitude ?? state?.height ?? 0
  const { realTrack, historyTrack } = useRealTrack3D(
    longitude,
    latitude,
    altitude,
  )

  const color = useDeviceTrackColorStore(
    (s) => s.colorMap[deviceId] || '#d42422',
  )
  const materialType = useDeviceTrackColorStore(
    (s) => s.materialType[deviceId] || 'glow',
  )

  return (
    <>
      {historyTrack.map((track, index) => (
        <HistoryTrack
          key={index}
          value={track}
          color={color}
          materialType={materialType}
        />
      ))}
      {realTrack.length > 1 && (
        <HistoryTrack
          value={realTrack}
          color={color}
          materialType={materialType}
        />
      )}
    </>
  )
})

const ClusterMap: FC = memo(() => {
  const dogs = useRebotDogClusterStore((s) => s.dogs)
  return (
    <CesiumMap id="robot-dog-cluster-map">
      <RobotDogMarkers />
      {dogs.map((dog) => (
        <RobotDogTrack key={dog.deviceId} deviceId={dog.deviceId} />
      ))}
    </CesiumMap>
  )
})

ClusterMap.displayName = 'ClusterMap'

export default ClusterMap
