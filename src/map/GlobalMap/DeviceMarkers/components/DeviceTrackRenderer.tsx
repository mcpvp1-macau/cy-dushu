import HistoryTrack from '@/components/map/HistoryTrack'

type Track = { lng: number; lat: number; alt?: number }[]

type PropsType = {
  enableTrack: boolean
  historyTrack: Track[]
  realTrack: Track
  color: string
  materialType: 'color' | 'outline' | 'glow'
  clampToGround?: boolean
}

const DeviceTrackRenderer: FC<PropsType> = memo(
  ({
    enableTrack,
    historyTrack,
    realTrack,
    color,
    materialType,
    clampToGround,
  }) => {
    if (!enableTrack) return null

    return (
      <>
        {historyTrack.length > 0 &&
          historyTrack.map((track, index) => (
            <HistoryTrack
              key={index}
              value={track}
              color={color}
              materialType={materialType}
              clampToGround={clampToGround}
            />
          ))}
        {realTrack.length > 1 && (
          <HistoryTrack
            value={realTrack}
            color={color}
            materialType={materialType}
            clampToGround={clampToGround}
          />
        )}
      </>
    )
  },
)

DeviceTrackRenderer.displayName = 'DeviceTrackRenderer'

export default DeviceTrackRenderer
