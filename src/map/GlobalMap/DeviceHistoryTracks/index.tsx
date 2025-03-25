import HistoryTrack from '@/components/map/HistoryTrack'
import useMapDevicesStore from '@/store/map/useMapDevices.store'
import React from 'react'

type PropsType = unknown

const DeviceHistoryTracks: FC<PropsType> = memo(() => {
  const uavTracks = useMapDevicesStore((s) => s.uavTracks)
  return (
    <>
      {Object.entries(uavTracks).map(([deviceId, track]) => (
        <React.Fragment key={deviceId}>
          {track.path.length >= 2 && (
            <HistoryTrack
              key={deviceId}
              value={track.path}
              useCallback={track.useCallback}
            />
          )}
        </React.Fragment>
      ))}
    </>
  )
})

DeviceHistoryTracks.displayName = 'DeviceHistoryTracks'

export default DeviceHistoryTracks
