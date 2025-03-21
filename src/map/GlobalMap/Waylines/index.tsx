import UavWayline from '@/map/CesiumMap/components/service/Wayline/UavAirline'
import useWaylinesStore from '@/store/map/useWaylines.store'

type PropsType = unknown

const Waylines: FC<PropsType> = memo(() => {
  const waylines = useWaylinesStore((s) => s.waylines)

  console.log(waylines)

  return (
    <>
      {waylines.map((e) => (
        <UavWayline key={e.id} data={e.points} />
      ))}
    </>
  )
})

Waylines.displayName = 'Waylines'

export default Waylines
