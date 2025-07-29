import HistoryTrack from '@/components/map/HistoryTrack'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import useDeviceTrackColorStore from '@/store/setting/useDeviceTrackColor.store'
import React from 'react'

type PropsType = unknown

const DeviceHistoryTracks: FC<PropsType> = memo(() => {
  const uavTracks = useMapDevicesStore((s) => s.uavTracks)
  const colorMap = useDeviceTrackColorStore((s) => s.colorMap)
  const materialTypeMap = useDeviceTrackColorStore((s) => s.materialType)

  return (
    <>
      {Object.entries(uavTracks).map(([deviceId, track]) => (
        <React.Fragment key={deviceId}>
          {track.path.length >= 2 && (
            <HistoryTrack
              key={deviceId}
              value={track.path}
              materialType={materialTypeMap[deviceId] || 'glow'}
              color={colorMap[deviceId] || '#d42422'}
            />
          )}
        </React.Fragment>
      ))}
    </>
  )
})

DeviceHistoryTracks.displayName = 'DeviceHistoryTracks'

export default DeviceHistoryTracks
