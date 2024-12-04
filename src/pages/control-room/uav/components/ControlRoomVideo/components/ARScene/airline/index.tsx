import { memo, type FC } from 'react'
import ARSceneAirline from './ARSceneAirline'
import useMixARStore from '@/store/control-room/useMixAR.store'

type PropsType = unknown

const UavARSceneAirline: FC<PropsType> = memo(() => {
  const airpointPositions = useMixARStore((s) => s.airpointPositions)

  return (
    <ARSceneAirline
      data={airpointPositions.map((e) => [e.pointX, e.pointY, e.pointZ])}
    />
  )
})

UavARSceneAirline.displayName = 'UavARSceneAirline'

export default UavARSceneAirline
