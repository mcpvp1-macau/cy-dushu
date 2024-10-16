import HistoryTrack from '@/components/map/HistoryTrack'
import useHistoryTrackStore from '@/store/map/useHistoryTrack.store'
import React from 'react'
import { memo, type FC } from 'react'

type PropsType = unknown

const DeviceHistoryTracks: FC<PropsType> = memo(() => {
  const tracks = useHistoryTrackStore((s) => s.tracks)
  const trackMaps = useHistoryTrackStore((s) => s.trackMaps)

  return (
    <>
      {tracks.map((track) => (
        <React.Fragment key={track.id}>
          {track.path.length >= 2 && (
            <HistoryTrack
              key={track.id}
              value={track.path}
              useCallback={track.useCallback}
            />
          )}
        </React.Fragment>
      ))}
      {Array.from(trackMaps.values()).map((track) => (
        <React.Fragment key={track.id}>
          {track.path.length >= 2 && (
            <HistoryTrack
              key={track.id}
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
