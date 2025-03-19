import useAirlineConfigStore from '@/store/wayline/uav-airline/useAirlineConfig.store'
import AddPoint from '../../components/AddPoint'

type PropsType = unknown

const AddAirPoint: FC<PropsType> = () => {
  const height = useAirlineConfigStore((s) => s.airlineConfig.height)
  const isDrawPoint = useAirlineConfigStore((s) => s.isDrawPoint)
  const addAirPoint = useAirlineConfigStore((s) => s.addAirPoint)

  if (!isDrawPoint) {
    return null
  }

  return (
    <AddPoint
      onMapClick={(geo) =>
        addAirPoint({
          pointX: geo[0],
          pointY: geo[1],
          pointZ: height ?? geo[2],
        })
      }
    />
  )
}

export default memo(AddAirPoint)
