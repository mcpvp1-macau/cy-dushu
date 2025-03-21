import useRebotDogWaylineStore from '@/store/wayline/rebot-dog-wayline/useRebotDogWayline.store'
import AddPoint from '../../components/AddPoint'

type PropsType = unknown

const AddWaypoint: FC<PropsType> = memo(() => {
  const isDrawPoint = useRebotDogWaylineStore((s) => s.isDrawPoint)
  const addWaypoint = useRebotDogWaylineStore((s) => s.addWaypoint)

  if (!isDrawPoint) {
    return null
  }

  return (
    <AddPoint
      onMapClick={(position) =>
        addWaypoint({
          pointX: position[0],
          pointY: position[1],
          pointZ: position[2],
        })
      }
    />
  )
})

AddWaypoint.displayName = 'AddWaypoint'

export default AddWaypoint
